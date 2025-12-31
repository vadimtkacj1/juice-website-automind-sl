/**
 * Telegram Bot Service
 * 
 * Standalone service for handling Telegram bot operations.
 * Can be run independently from the main Next.js application.
 * 
 * Usage:
 *   node services/telegram-bot-service.js
 *   or
 *   npm run telegram:service
 */

const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const http = require('http');

// Configuration
const DB_PATH = path.join(process.cwd(), 'juice_website.db');
const SERVICE_PORT = process.env.TELEGRAM_SERVICE_PORT || 3001;
const POLLING_INTERVAL = 1000; // 1 second
const MAX_POLLING_ERRORS = 5;

// State
let bot = null;
let db = null;
let isPolling = false;
let pollingErrorCount = 0;
let notificationIntervals = new Map(); // Stage 1: 1-minute reminders (5 times)
let reminderIntervals = new Map(); // Stage 2: 1-hour reminders
let notificationCounts = new Map(); // Track how many times Stage 1 notification was sent

// Initialize database connection
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('[Telegram Service] Database connection error:', err.message);
        reject(err);
        return;
      }
      console.log('[Telegram Service] Connected to database');
      resolve();
    });
  });
}

// Get bot settings from database
function getBotSettings() {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
      (err, settings) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(settings);
      }
    );
  });
}

// Initialize bot
async function initBot() {
  try {
    const settings = await getBotSettings();
    
    if (!settings || !settings.api_token) {
      console.log('[Telegram Service] Bot is not configured or disabled');
      return false;
    }

    // Validate token
    const testBot = new TelegramBot(settings.api_token, { polling: false });
    await testBot.getMe();
    
    // Create bot instance
    bot = new TelegramBot(settings.api_token, { polling: false });
    
    // Setup handlers
    setupBotHandlers(bot);
    setupErrorHandlers(bot);
    
    // Start polling
    await startPolling();
    
    console.log('[Telegram Service] Bot initialized successfully');
    return true;
  } catch (error) {
    console.error('[Telegram Service] Bot initialization error:', error.message);
    return false;
  }
}

// Start polling
async function startPolling() {
  if (isPolling) {
    return;
  }

  try {
    bot.startPolling({
      restart: true,
      polling: {
        interval: POLLING_INTERVAL,
        autoStart: false,
        params: {
          timeout: 10
        }
      }
    });
    
    isPolling = true;
    pollingErrorCount = 0;
    console.log('[Telegram Service] Polling started');
  } catch (error) {
    console.error('[Telegram Service] Polling start error:', error.message);
    isPolling = false;
  }
}

// Stop polling
function stopPolling() {
  if (bot && isPolling) {
    try {
      bot.stopPolling();
      isPolling = false;
      console.log('[Telegram Service] Polling stopped');
    } catch (error) {
      console.error('[Telegram Service] Polling stop error:', error.message);
    }
  }
}

// Setup bot handlers
function setupBotHandlers(bot) {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const courierTelegramId = query.from.id.toString();

    try {
      if (data?.startsWith('order_accept_')) {
        const orderId = parseInt(data.replace('order_accept_', ''));
        await handleOrderAccept(orderId, courierTelegramId);
        bot.answerCallbackQuery(query.id, { text: 'Order assigned to you!' });
      }

      if (data?.startsWith('order_delivered_')) {
        const orderId = parseInt(data.replace('order_delivered_', ''));
        await handleOrderDelivered(orderId, courierTelegramId);
        bot.answerCallbackQuery(query.id, { text: 'Order marked as delivered!' });
      }
    } catch (error) {
      console.error('[Telegram Service] Callback query error:', error.message);
    }
  });
}

// Setup error handlers
function setupErrorHandlers(bot) {
  bot.on('polling_error', (error) => {
    pollingErrorCount++;
    
    if (pollingErrorCount <= 3) {
      console.error(`[Telegram Service] Polling error (${pollingErrorCount}/${MAX_POLLING_ERRORS}):`, error.message);
    }
    
    if (pollingErrorCount >= MAX_POLLING_ERRORS) {
      console.error('[Telegram Service] Too many polling errors. Stopping polling.');
      stopPolling();
      pollingErrorCount = 0;
    }
  });

  bot.on('error', (error) => {
    if (!error.message?.includes('polling')) {
      console.error('[Telegram Service] Error:', error.message);
    }
  });
}

// Handle order acceptance
async function handleOrderAccept(orderId, courierTelegramId) {
  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM order_telegram_notifications WHERE order_id = ?',
      [orderId],
      async (err, notification) => {
        if (err) {
          console.error('[Telegram Service] Error checking notification:', err);
          resolve(false);
          return;
        }

        if (notification && notification.status === 'in_progress') {
          try {
            await bot.sendMessage(courierTelegramId, '❌ This order has already been taken by another courier.');
          } catch (error) {
            // Ignore
          }
          resolve(false);
          return;
        }

        const now = new Date().toISOString();
        if (notification) {
          db.run(
            `UPDATE order_telegram_notifications 
             SET courier_telegram_id = ?, status = 'in_progress', assigned_at = ?
             WHERE order_id = ?`,
            [courierTelegramId, now, orderId]
          );
        } else {
          db.run(
            `INSERT INTO order_telegram_notifications (order_id, courier_telegram_id, status, assigned_at, created_at)
             VALUES (?, ?, 'in_progress', ?, ?)`,
            [orderId, courierTelegramId, now, now]
          );
        }

        db.run('UPDATE orders SET status = ? WHERE id = ?', ['in_progress', orderId]);

        // Stop Stage 1 notification interval
        if (notificationIntervals.has(orderId)) {
          clearInterval(notificationIntervals.get(orderId));
          notificationIntervals.delete(orderId);
          notificationCounts.delete(orderId);
          console.log(`[Telegram Service] Stopped Stage 1 reminders for order #${orderId}`);
        }

        // Get order details for Stage 2 reminders
        db.get(
          `SELECT o.*, 
            GROUP_CONCAT(oi.item_name || ' x' || oi.quantity, '\n') as items
           FROM orders o
           LEFT JOIN order_items oi ON o.id = oi.order_id
           WHERE o.id = ?
           GROUP BY o.id`,
          [orderId],
          async (orderErr, order) => {
            if (orderErr || !order) {
              console.error(`[Telegram Service] Error fetching order #${orderId} for Stage 2:`, orderErr);
              return;
            }

            // Send confirmation with Stage 2 message
            const stage2Message = `✅ Order #${orderId} is now in progress!\n\n` +
              `👤 Customer: ${order.customer_name}\n` +
              `📞 Phone: ${order.customer_phone || 'Not provided'}\n` +
              (order.delivery_address ? `📍 Delivery Address: ${order.delivery_address}\n` : '') +
              `\n❓ Did you deliver the order? Click the button to update status.`;

            try {
              await bot.sendMessage(
                courierTelegramId,
                stage2Message,
                {
                  reply_markup: {
                    inline_keyboard: [[
                      { text: '✅ Done', callback_data: `order_delivered_${orderId}` }
                    ]]
                  }
                }
              );
            } catch (error) {
              console.error(`[Telegram Service] Error sending Stage 2 confirmation:`, error);
            }

            // Stage 2: Start 1-hour reminders
            const reminderInterval = setInterval(() => {
              db.get(
                'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                [orderId],
                async (checkErr, notif) => {
                  if (!checkErr && notif && notif.status === 'in_progress') {
                    try {
                      const now = new Date().toISOString();
                      db.run(
                        'UPDATE order_telegram_notifications SET last_reminder_at = ? WHERE order_id = ?',
                        [now, orderId]
                      );

                      const reminderMessage = `⏰ Reminder: Order #${orderId}\n\n` +
                        `👤 Customer: ${order.customer_name}\n` +
                        (order.delivery_address ? `📍 Delivery Address: ${order.delivery_address}\n` : '') +
                        `\n❓ Did you deliver the order? Click the button to update status.`;

                      await bot.sendMessage(
                        courierTelegramId,
                        reminderMessage,
                        {
                          reply_markup: {
                            inline_keyboard: [[
                              { text: '✅ Done', callback_data: `order_delivered_${orderId}` }
                            ]]
                          }
                        }
                      );
                      console.log(`[Telegram Service] Stage 2 reminder sent for order #${orderId}`);
                    } catch (error) {
                      console.error(`[Telegram Service] Error sending Stage 2 reminder:`, error);
                    }
                  } else {
                      // Status changed, stop reminders
                      clearInterval(reminderInterval);
                      reminderIntervals.delete(orderId);
                      console.log(`[Telegram Service] Stopped Stage 2 reminders for order #${orderId}`);
                    }
                  }
              );
            }, 60 * 60 * 1000); // 1 hour interval

            reminderIntervals.set(orderId, reminderInterval);
            console.log(`[Telegram Service] Started Stage 2 reminders (1 hour intervals) for order #${orderId}`);
          }
        );

        resolve(true);
      }
    );
  });
}

// Handle order delivery
async function handleOrderDelivered(orderId, courierTelegramId) {
  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM order_telegram_notifications WHERE order_id = ? AND courier_telegram_id = ?',
      [orderId, courierTelegramId],
      async (err, notification) => {
        if (err || !notification || notification.status !== 'in_progress') {
          try {
            await bot.sendMessage(courierTelegramId, '❌ Error: Order not found or already delivered.');
          } catch (error) {
            // Ignore
          }
          resolve(false);
          return;
        }

        const now = new Date().toISOString();
        db.run(
          `UPDATE order_telegram_notifications 
           SET status = 'delivered', delivered_at = ?
           WHERE order_id = ?`,
          [now, orderId]
        );

        db.run('UPDATE orders SET status = ? WHERE id = ?', ['delivered', orderId]);

        // Stop all reminder intervals (Stage 1 and Stage 2)
        if (notificationIntervals.has(orderId)) {
          clearInterval(notificationIntervals.get(orderId));
          notificationIntervals.delete(orderId);
          notificationCounts.delete(orderId);
        }
        if (reminderIntervals.has(orderId)) {
          clearInterval(reminderIntervals.get(orderId));
          reminderIntervals.delete(orderId);
        }
        console.log(`[Telegram Service] Stopped all reminders for order #${orderId} (order completed)`);

        try {
          await bot.sendMessage(
            courierTelegramId,
            `✅ Order #${orderId} has been delivered successfully! Thank you for your work!`
          );
        } catch (error) {
          // Ignore
        }

        resolve(true);
      }
    );
  });
}

// Send order notification
async function sendOrderNotification(orderId) {
  console.log(`[Telegram Service] Sending notification for order #${orderId}`);
  return new Promise((resolve) => {
    db.get(
      `SELECT o.*, 
        GROUP_CONCAT(oi.item_name || ' x' || oi.quantity, '\n') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId],
      async (err, order) => {
        if (err) {
          console.error(`[Telegram Service] Error fetching order #${orderId}:`, err.message);
          resolve(false);
          return;
        }
        
        if (!order) {
          console.error(`[Telegram Service] Order #${orderId} not found`);
          resolve(false);
          return;
        }

        console.log(`[Telegram Service] Order #${orderId} found: ${order.customer_name}, Total: ₪${order.total_amount}`);

        db.all(
          'SELECT * FROM telegram_couriers WHERE is_active = 1',
          async (courierErr, couriers) => {
            if (courierErr) {
              console.error('[Telegram Service] Error fetching couriers:', courierErr.message);
              resolve(false);
              return;
            }
            
            if (!couriers || couriers.length === 0) {
              console.error('[Telegram Service] No active couriers found');
              resolve(false);
              return;
            }

            console.log(`[Telegram Service] Found ${couriers.length} active courier(s)`);

            db.get(
              'SELECT * FROM order_telegram_notifications WHERE order_id = ?',
              [orderId],
              async (notifErr, existing) => {
                if (notifErr) {
                  resolve(false);
                  return;
                }

                if (existing && existing.status === 'in_progress') {
                  resolve(false);
                  return;
                }

                const now = new Date().toISOString();
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

                // Create reminder message for Stage 1
                const orderMessage = `🆕 New Order #${order.id}\n\n` +
                  `👤 Customer: ${order.customer_name}\n` +
                  `📞 Phone: ${order.customer_phone || 'Not provided'}\n` +
                  `📧 Email: ${order.customer_email || 'Not provided'}\n` +
                  (order.delivery_address ? `📍 Delivery Address: ${order.delivery_address}\n` : '') +
                  `💰 Total: ₪${order.total_amount.toFixed(2)}\n\n` +
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
                
                for (const courier of couriers) {
                  try {
                    console.log(`[Telegram Service] Sending to courier ${courier.name} (${courier.telegram_id})...`);
                    await bot.sendMessage(courier.telegram_id, orderMessage, {
                      reply_markup: keyboard
                    });
                    console.log(`[Telegram Service] ✅ Sent to ${courier.name}`);
                    sentCount++;
                  } catch (error) {
                    errorCount++;
                    console.error(`[Telegram Service] ❌ Error sending to ${courier.name} (${courier.telegram_id}):`, error.message);
                    if (error.message?.includes('chat not found') || error.message?.includes('bot was blocked')) {
                      console.error(`[Telegram Service] ⚠️ Courier ${courier.name} needs to start chat with bot first!`);
                    }
                  }
                }
                
                console.log(`[Telegram Service] Summary: Sent ${sentCount}/${couriers.length} notifications, ${errorCount} errors`);

                // Stage 1: Set up 1-minute reminders (5 times total)
                if (!notificationIntervals.has(orderId)) {
                  notificationCounts.set(orderId, 1); // First notification already sent
                  
                  const interval = setInterval(() => {
                    db.get(
                      'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                      [orderId],
                      async (checkErr, notif) => {
                        if (!checkErr && notif && notif.status === 'pending') {
                          const count = notificationCounts.get(orderId) || 0;
                          
                          // Stop after 5 notifications (including the initial one)
                          if (count >= 5) {
                            clearInterval(interval);
                            notificationIntervals.delete(orderId);
                            notificationCounts.delete(orderId);
                            console.log(`[Telegram Service] Stopped Stage 1 reminders for order #${orderId} (5 notifications sent)`);
                            return;
                          }
                          
                          // Send reminder to all couriers (reuse the same message format)
                          // We need to fetch order details again or store them
                          db.get(
                            `SELECT o.*, 
                              GROUP_CONCAT(oi.item_name || ' x' || oi.quantity, '\n') as items
                             FROM orders o
                             LEFT JOIN order_items oi ON o.id = oi.order_id
                             WHERE o.id = ?
                             GROUP BY o.id`,
                            [orderId],
                            async (orderFetchErr, orderData) => {
                              if (orderFetchErr || !orderData) {
                                console.error(`[Telegram Service] Error fetching order for reminder:`, orderFetchErr);
                                return;
                              }
                              
                              const reminderMessage = `🆕 New Order #${orderData.id}\n\n` +
                                `👤 Customer: ${orderData.customer_name}\n` +
                                `📞 Phone: ${orderData.customer_phone || 'Not provided'}\n` +
                                `📧 Email: ${orderData.customer_email || 'Not provided'}\n` +
                                (orderData.delivery_address ? `📍 Delivery Address: ${orderData.delivery_address}\n` : '') +
                                `💰 Total: ₪${orderData.total_amount.toFixed(2)}\n\n` +
                                `📦 Items:\n${orderData.items || 'No items'}\n\n` +
                                (orderData.notes ? `📝 Notes: ${orderData.notes}\n\n` : '') +
                                `⏰ Order Time: ${new Date(orderData.created_at).toLocaleString('en-US')}\n\n` +
                                `❓ Did you deliver the order? Click the button to update status.`;
                              
                              const reminderKeyboard = {
                                inline_keyboard: [[
                                  { text: '✅ In Progress', callback_data: `order_accept_${orderId}` }
                                ]]
                              };
                              
                              // Send reminder to all couriers
                              for (const courier of couriers) {
                                try {
                                  await bot.sendMessage(courier.telegram_id, reminderMessage, {
                                    reply_markup: reminderKeyboard
                                  });
                                  console.log(`[Telegram Service] Stage 1 reminder ${count + 1}/5 sent to ${courier.name} for order #${orderId}`);
                                } catch (error) {
                                  // Ignore errors
                                }
                              }
                              
                              notificationCounts.set(orderId, count + 1);
                            }
                          );
                        } else {
                          // Status changed, stop reminders
                          clearInterval(interval);
                          notificationIntervals.delete(orderId);
                          notificationCounts.delete(orderId);
                        }
                      }
                    );
                  }, 1 * 60 * 1000); // 1 minute interval

                  notificationIntervals.set(orderId, interval);
                  console.log(`[Telegram Service] Started Stage 1 reminders (1 min intervals, max 5) for order #${orderId}`);
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

// HTTP server for receiving notifications from main app
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/notify-order') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('[Telegram Service] Received notification request');
        const { orderId } = JSON.parse(body);
        
        if (!orderId) {
          console.error('[Telegram Service] Order ID missing in request');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Order ID is required' }));
          return;
        }

        console.log(`[Telegram Service] Processing notification for order #${orderId}`);
        const result = await sendOrderNotification(orderId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: result,
          message: result ? 'Notification sent' : 'Failed to send notification'
        }));
      } catch (error) {
        console.error('[Telegram Service] Error processing notification:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      polling: isPolling,
      bot_configured: bot !== null
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Telegram Service] Shutting down gracefully...');
  stopPolling();
  if (db) {
    db.close();
  }
  server.close(() => {
    console.log('[Telegram Service] Service stopped');
    process.exit(0);
  });
});

// Main initialization
async function main() {
  console.log('[Telegram Service] Starting Telegram Bot Service...');
  console.log(`[Telegram Service] Port: ${SERVICE_PORT}`);
  
  try {
    await initDatabase();
    await initBot();
    
    server.listen(SERVICE_PORT, () => {
      console.log(`[Telegram Service] HTTP server listening on port ${SERVICE_PORT}`);
      console.log('[Telegram Service] Service is ready!');
      console.log('[Telegram Service] Endpoints:');
      console.log(`  POST http://localhost:${SERVICE_PORT}/notify-order - Send order notification`);
      console.log(`  GET  http://localhost:${SERVICE_PORT}/health - Health check`);
    });
  } catch (error) {
    console.error('[Telegram Service] Initialization failed:', error.message);
    process.exit(1);
  }
}

// Start service
if (require.main === module) {
  main();
}

module.exports = { main, sendOrderNotification };

