import TelegramBot from 'node-telegram-bot-api';
import getDatabase from './database';

let botInstance: TelegramBot | null = null;
let botPolling: boolean = false;
let pollingErrorCount: number = 0;
const MAX_POLLING_ERRORS = 5;
let pollingRetryTimeout: NodeJS.Timeout | null = null;
let notificationIntervals: Map<number, NodeJS.Timeout> = new Map();
let reminderIntervals: Map<number, NodeJS.Timeout> = new Map();

// Validate Telegram bot token by making a test API call
async function validateBotToken(token: string): Promise<boolean> {
  try {
    const testBot = new TelegramBot(token, { polling: false });
    await testBot.getMe();
    return true;
  } catch (error: any) {
    console.error('Invalid Telegram bot token:', error.message);
    return false;
  }
}

// Check if standalone service is available
async function isServiceAvailable(): Promise<boolean> {
  try {
    const http = require('http');
    const serviceUrl = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3001';
    const url = new URL(serviceUrl);
    
    return new Promise((resolve) => {
      const req = http.get(`${url.protocol}//${url.host}/health`, (res: any) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => {
        req.destroy();
        resolve(false);
      });
    });
  } catch {
    // Service not available - that's okay, we'll use direct polling
    return false;
  }
}

export async function getBotInstance(enablePolling: boolean = false): Promise<TelegramBot | null> {
  const db = getDatabase();

  return new Promise(async (resolve) => {
    // If standalone service is available, don't start polling in main app
    const serviceAvailable = await isServiceAvailable();
    if (serviceAvailable && enablePolling) {
      console.log('[Telegram] Standalone service is running. Polling disabled in main app to avoid conflicts.');
      enablePolling = false;
    }

    db.get(
      'SELECT * FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
      async (err: Error | null, settings: any) => {
        if (err || !settings || !settings.api_token) {
          resolve(null);
          return;
        }

        // Validate token before creating bot instance
        const isValid = await validateBotToken(settings.api_token);
        if (!isValid) {
          console.error('Telegram bot token validation failed. Please check your API token in admin settings.');
          resolve(null);
          return;
        }

        if (botInstance && botInstance.token === settings.api_token) {
          // If polling is requested and not already started, start it (only if service not available)
          if (enablePolling && !botPolling && !serviceAvailable) {
            await startPollingSafely(botInstance);
          }
          resolve(botInstance);
          return;
        }

        // Stop old bot instance if exists
        if (botInstance) {
          try {
            botInstance.stopPolling();
          } catch (e) {
            // Ignore errors when stopping
          }
          botInstance = null;
          botPolling = false;
        }

        // Create new bot instance
        try {
          botInstance = new TelegramBot(settings.api_token, { 
            polling: false, // Never start polling in main app if service is available
            onlyFirstMatch: false
          });
          
          setupBotHandlers(botInstance);
          setupErrorHandlers(botInstance);
          
          // Only start polling if service is not available
          if (enablePolling && !serviceAvailable) {
            await startPollingSafely(botInstance);
          }
          
          resolve(botInstance);
        } catch (error: any) {
          console.error('Error creating Telegram bot:', error.message);
          botInstance = null;
          resolve(null);
        }
      }
    );
  });
}

async function startPollingSafely(bot: TelegramBot) {
  if (botPolling) {
    return; // Already polling
  }

  try {
    bot.startPolling({
      restart: true,
      polling: {
        interval: 1000,
        autoStart: false,
        params: {
          timeout: 10
        }
      }
    });
    
    botPolling = true;
    pollingErrorCount = 0;
    console.log('Telegram bot polling started successfully');
  } catch (error: any) {
    console.error('Error starting Telegram bot polling:', error.message);
    botPolling = false;
  }
}

function setupErrorHandlers(bot: TelegramBot) {
  // Handle polling errors gracefully
  bot.on('polling_error', (error: any) => {
    pollingErrorCount++;
    
    // Only log first few errors to avoid spam
    if (pollingErrorCount <= 3) {
      console.error(`[Telegram Bot] Polling error (${pollingErrorCount}/${MAX_POLLING_ERRORS}):`, error.message);
    }
    
    // Stop polling after too many errors
    if (pollingErrorCount >= MAX_POLLING_ERRORS) {
      console.error('[Telegram Bot] Too many polling errors. Stopping polling. Please check your bot token.');
      try {
        bot.stopPolling();
        botPolling = false;
        pollingErrorCount = 0;
      } catch (e) {
        // Ignore stop errors
      }
    }
  });

  // Handle webhook errors
  bot.on('webhook_error', (error: any) => {
    console.error('[Telegram Bot] Webhook error:', error.message);
  });

  // Handle general errors
  bot.on('error', (error: any) => {
    // Only log non-polling errors to avoid spam
    if (!error.message?.includes('polling')) {
      console.error('[Telegram Bot] Error:', error.message);
    }
  });
}

function setupBotHandlers(bot: TelegramBot) {
  // Handle callback queries (button clicks)
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const courierTelegramId = query.from.id.toString();

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
  });
}

export async function sendOrderNotification(orderId: number) {
  // Run asynchronously without blocking
  setImmediate(async () => {
    try {
      const db = getDatabase();
      const bot = await getBotInstance();

      if (!bot) {
        console.log('[Telegram] Bot is not configured or enabled');
        return;
      }

      await sendOrderNotificationInternal(orderId, bot, db);
    } catch (error: any) {
      console.error('[Telegram] Error sending order notification:', error.message);
    }
  });
}

async function sendOrderNotificationInternal(orderId: number, bot: TelegramBot, db: any): Promise<void> {
  return new Promise((resolve) => {
    // Get order details
    db.get(
      `SELECT o.*, 
        GROUP_CONCAT(oi.item_name || ' x' || oi.quantity, '\n') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId],
      async (err: Error | null, order: any) => {
        if (err || !order) {
          console.error('[Telegram] Error fetching order:', err);
          resolve();
          return;
        }

        // Get active couriers
        db.all(
          'SELECT * FROM telegram_couriers WHERE is_active = 1',
          async (courierErr: Error | null, couriers: any[]) => {
            if (courierErr || !couriers || couriers.length === 0) {
              console.log('[Telegram] No active couriers found');
              resolve();
              return;
            }

            // Check if notification already exists
            db.get(
              'SELECT * FROM order_telegram_notifications WHERE order_id = ?',
              [orderId],
              async (notifErr: Error | null, existing: any) => {
                if (notifErr) {
                  console.error('[Telegram] Error checking existing notification:', notifErr);
                  resolve();
                  return;
                }

                // If order is already assigned, don't send notifications
                if (existing && existing.status === 'in_progress') {
                  resolve();
                  return;
                }

                // Create or update notification record
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

                // Format order message
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

                // Send to all active couriers
                const keyboard = {
                  inline_keyboard: [[
                    { text: '✅ In Progress', callback_data: `order_accept_${orderId}` }
                  ]]
                };

                // Send messages asynchronously without blocking
                let sentCount = 0;
                const sendPromises = couriers.map(async (courier) => {
                  try {
                    await bot.sendMessage(courier.telegram_id, orderMessage, {
                      reply_markup: keyboard
                    });
                    sentCount++;
                  } catch (error: any) {
                    // Silently handle errors - don't spam console
                    if (error.message && !error.message.includes('blocked') && !error.message.includes('chat not found')) {
                      console.error(`[Telegram] Error sending to courier ${courier.telegram_id}:`, error.message);
                    }
                  }
                });
                
                // Don't wait for all messages, resolve immediately
                Promise.all(sendPromises).catch(() => {
                  // Ignore errors
                });

                // Set up periodic notifications (every 5 minutes) - non-blocking
                if (!notificationIntervals.has(orderId)) {
                  const interval = setInterval(() => {
                    // Run asynchronously
                    setImmediate(async () => {
                      try {
                        db.get(
                          'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                          [orderId],
                          async (checkErr: Error | null, notif: any) => {
                            if (!checkErr && notif && notif.status === 'pending') {
                              // Resend notification asynchronously
                              couriers.forEach(async (courier) => {
                                try {
                                  await bot.sendMessage(courier.telegram_id, orderMessage, {
                                    reply_markup: keyboard
                                  });
                                } catch (error: any) {
                                  // Silently handle errors
                                }
                              });
                            } else {
                              // Stop interval if order is assigned
                              clearInterval(interval);
                              notificationIntervals.delete(orderId);
                            }
                          }
                        );
                      } catch (error) {
                        // Ignore errors
                      }
                    });
                  }, 5 * 60 * 1000); // 5 minutes

                  notificationIntervals.set(orderId, interval);
                }

                resolve();
              }
            );
          }
        );
      }
    );
  });
}

export async function handleOrderAccept(orderId: number, courierTelegramId: string) {
  const db = getDatabase();
  const bot = await getBotInstance();

  if (!bot) {
    return false;
  }

  return new Promise((resolve) => {
    // Check if order is already assigned
    db.get(
      'SELECT * FROM order_telegram_notifications WHERE order_id = ?',
      [orderId],
      async (err: Error | null, notification: any) => {
        if (err) {
          console.error('Error checking notification:', err);
          resolve(false);
          return;
        }

        if (notification && notification.status === 'in_progress') {
          // Order already assigned
          try {
            await bot.sendMessage(courierTelegramId, '❌ This order has already been taken by another courier.');
          } catch (error) {
            console.error('Error sending message:', error);
          }
          resolve(false);
          return;
        }

        // Get courier name
        db.get(
          'SELECT name FROM telegram_couriers WHERE telegram_id = ?',
          [courierTelegramId],
          async (courierErr: Error | null, courier: any) => {
            const courierName = courier?.name || 'Курьер';

            // Update notification
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

            // Update order status
            db.run(
              'UPDATE orders SET status = ? WHERE id = ?',
              ['in_progress', orderId]
            );

            // Stop notification interval
            if (notificationIntervals.has(orderId)) {
              clearInterval(notificationIntervals.get(orderId)!);
              notificationIntervals.delete(orderId);
            }

            // Get order details for Stage 2 message
            db.get(
              `SELECT o.*, 
                GROUP_CONCAT(oi.item_name || ' x' || oi.quantity, '\n') as items
               FROM orders o
               LEFT JOIN order_items oi ON o.id = oi.order_id
               WHERE o.id = ?
               GROUP BY o.id`,
              [orderId],
              async (orderErr: Error | null, order: any) => {
                if (orderErr || !order) {
                  console.error('Error fetching order for Stage 2:', orderErr);
                  return;
                }

                // Send confirmation to courier (Stage 2)
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
                  console.error('Error sending confirmation:', error);
                }
              }
            );

            // Stage 2: Start 1-hour reminders (no delay)
            const reminderInterval = setInterval(async () => {
                    // Check if order is delivered
                    db.get(
                      'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                      [orderId],
                      async (checkErr: Error | null, notif: any) => {
                        if (!checkErr && notif && notif.status === 'in_progress') {
                          // Send reminder
                          try {
                            const now = new Date().toISOString();
                            db.run(
                              'UPDATE order_telegram_notifications SET last_reminder_at = ? WHERE order_id = ?',
                              [now, orderId]
                            );

                            // Get order details for reminder
                            db.get(
                              `SELECT o.*, 
                                GROUP_CONCAT(oi.item_name || ' x' || oi.quantity, '\n') as items
                               FROM orders o
                               LEFT JOIN order_items oi ON o.id = oi.order_id
                               WHERE o.id = ?
                               GROUP BY o.id`,
                              [orderId],
                              async (orderErr: Error | null, order: any) => {
                                if (!orderErr && order) {
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
                                }
                              }
                            );
                          } catch (error) {
                            console.error('Error sending reminder:', error);
                          }
                        } else {
                          // Stop reminder if delivered
                          clearInterval(reminderInterval);
                          reminderIntervals.delete(orderId);
                        }
                      }
                    );
            }, 60 * 60 * 1000); // 1 hour interval

            reminderIntervals.set(orderId, reminderInterval);

            resolve(true);
          }
        );
      }
    );
  });
}

export async function handleOrderDelivered(orderId: number, courierTelegramId: string) {
  const db = getDatabase();
  const bot = await getBotInstance();

  if (!bot) {
    return false;
  }

  return new Promise((resolve) => {
    // Verify courier owns this order
    db.get(
      'SELECT * FROM order_telegram_notifications WHERE order_id = ? AND courier_telegram_id = ?',
      [orderId, courierTelegramId],
      async (err: Error | null, notification: any) => {
        if (err || !notification || notification.status !== 'in_progress') {
          try {
            await bot.sendMessage(courierTelegramId, '❌ Error: Order not found or already delivered.');
          } catch (error) {
            console.error('Error sending message:', error);
          }
          resolve(false);
          return;
        }

        // Update notification
        const now = new Date().toISOString();
        db.run(
          `UPDATE order_telegram_notifications 
           SET status = 'delivered', delivered_at = ?
           WHERE order_id = ?`,
          [now, orderId]
        );

        // Update order status
        db.run(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['delivered', orderId]
        );

        // Stop all reminder intervals (Stage 1 and Stage 2)
        if (notificationIntervals.has(orderId)) {
          clearInterval(notificationIntervals.get(orderId)!);
          notificationIntervals.delete(orderId);
        }
        if (reminderIntervals.has(orderId)) {
          clearInterval(reminderIntervals.get(orderId)!);
          reminderIntervals.delete(orderId);
        }

        // Send confirmation
        try {
          await bot.sendMessage(
            courierTelegramId,
            `✅ Order #${orderId} has been delivered successfully! Thank you for your work!`
          );
        } catch (error) {
          console.error('Error sending confirmation:', error);
        }

        resolve(true);
      }
    );
  });
}

