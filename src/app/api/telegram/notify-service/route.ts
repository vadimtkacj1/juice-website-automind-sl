import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { getBotInstance } from '@/lib/telegram-bot';
import TelegramBot from 'node-telegram-bot-api';

// Direct notification function (without setImmediate for better error handling)
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
          async (courierErr: Error | null, couriers: any[]) => {
            if (courierErr) {
              console.error('[Telegram] Error fetching couriers:', courierErr);
              resolve(false);
              return;
            }
            
            if (!couriers || couriers.length === 0) {
              console.error('[Telegram] No active couriers found. Please add couriers in admin panel.');
              resolve(false);
              return;
            }
            
            console.log(`[Telegram] Found ${couriers.length} active courier(s):`, couriers.map(c => `${c.name} (${c.telegram_id})`).join(', '));

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

                const orderMessage = `🆕 New Order #${order.id}\n\n` +
                  `👤 Customer: ${order.customer_name}\n` +
                  `📞 Phone: ${order.customer_phone || 'Not provided'}\n` +
                  `📧 Email: ${order.customer_email || 'Not provided'}\n` +
                  (order.delivery_address ? `📍 Delivery Address: ${order.delivery_address}\n` : '') +
                  `💰 Total: ₪${order.total_amount}\n\n` +
                  `📦 Items:\n${order.items || 'No items'}\n\n` +
                  (order.notes ? `📝 Notes: ${order.notes}\n\n` : '') +
                  `⏰ Order Time: ${new Date(order.created_at).toLocaleString('en-US')}\n\n` +
                  `❓ Did you deliver the order? Click the button to update status.`;

                const keyboard = {
                  inline_keyboard: [[
                    { text: '✅ In Progress', callback_data: `order_accept_${orderId}` }
                  ]]
                };

                let sentCount = 0;
                let errorCount = 0;
                const sendPromises = couriers.map(async (courier: any) => {
                  try {
                    console.log(`[Telegram] Attempting to send to courier ${courier.name} (ID: ${courier.telegram_id})...`);
                    await bot.sendMessage(courier.telegram_id, orderMessage, {
                      reply_markup: keyboard
                    });
                    console.log(`[Telegram] ✅ Successfully sent to courier ${courier.name} (${courier.telegram_id})`);
                    sentCount++;
                  } catch (error: any) {
                    errorCount++;
                    console.error(`[Telegram] ❌ Error sending to ${courier.name} (${courier.telegram_id}):`, error.message);
                    if (error.message?.includes('chat not found') || error.message?.includes('bot was blocked')) {
                      console.error(`[Telegram] ⚠️ Courier ${courier.name} needs to start a chat with the bot first!`);
                    }
                  }
                });

                await Promise.all(sendPromises);
                console.log(`[Telegram] Summary: Sent ${sentCount}/${couriers.length} notifications for order #${orderId}, ${errorCount} errors`);
                
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

