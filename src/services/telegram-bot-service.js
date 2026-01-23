/**
 * Telegram Bot Service - SIMPLIFIED VERSION
 *
 * Standalone service for handling Telegram bot operations.
 * Now with simplified single-interval reminder system and role-based notifications.
 *
 * Usage:
 *   node services/telegram-bot-service.js
 *   or
 *   npm run telegram:service
 */

const TelegramBot = require('node-telegram-bot-api');
const getDatabase = require('../lib/database');
const http = require('http');

// Configuration
const SERVICE_PORT = process.env.TELEGRAM_SERVICE_PORT || 3001;
const POLLING_INTERVAL = 1000;
const MAX_POLLING_ERRORS = 5;

// State
let bot = null;
let db = null;
let isPolling = false;
let pollingErrorCount = 0;

// SIMPLIFIED: Single interval map for all reminders
let orderReminderIntervals = new Map();

// Initialize database connection
function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      db = getDatabase();
      if (!db) {
        reject(new Error('Database connection failed'));
        return;
      }
      console.log('[Telegram Service] Connected to database');
      resolve();
    } catch (err) {
      console.error('[Telegram Service] Database connection error:', err.message);
      reject(err);
    }
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

    // Recover pending orders after restart
    await recoverPendingOrders();

    console.log('[Telegram Service] Bot initialized successfully');
    return true;
  } catch (error) {
    console.error('[Telegram Service] Bot initialization error:', error.message);
    return false;
  }
}

// Recover pending orders after restart
async function recoverPendingOrders() {
  console.log('[Telegram Service] 🔄 Recovering pending orders after restart...');
  
  return new Promise((resolve) => {
    db.all(
      `SELECT otn.*, o.customer_name, o.delivery_address, o.total_amount, o.created_at as order_created_at
       FROM order_telegram_notifications otn
       JOIN orders o ON otn.order_id = o.id
       WHERE otn.status IN ('pending', 'in_progress')
       ORDER BY otn.created_at ASC`,
      async (err, notifications) => {
        if (err) {
          console.error('[Telegram Service] Error fetching pending notifications:', err);
          resolve();
          return;
        }

        if (!notifications || notifications.length === 0) {
          console.log('[Telegram Service] ✅ No pending orders to recover');
          resolve();
          return;
        }

        console.log(`[Telegram Service] 📦 Found ${notifications.length} pending order(s) to recover`);

        const settings = await getBotSettings();
        const reminderInterval = ((settings?.reminder_interval_minutes) || 5) * 60 * 1000;

        for (const notif of notifications) {
          const orderId = notif.order_id;
          
          const orderAge = Date.now() - new Date(notif.order_created_at).getTime();
          const maxOrderAge = 24 * 60 * 60 * 1000; // 24 hours

          if (orderAge > maxOrderAge) {
            console.log(`[Telegram Service] ⏰ Order #${orderId} is too old (${Math.floor(orderAge / 3600000)}h), marking as expired`);
            db.run(
              'UPDATE order_telegram_notifications SET status = ? WHERE order_id = ?',
              ['expired', orderId]
            );
            continue;
          }

          if (notif.status === 'pending') {
            console.log(`[Telegram Service] 🔄 Reactivating reminders for pending order #${orderId}`);
            await restartOrderReminders(orderId, reminderInterval, 'pending');
          } else if (notif.status === 'in_progress' && notif.courier_telegram_id) {
            console.log(`[Telegram Service] 🚗 Reactivating reminders for in-progress order #${orderId}`);
            await restartOrderReminders(orderId, reminderInterval, 'in_progress', notif.courier_telegram_id);
          }
        }

        console.log('[Telegram Service] ✅ Order recovery completed');
        resolve();
      }
    );
  });
}

// Restart order reminders
async function restartOrderReminders(orderId, reminderInterval, status, courierTelegramId) {
  if (orderReminderIntervals.has(orderId)) {
    clearInterval(orderReminderIntervals.get(orderId));
    orderReminderIntervals.delete(orderId);
  }

  const interval = setInterval(() => {
    db.get(
      'SELECT otn.*, o.* FROM order_telegram_notifications otn JOIN orders o ON otn.order_id = o.id WHERE otn.order_id = ?',
      [orderId],
      async (checkErr, data) => {
        if (!checkErr && data && data.status === status) {
          try {
            if (status === 'pending') {
              db.all(
                'SELECT * FROM telegram_couriers WHERE is_active = 1 AND role = ?',
                ['delivery'],
                async (couriersErr, couriers) => {
                  if (!couriersErr && couriers && couriers.length > 0) {
                    const reminderMessage = `🔔 תזכורת: הזמנה #${orderId}\n\n` +
                      `👤 לקוח: ${data.customer_name}\n` +
                      (data.delivery_address ? `📍 כתובת: ${data.delivery_address}\n` : '') +
                      `💰 סכום: ₪${data.total_amount}\n\n` +
                      `❓ תרצה לקחת את ההזמנה?`;

                    for (const courier of couriers) {
                      try {
                        await bot.sendMessage(courier.telegram_id, reminderMessage, {
                          reply_markup: {
                            inline_keyboard: [[
                              { text: '✅ אישור הזמנה', callback_data: `order_accept_${orderId}` }
                            ]]
                          }
                        });
                      } catch (error) {
                        console.error(`[Telegram Service] Error sending reminder to courier ${courier.name}:`, error.message);
                      }
                    }

                    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    db.run(
                      'UPDATE order_telegram_notifications SET last_notification_sent_at = ? WHERE order_id = ?',
                      [now, orderId]
                    );
                  }
                }
              );
            } else if (status === 'in_progress' && courierTelegramId) {
              const reminderMsg = `⏰ תזכורת: הזמנה #${orderId}\n\n` +
                `👤 לקוח: ${data.customer_name}\n` +
                (data.delivery_address ? `📍 כתובת: ${data.delivery_address}\n` : '') +
                `\n❓ ההזמנה נמסרה?`;

              await bot.sendMessage(courierTelegramId, reminderMsg, {
                reply_markup: {
                  inline_keyboard: [[
                    { text: '✅ נמסר', callback_data: `order_delivered_${orderId}` }
                  ]]
                }
              });
            }
          } catch (error) {
            console.error(`[Telegram Service] Error sending reminder for order #${orderId}:`, error.message);
          }
        } else {
          clearInterval(interval);
          orderReminderIntervals.delete(orderId);
        }
      }
    );
  }, reminderInterval);

  orderReminderIntervals.set(orderId, interval);
}

// Start polling
async function startPolling() {
  if (isPolling) return;

  try {
    bot.startPolling({
      restart: true,
      polling: {
        interval: POLLING_INTERVAL,
        autoStart: false,
        params: { timeout: 10 }
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
    const deliveryTelegramId = query.from.id.toString();
    const messageId = query.message?.message_id;
    const chatId = query.message?.chat.id;

    try {
      console.log(`[Telegram Service] 📨 Received callback query: ${data} from user ${deliveryTelegramId}`);

      if (data?.startsWith('order_accept_')) {
        const orderId = parseInt(data.replace('order_accept_', ''));
        const result = await handleOrderAccept(orderId, deliveryTelegramId);
        
        if (result) {
          await bot.answerCallbackQuery(query.id, { 
            text: '✅ ההזמנה התקבלה בהצלחה!',
            show_alert: false 
          });
          
          // Remove buttons from message after acceptance
          if (messageId && chatId) {
            try {
              await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
                chat_id: chatId,
                message_id: messageId
              });
            } catch (e) {
              // Ignore if message is too old or already modified
            }
          }
        } else {
          await bot.answerCallbackQuery(query.id, { 
            text: '❌ ההזמנה כבר נלקחה',
            show_alert: true 
          });
        }
      } else if (data?.startsWith('order_delivered_')) {
        const orderId = parseInt(data.replace('order_delivered_', ''));
        const result = await handleOrderDelivered(orderId, deliveryTelegramId);
        
        if (result) {
          await bot.answerCallbackQuery(query.id, { 
            text: '✅ תודה! ההזמנה סומנה כנמסרה',
            show_alert: false 
          });
          
          // Remove buttons from message after delivery
          if (messageId && chatId) {
            try {
              await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
                chat_id: chatId,
                message_id: messageId
              });
            } catch (e) {
              // Ignore if message is too old or already modified
            }
          }
        } else {
          await bot.answerCallbackQuery(query.id, { 
            text: '❌ שגיאה: לא ניתן לסמן כנמסר',
            show_alert: true 
          });
        }
      } else {
        // Unknown command or outdated message
        await bot.answerCallbackQuery(query.id, { 
          text: 'פעולה לא זמינה',
          show_alert: false 
        });
      }
    } catch (error) {
      console.error('[Telegram Service] Callback query error:', error.message);
      try {
        await bot.answerCallbackQuery(query.id, { 
          text: '❌ Ошибка обработки',
          show_alert: false 
        });
      } catch (e) {
        // Ignore if answer already sent
      }
    }
  });

  // Log all received messages for diagnostics
  bot.on('message', (msg) => {
    console.log(`[Telegram Service] 💬 Received message from ${msg.from?.id}: ${msg.text?.substring(0, 50) || '[no text]'}`);
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

// Handle order acceptance (Delivery only)
async function handleOrderAccept(orderId, deliveryTelegramId) {
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
            await bot.sendMessage(deliveryTelegramId, '❌ Этот заказ уже взят другим курьером.');
          } catch (error) {
            // Ignore
          }
          resolve(false);
          return;
        }

        // Convert ISO string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (notification) {
          db.run(
            `UPDATE order_telegram_notifications
             SET courier_telegram_id = ?, status = 'in_progress', assigned_at = ?
             WHERE order_id = ?`,
            [deliveryTelegramId, now, orderId]
          );
        } else {
          db.run(
            `INSERT INTO order_telegram_notifications (order_id, courier_telegram_id, status, assigned_at, created_at)
             VALUES (?, ?, 'in_progress', ?, ?)`,
            [orderId, deliveryTelegramId, now, now]
          );
        }

        db.run('UPDATE orders SET status = ? WHERE id = ?', ['in_progress', orderId]);

        // Stop pending reminders
        if (orderReminderIntervals.has(orderId)) {
          clearInterval(orderReminderIntervals.get(orderId));
          orderReminderIntervals.delete(orderId);
          console.log(`[Telegram Service] Stopped reminders for order #${orderId}`);
        }

        // Get order details
        db.get(
          `SELECT o.*,
            GROUP_CONCAT(CONCAT(oi.item_name, ' x', oi.quantity) SEPARATOR '\n') as items
           FROM orders o
           LEFT JOIN order_items oi ON o.id = oi.order_id
           WHERE o.id = ?
           GROUP BY o.id`,
          [orderId],
          async (orderErr, order) => {
            if (orderErr || !order) {
              console.error(`[Telegram Service] Error fetching order #${orderId}:`, orderErr);
              return;
            }

            // Send confirmation
            const confirmMessage = `✅ Заказ #${orderId} принят в работу!\n\n` +
              `👤 Клиент: ${order.customer_name}\n` +
              `📞 Телефон: ${order.customer_phone || 'Не указан'}\n` +
              (order.delivery_address ? `📍 Адрес: ${order.delivery_address}\n` : '') +
              `\n❓ Заказ доставлен?`;

            try {
              await bot.sendMessage(
                deliveryTelegramId,
                confirmMessage,
                {
                  reply_markup: {
                    inline_keyboard: [[
                      { text: '✅ Доставлено', callback_data: `order_delivered_${orderId}` }
                    ]]
                  }
                }
              );
            } catch (error) {
              console.error(`[Telegram Service] Error sending confirmation:`, error);
            }

            // SIMPLIFIED: Start reminders with same interval
            db.get(
              'SELECT reminder_interval_minutes FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
              (settingsErr, settings) => {
                const reminderInterval = ((settings?.reminder_interval_minutes || 5) * 60 * 1000);

                const interval = setInterval(() => {
                  db.get(
                    'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                    [orderId],
                    async (checkErr, notif) => {
                      if (!checkErr && notif && notif.status === 'in_progress') {
                        try {
                          // Convert ISO string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
                          const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                          db.run(
                            'UPDATE order_telegram_notifications SET last_reminder_at = ? WHERE order_id = ?',
                            [now, orderId]
                          );

                          const reminderMessage = `⏰ НАПОМИНАНИЕ: Заказ #${orderId}\n\n` +
                            `👤 Клиент: ${order.customer_name}\n` +
                            (order.delivery_address ? `📍 Адрес: ${order.delivery_address}\n` : '') +
                            `\n❓ Заказ доставлен?`;

                          await bot.sendMessage(
                            deliveryTelegramId,
                            reminderMessage,
                            {
                              reply_markup: {
                                inline_keyboard: [[
                                  { text: '✅ Доставлено', callback_data: `order_delivered_${orderId}` }
                                ]]
                              }
                            }
                          );
                          console.log(`[Telegram Service] Reminder sent for order #${orderId}`);
                        } catch (error) {
                          console.error(`[Telegram Service] Error sending reminder:`, error);
                        }
                      } else {
                        clearInterval(interval);
                        orderReminderIntervals.delete(orderId);
                        console.log(`[Telegram Service] Stopped reminders for order #${orderId}`);
                      }
                    }
                  );
                }, reminderInterval);

                orderReminderIntervals.set(orderId, interval);
                console.log(`[Telegram Service] Started reminders for order #${orderId}`);
              }
            );
          }
        );

        resolve(true);
      }
    );
  });
}

// Handle order delivery
async function handleOrderDelivered(orderId, deliveryTelegramId) {
  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM order_telegram_notifications WHERE order_id = ? AND courier_telegram_id = ?',
      [orderId, deliveryTelegramId],
      async (err, notification) => {
        if (err || !notification || notification.status !== 'in_progress') {
          try {
            await bot.sendMessage(deliveryTelegramId, '❌ Ошибка: Заказ не найден или уже доставлен.');
          } catch (error) {
            // Ignore
          }
          resolve(false);
          return;
        }

        // Convert ISO string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.run(
          `UPDATE order_telegram_notifications
           SET status = 'delivered', delivered_at = ?
           WHERE order_id = ?`,
          [now, orderId]
        );

        db.run('UPDATE orders SET status = ? WHERE id = ?', ['delivered', orderId]);

        // Stop all reminders
        if (orderReminderIntervals.has(orderId)) {
          clearInterval(orderReminderIntervals.get(orderId));
          orderReminderIntervals.delete(orderId);
        }
        console.log(`[Telegram Service] Stopped all reminders for order #${orderId} (order completed)`);

        try {
          await bot.sendMessage(
            deliveryTelegramId,
            `✅ Заказ #${orderId} успешно доставлен! Спасибо за работу!`
          );
        } catch (error) {
          // Ignore
        }

        resolve(true);
      }
    );
  });
}

// SIMPLIFIED: Send order notification based on recipient roles
async function sendOrderNotification(orderId) {
  console.log(`[Telegram Service] Sending notification for order #${orderId}`);
  return new Promise((resolve) => {
    db.get(
      `SELECT o.*,
        GROUP_CONCAT(CONCAT(oi.item_name, ' x', oi.quantity) SEPARATOR '\n') as items
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

        // Get all active recipients
        db.all(
          'SELECT * FROM telegram_couriers WHERE is_active = 1',
          async (recipientErr, recipients) => {
            if (recipientErr) {
              console.error('[Telegram Service] Error fetching recipients:', recipientErr.message);
              resolve(false);
              return;
            }

            if (!recipients || recipients.length === 0) {
              console.error('[Telegram Service] No active recipients found');
              resolve(false);
              return;
            }

            console.log(`[Telegram Service] Found ${recipients.length} active recipient(s)`);

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

                // Separate recipients by role
                const kitchenRecipients = recipients.filter(r => r.role === 'kitchen');
                const deliveryRecipients = recipients.filter(r => r.role === 'delivery');
                const observerRecipients = recipients.filter(r => r.role === 'observer');

                // Kitchen message (no buttons)
                const kitchenMessage = `🍳 НОВЫЙ ЗАКАЗ #${order.id}\n\n` +
                  `👤 Клиент: ${order.customer_name}\n` +
                  `📞 Телефон: ${order.customer_phone || 'Не указан'}\n` +
                  `💰 Сумма: ₪${order.total_amount.toFixed(2)}\n\n` +
                  `📦 Состав заказа:\n${order.items || 'Нет товаров'}\n\n` +
                  (order.notes ? `📝 Примечания: ${order.notes}\n\n` : '') +
                  `⏰ Время заказа: ${new Date(order.created_at).toLocaleString('ru-RU')}`;

                // Delivery message (with buttons)
                const deliveryMessage = `🚗 НОВЫЙ ЗАКАЗ НА ДОСТАВКУ #${order.id}\n\n` +
                  `👤 Клиент: ${order.customer_name}\n` +
                  `📞 Телефон: ${order.customer_phone || 'Не указан'}\n` +
                  `📧 Email: ${order.customer_email || 'Не указан'}\n` +
                  (order.delivery_address ? `📍 Адрес доставки: ${order.delivery_address}\n` : '') +
                  `💰 Сумма: ₪${order.total_amount.toFixed(2)}\n\n` +
                  `📦 Состав заказа:\n${order.items || 'Нет товаров'}\n\n` +
                  (order.notes ? `📝 Примечания: ${order.notes}\n\n` : '') +
                  `⏰ Время заказа: ${new Date(order.created_at).toLocaleString('ru-RU')}\n\n` +
                  `❓ Возьмете заказ в работу?`;

                // Observer message (info only)
                const observerMessage = `👁️ НОВЫЙ ЗАКАЗ (ИНФО) #${order.id}\n\n` +
                  `👤 Клиент: ${order.customer_name}\n` +
                  `💰 Сумма: ₪${order.total_amount.toFixed(2)}\n` +
                  `📦 Товаров: ${order.items?.split('\n').length || 0}\n` +
                  `⏰ Время: ${new Date(order.created_at).toLocaleString('ru-RU')}`;

                const deliveryKeyboard = {
                  inline_keyboard: [[
                    { text: '✅ Взять заказ', callback_data: `order_accept_${orderId}` }
                  ]]
                };

                let sentCount = 0;

                // Send to Kitchen (no buttons)
                for (const recipient of kitchenRecipients) {
                  try {
                    console.log(`[Telegram Service] Sending to kitchen ${recipient.name} (${recipient.telegram_id})...`);
                    await bot.sendMessage(recipient.telegram_id, kitchenMessage);
                    console.log(`[Telegram Service] ✅ Sent to kitchen ${recipient.name}`);
                    sentCount++;
                  } catch (error) {
                    console.error(`[Telegram Service] ❌ Error sending to kitchen ${recipient.name}:`, error.message);
                  }
                }

                // Send to Delivery (with buttons)
                for (const recipient of deliveryRecipients) {
                  try {
                    console.log(`[Telegram Service] Sending to delivery ${recipient.name} (${recipient.telegram_id})...`);
                    await bot.sendMessage(recipient.telegram_id, deliveryMessage, {
                      reply_markup: deliveryKeyboard
                    });
                    console.log(`[Telegram Service] ✅ Sent to delivery ${recipient.name}`);
                    sentCount++;
                  } catch (error) {
                    console.error(`[Telegram Service] ❌ Error sending to delivery ${recipient.name}:`, error.message);
                  }
                }

                // Send to Observer (info only)
                for (const recipient of observerRecipients) {
                  try {
                    console.log(`[Telegram Service] Sending to observer ${recipient.name} (${recipient.telegram_id})...`);
                    await bot.sendMessage(recipient.telegram_id, observerMessage);
                    console.log(`[Telegram Service] ✅ Sent to observer ${recipient.name}`);
                    sentCount++;
                  } catch (error) {
                    console.error(`[Telegram Service] ❌ Error sending to observer ${recipient.name}:`, error.message);
                  }
                }

                console.log(`[Telegram Service] Summary: Sent ${sentCount}/${recipients.length} notifications`);

                // SIMPLIFIED: Single reminder interval for pending orders
                if (!orderReminderIntervals.has(orderId)) {
                  db.get(
                    'SELECT reminder_interval_minutes FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
                    (settingsErr, settings) => {
                      const reminderInterval = ((settings?.reminder_interval_minutes || 5) * 60 * 1000);

                      const interval = setInterval(() => {
                        db.get(
                          'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                          [orderId],
                          async (checkErr, notif) => {
                            if (!checkErr && notif && notif.status === 'pending') {
                              // Resend to Kitchen and Delivery only
                              for (const recipient of kitchenRecipients) {
                                try {
                                  await bot.sendMessage(recipient.telegram_id, `🔔 НАПОМИНАНИЕ\n\n${kitchenMessage}`);
                                } catch (error) {
                                  // Ignore
                                }
                              }

                              for (const recipient of deliveryRecipients) {
                                try {
                                  await bot.sendMessage(recipient.telegram_id, `🔔 НАПОМИНАНИЕ\n\n${deliveryMessage}`, {
                                    reply_markup: deliveryKeyboard
                                  });
                                } catch (error) {
                                  // Ignore
                                }
                              }
                              console.log(`[Telegram Service] Reminder sent for order #${orderId}`);
                            } else {
                              clearInterval(interval);
                              orderReminderIntervals.delete(orderId);
                              console.log(`[Telegram Service] Stopped reminders for order #${orderId}`);
                            }
                          }
                        );
                      }, reminderInterval);

                      orderReminderIntervals.set(orderId, interval);
                      console.log(`[Telegram Service] Started reminders (interval: ${reminderInterval / 60000} min) for order #${orderId}`);
                    }
                  );
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

  // Clear all intervals
  for (const [orderId, interval] of orderReminderIntervals.entries()) {
    clearInterval(interval);
  }
  orderReminderIntervals.clear();

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
  console.log('[Telegram Service] Starting Telegram Bot Service (SIMPLIFIED VERSION)...');
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
