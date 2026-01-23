import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getBotInstance } from '@/lib/telegram-bot';
import TelegramBot from 'node-telegram-bot-api';

// Direct notification function (without setImmediate for better error handling)
// Now properly filters by role like the main telegram-bot.ts implementation
async function sendOrderNotificationDirect(orderId: number, bot: TelegramBot, db: any): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    db.get(
      `SELECT o.*,
        GROUP_CONCAT(CONCAT(oi.item_name, ' x', oi.quantity) SEPARATOR '\n') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId],
      async (err: Error | null, order: any) => {
        if (err || !order) {
          console.error('[Telegram] Error fetching order:', err);
          resolve(false);
          return;
        }

        db.all(
          'SELECT * FROM telegram_couriers WHERE is_active = 1',
          async (courierErr: Error | null, recipients: any[]) => {
            if (courierErr) {
              console.error('[Telegram] Error fetching couriers:', courierErr);
              resolve(false);
              return;
            }

            if (!recipients || recipients.length === 0) {
              console.error('[Telegram] No active couriers found. Please add couriers in admin panel.');
              resolve(false);
              return;
            }

            console.log(`[Telegram] Found ${recipients.length} active courier(s):`, recipients.map(c => `${c.name} (${c.telegram_id}) [${c.role}]`).join(', '));

            db.get(
              'SELECT * FROM order_telegram_notifications WHERE order_id = ?',
              [orderId],
              async (notifErr: Error | null, existing: any) => {
                if (notifErr) {
                  console.error('[Telegram] Error checking notification:', notifErr);
                  resolve(false);
                  return;
                }

                if (existing && existing.status === 'in_progress') {
                  resolve(false);
                  return;
                }

                // Convert ISO string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                if (existing) {
                  db.run(
                    `UPDATE order_telegram_notifications
                     SET last_notification_sent_at = ?, status = 'pending'
                     WHERE order_id = ?`,
                    [now, orderId]
                  );
                } else {
                  db.run(
                    `INSERT INTO order_telegram_notifications (order_id, status, last_notification_sent_at, created_at)
                     VALUES (?, 'pending', ?, ?)`,
                    [orderId, now, now]
                  );
                }

                // Filter recipients by role
                const kitchenRecipients = recipients.filter(r => r.role === 'kitchen');
                const deliveryRecipients = recipients.filter(r => r.role === 'delivery');
                const observerRecipients = recipients.filter(r => r.role === 'observer');

                // Kitchen message (no buttons) - Hebrew
                const kitchenMessage = `🍳 הזמנה חדשה #${order.id}\n\n` +
                  `👤 לקוח: ${order.customer_name}\n` +
                  `📞 טלפון: ${order.customer_phone || 'לא צוין'}\n` +
                  `📧 אימייל: ${order.customer_email || 'לא צוין'}\n` +
                  (order.delivery_address ? `📍 כתובת למשלוח: ${order.delivery_address}\n` : '') +
                  `💰 סכום: ₪${order.total_amount}\n\n` +
                  `📦 פרטי ההזמנה:\n${order.items || 'אין פריטים'}\n\n` +
                  (order.notes ? `📝 הערות: ${order.notes}\n\n` : '') +
                  `⏰ זמן הזמנה: ${new Date(order.created_at).toLocaleString('he-IL')}`;

                // Delivery message (with buttons) - Hebrew
                const deliveryMessage = `🚗 משלוח חדש #${order.id}\n\n` +
                  `👤 לקוח: ${order.customer_name}\n` +
                  `📞 טלפון: ${order.customer_phone || 'לא צוין'}\n` +
                  `📧 אימייל: ${order.customer_email || 'לא צוין'}\n` +
                  (order.delivery_address ? `📍 כתובת למשלוח: ${order.delivery_address}\n` : '') +
                  `💰 סכום: ₪${order.total_amount}\n\n` +
                  `📦 פרטי ההזמנה:\n${order.items || 'אין פריטים'}\n\n` +
                  (order.notes ? `📝 הערות: ${order.notes}\n\n` : '') +
                  `⏰ זמן הזמנה: ${new Date(order.created_at).toLocaleString('he-IL')}\n\n` +
                  `❓ תרצה לקחת את ההזמנה?`;

                // Observer message (info only) - Hebrew
                const observerMessage = `👁️ הזמנה חדשה (מידע) #${order.id}\n\n` +
                  `👤 לקוח: ${order.customer_name}\n` +
                  (order.delivery_address ? `📍 כתובת: ${order.delivery_address}\n` : '') +
                  `💰 סכום: ₪${order.total_amount}\n` +
                  `📦 פריטים: ${order.items?.split('\n').length || 0}\n` +
                  `⏰ זמן: ${new Date(order.created_at).toLocaleString('he-IL')}`;

                const deliveryKeyboard = {
                  inline_keyboard: [[
                    { text: '✅ אישור הזמנה', callback_data: `order_accept_${orderId}` }
                  ]]
                };

                let sentCount = 0;
                let errorCount = 0;

                // Send to Kitchen (no buttons)
                for (const recipient of kitchenRecipients) {
                  try {
                    console.log(`[Telegram] Sending to kitchen ${recipient.name} (ID: ${recipient.telegram_id})...`);
                    await bot.sendMessage(recipient.telegram_id, kitchenMessage);
                    console.log(`[Telegram] ✅ Successfully sent to kitchen ${recipient.name}`);
                    sentCount++;
                  } catch (error: any) {
                    errorCount++;
                    console.error(`[Telegram] ❌ Error sending to kitchen ${recipient.name}:`, error.message);
                    if (error.message?.includes('chat not found') || error.message?.includes('bot was blocked')) {
                      console.error(`[Telegram] ⚠️ Courier ${recipient.name} needs to start a chat with the bot first!`);
                    }
                  }
                }

                // Send to Delivery (with buttons)
                for (const recipient of deliveryRecipients) {
                  try {
                    console.log(`[Telegram] Sending to delivery ${recipient.name} (ID: ${recipient.telegram_id})...`);
                    await bot.sendMessage(recipient.telegram_id, deliveryMessage, {
                      reply_markup: deliveryKeyboard
                    });
                    console.log(`[Telegram] ✅ Successfully sent to delivery ${recipient.name}`);
                    sentCount++;
                  } catch (error: any) {
                    errorCount++;
                    console.error(`[Telegram] ❌ Error sending to delivery ${recipient.name}:`, error.message);
                    if (error.message?.includes('chat not found') || error.message?.includes('bot was blocked')) {
                      console.error(`[Telegram] ⚠️ Courier ${recipient.name} needs to start a chat with the bot first!`);
                    }
                  }
                }

                // Send to Observer (info only)
                for (const recipient of observerRecipients) {
                  try {
                    console.log(`[Telegram] Sending to observer ${recipient.name} (ID: ${recipient.telegram_id})...`);
                    await bot.sendMessage(recipient.telegram_id, observerMessage);
                    console.log(`[Telegram] ✅ Successfully sent to observer ${recipient.name}`);
                    sentCount++;
                  } catch (error: any) {
                    errorCount++;
                    console.error(`[Telegram] ❌ Error sending to observer ${recipient.name}:`, error.message);
                    if (error.message?.includes('chat not found') || error.message?.includes('bot was blocked')) {
                      console.error(`[Telegram] ⚠️ Courier ${recipient.name} needs to start a chat with the bot first!`);
                    }
                  }
                }

                console.log(`[Telegram] Summary: Sent ${sentCount}/${recipients.length} notifications for order #${orderId}, ${errorCount} errors`);
                console.log(`[Telegram] Breakdown: Kitchen=${kitchenRecipients.length}, Delivery=${deliveryRecipients.length}, Observer=${observerRecipients.length}`);

                if (sentCount === 0) {
                  console.error('[Telegram] ⚠️ No notifications were sent! Check:');
                  console.error('  1. Bot token is valid');
                  console.error('  2. Couriers have started a chat with the bot (/start)');
                  console.error('  3. Courier Telegram IDs are correct');
                }

                resolve(sentCount > 0);
              }
            );
          }
        );
      }
    );
  });
}

/**
 * This endpoint forwards order notifications to the standalone Telegram service
 * Falls back to direct notification if service is not available
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    console.log(`[Telegram Notify] Received request for order #${orderId}`);

    if (!orderId) {
      console.error('[Telegram Notify] Order ID is missing');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const serviceUrl = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3001';
    console.log(`[Telegram Notify] Trying to reach service at ${serviceUrl}`);
    
    try {
      // Try to send to standalone service
      const response = await fetch(`${serviceUrl}/notify-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[Telegram Notify] Service responded:`, result);
        return NextResponse.json({ 
          success: true, 
          message: 'Notification sent via Telegram service',
          details: result
        });
      } else {
        const errorText = await response.text();
        console.log(`[Telegram Notify] Service returned error: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      // Service not available, fall back to direct notification
      console.log(`[Telegram Notify] Service not available (${error.message}), using direct notification`);
    }

    // Fallback to direct notification
    console.log('[Telegram Notify] Using direct notification (service unavailable)');
    
    // Call directly (not via setImmediate for better error handling)
    try {
      const getDatabase = (await import('@/lib/database')).default;
      const db = getDatabase(); // Call the function to get the database wrapper
      const { getBotInstance } = await import('@/lib/telegram-bot');
      
      console.log('[Telegram Notify] Getting bot instance...');
      const bot = await getBotInstance();

      if (!bot) {
        console.error('[Telegram Notify] Bot is not configured or enabled');
        return NextResponse.json({ 
          success: false, 
          error: 'Bot is not configured. Please configure bot settings in admin panel.',
          message: 'Check bot settings and ensure bot is enabled' 
        }, { status: 400 });
      }

      console.log('[Telegram Notify] Bot instance obtained, sending notification...');
      // Send notification directly
      const result = await sendOrderNotificationDirect(orderId, bot, db);
      console.log(`[Telegram Notify] Direct notification result: ${result}`);
      
      return NextResponse.json({ 
        success: result,
        message: result ? 'Notification sent directly' : 'Failed to send notification. Check logs for details.'
      });
    } catch (error: any) {
      console.error('[Telegram Notify] Direct notification error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message || 'Failed to send notification',
        message: 'Check server logs for details'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Telegram Notify] Notification error:', error.message);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

