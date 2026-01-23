import TelegramBot from 'node-telegram-bot-api';
import getDatabase from './database';

let botInstance: TelegramBot | null = null;
let botPolling: boolean = false;
let pollingErrorCount: number = 0;
const MAX_POLLING_ERRORS = 5;

// Simplified notification system - single interval per order
let orderReminderIntervals: Map<number, NodeJS.Timeout> = new Map();

// Validate Telegram bot token
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
    return false;
  }
}

export async function getBotInstance(enablePolling: boolean = false): Promise<TelegramBot | null> {
  const db = getDatabase();

  return new Promise(async (resolve) => {
    const serviceAvailable = await isServiceAvailable();
    if (serviceAvailable && enablePolling) {
      console.log('[Telegram] Standalone service is running. Polling disabled in main app.');
      enablePolling = false;
    }

    db.get(
      'SELECT * FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
      async (err: Error | null, settings: any) => {
        if (err || !settings || !settings.api_token) {
          resolve(null);
          return;
        }

        const isValid = await validateBotToken(settings.api_token);
        if (!isValid) {
          console.error('Telegram bot token validation failed.');
          resolve(null);
          return;
        }

        if (botInstance && (botInstance as any).token === settings.api_token) {
          if (enablePolling && !botPolling && !serviceAvailable) {
            await startPollingSafely(botInstance);
          }
          resolve(botInstance);
          return;
        }

        if (botInstance) {
          try {
            botInstance.stopPolling();
          } catch (e) {
            // Ignore
          }
          botInstance = null;
          botPolling = false;
        }

        try {
          botInstance = new TelegramBot(settings.api_token, {
            polling: false,
            onlyFirstMatch: false
          });

          setupBotHandlers(botInstance);
          setupErrorHandlers(botInstance);

          if (enablePolling && !serviceAvailable) {
            await startPollingSafely(botInstance);
            // Відновлюємо стан замовлень після перезапуску
            await recoverPendingOrders(botInstance, db);
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
  if (botPolling) return;

  try {
    bot.startPolling({
      restart: true,
      polling: {
        interval: 1000,
        autoStart: false,
        params: { timeout: 10 }
      }
    });

    botPolling = true;
    pollingErrorCount = 0;
    console.log('[Telegram] Bot polling started');
  } catch (error: any) {
    console.error('[Telegram] Error starting bot polling:', error.message);
    botPolling = false;
  }
}

// Відновлення стану замовлень після перезапуску програми
async function recoverPendingOrders(bot: TelegramBot, db: any): Promise<void> {
  console.log('[Telegram] 🔄 Recovering pending orders after restart...');
  
  return new Promise((resolve) => {
    // Знаходимо всі замовлення, які очікують на обробку або в процесі доставки
    db.all(
      `SELECT otn.*, o.customer_name, o.delivery_address, o.total_amount, o.created_at as order_created_at
       FROM order_telegram_notifications otn
       JOIN orders o ON otn.order_id = o.id
       WHERE otn.status IN ('pending', 'in_progress')
       ORDER BY otn.created_at ASC`,
      async (err: Error | null, notifications: any[]) => {
        if (err) {
          console.error('[Telegram] Error fetching pending notifications:', err);
          resolve();
          return;
        }

        if (!notifications || notifications.length === 0) {
          console.log('[Telegram] ✅ No pending orders to recover');
          resolve();
          return;
        }

        console.log(`[Telegram] 📦 Found ${notifications.length} pending order(s) to recover`);

        // Отримуємо налаштування інтервалу нагадувань
        db.get(
          'SELECT reminder_interval_minutes FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
          async (settingsErr: Error | null, settings: any) => {
            const reminderInterval = ((settings?.reminder_interval_minutes) || 5) * 60 * 1000;

            for (const notif of notifications) {
              const orderId = notif.order_id;
              
              // Перевіряємо, чи не завершене замовлення
              const orderAge = Date.now() - new Date(notif.order_created_at).getTime();
              const maxOrderAge = 24 * 60 * 60 * 1000; // 24 години

              if (orderAge > maxOrderAge) {
                console.log(`[Telegram] ⏰ Order #${orderId} is too old (${Math.floor(orderAge / 3600000)}h), marking as expired`);
                db.run(
                  'UPDATE order_telegram_notifications SET status = ? WHERE order_id = ?',
                  ['expired', orderId]
                );
                continue;
              }

              if (notif.status === 'pending') {
                console.log(`[Telegram] 🔄 Reactivating reminders for pending order #${orderId}`);
                // Відновлюємо нагадування для замовлень, що очікують
                await restartOrderReminders(bot, db, orderId, reminderInterval, 'pending');
              } else if (notif.status === 'in_progress' && notif.courier_telegram_id) {
                console.log(`[Telegram] 🚗 Reactivating reminders for in-progress order #${orderId}`);
                // Відновлюємо нагадування для замовлень в доставці
                await restartOrderReminders(bot, db, orderId, reminderInterval, 'in_progress', notif.courier_telegram_id);
              }
            }

            console.log('[Telegram] ✅ Order recovery completed');
            resolve();
          }
        );
      }
    );
  });
}

// Відновлення нагадувань для конкретного замовлення
async function restartOrderReminders(
  bot: TelegramBot, 
  db: any, 
  orderId: number, 
  reminderInterval: number,
  status: 'pending' | 'in_progress',
  courierTelegramId?: string
): Promise<void> {
  // Якщо вже є інтервал для цього замовлення, очищаємо його
  if (orderReminderIntervals.has(orderId)) {
    clearInterval(orderReminderIntervals.get(orderId)!);
    orderReminderIntervals.delete(orderId);
  }

  // Створюємо новий інтервал нагадувань
  const interval = setInterval(() => {
    db.get(
      'SELECT otn.*, o.* FROM order_telegram_notifications otn JOIN orders o ON otn.order_id = o.id WHERE otn.order_id = ?',
      [orderId],
      async (checkErr: Error | null, data: any) => {
        if (!checkErr && data && data.status === status) {
          try {
            if (status === 'pending') {
              // Надсилаємо нагадування всім кур'єрам
              db.all(
                'SELECT * FROM telegram_couriers WHERE is_active = 1 AND role = ?',
                ['delivery'],
                async (couriersErr: Error | null, couriers: any[]) => {
                  if (!couriersErr && couriers && couriers.length > 0) {
                    const reminderMessage = `🔔 НАГАДУВАННЯ: Замовлення #${orderId}\n\n` +
                      `👤 Клієнт: ${data.customer_name}\n` +
                      (data.delivery_address ? `📍 Адреса: ${data.delivery_address}\n` : '') +
                      `💰 Сума: ₪${data.total_amount}\n\n` +
                      `❓ Візьмете замовлення?`;

                    for (const courier of couriers) {
                      try {
                        await bot.sendMessage(courier.telegram_id, reminderMessage, {
                          reply_markup: {
                            inline_keyboard: [[
                              { text: '✅ אישור הזמנה', callback_data: `order_accept_${orderId}` }
                            ]]
                          }
                        });
                      } catch (error: any) {
                        console.error(`[Telegram] Error sending reminder to courier ${courier.name}:`, error.message);
                      }
                    }

                    // Оновлюємо час останнього нагадування
                    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    db.run(
                      'UPDATE order_telegram_notifications SET last_notification_sent_at = ? WHERE order_id = ?',
                      [now, orderId]
                    );
                  }
                }
              );
            } else if (status === 'in_progress' && courierTelegramId) {
              // Надсилаємо нагадування конкретному кур'єру
              const reminderMsg = `⏰ НАГАДУВАННЯ: Замовлення #${orderId}\n\n` +
                `👤 Клієнт: ${data.customer_name}\n` +
                (data.delivery_address ? `📍 Адреса: ${data.delivery_address}\n` : '') +
                `\n❓ Замовлення доставлено?`;

              await bot.sendMessage(courierTelegramId, reminderMsg, {
                reply_markup: {
                  inline_keyboard: [[
                    { text: '✅ נמסר', callback_data: `order_delivered_${orderId}` }
                  ]]
                }
              });
            }
          } catch (error: any) {
            console.error(`[Telegram] Error sending reminder for order #${orderId}:`, error.message);
          }
        } else {
          // Замовлення більше не в цьому статусі, зупиняємо нагадування
          clearInterval(interval);
          orderReminderIntervals.delete(orderId);
        }
      }
    );
  }, reminderInterval);

  orderReminderIntervals.set(orderId, interval);
}

function setupErrorHandlers(bot: TelegramBot) {
  bot.on('polling_error', (error: any) => {
    pollingErrorCount++;

    if (pollingErrorCount <= 3) {
      console.error(`[Telegram Bot] Polling error (${pollingErrorCount}/${MAX_POLLING_ERRORS}):`, error.message);
    }

    if (pollingErrorCount >= MAX_POLLING_ERRORS) {
      console.error('[Telegram Bot] Too many polling errors. Stopping.');
      try {
        bot.stopPolling();
        botPolling = false;
        pollingErrorCount = 0;
      } catch (e) {
        // Ignore
      }
    }
  });

  bot.on('webhook_error', (error: any) => {
    console.error('[Telegram Bot] Webhook error:', error.message);
  });

  bot.on('error', (error: any) => {
    if (!error.message?.includes('polling')) {
      console.error('[Telegram Bot] Error:', error.message);
    }
  });
}

function setupBotHandlers(bot: TelegramBot) {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const deliveryTelegramId = query.from.id.toString();
    const messageId = query.message?.message_id;
    const chatId = query.message?.chat.id;

    try {
      console.log(`[Telegram] 📨 Received callback query: ${data} from user ${deliveryTelegramId}`);

      if (data?.startsWith('order_accept_')) {
        const orderId = parseInt(data.replace('order_accept_', ''));
        const result = await handleOrderAccept(orderId, deliveryTelegramId);
        
        if (result) {
          await bot.answerCallbackQuery(query.id, { 
            text: '✅ ההזמנה התקבלה בהצלחה!',
            show_alert: false 
          });
          
          // Видаляємо кнопки з повідомлення після прийняття
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
          
          // Видаляємо кнопки з повідомлення після доставки
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
        // Невідома команда або застаріле повідомлення
        await bot.answerCallbackQuery(query.id, { 
          text: 'פעולה לא זמינה',
          show_alert: false 
        });
      }
    } catch (error: any) {
      console.error('[Telegram Bot] Error handling callback query:', error.message);
      try {
        await bot.answerCallbackQuery(query.id, { 
          text: '❌ שגיאה בעיבוד הפעולה',
          show_alert: false 
        });
      } catch (e) {
        // Ignore if answer already sent
      }
    }
  });

  // Логування всіх отриманих повідомлень для діагностики
  bot.on('message', (msg) => {
    console.log(`[Telegram] 💬 Received message from ${msg.from?.id}: ${msg.text?.substring(0, 50) || '[no text]'}`);
  });
}

// Send order notification to all recipients based on their role
export async function sendOrderNotification(orderId: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const bot = await getBotInstance();

    if (!bot) {
      console.log('[Telegram] Bot is not configured or enabled');
      return false;
    }

    // Get reminder interval from settings
    const settings: any = await new Promise((resolve) => {
      db.get(
        'SELECT reminder_interval_minutes FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
        (err: Error | null, row: any) => {
          resolve(err || !row ? { reminder_interval_minutes: 5 } : row);
        }
      );
    });

    const reminderInterval = (settings.reminder_interval_minutes || 5) * 60 * 1000;

    await sendOrderNotificationInternal(orderId, bot, db, reminderInterval);
    return true;
  } catch (error: any) {
    console.error('[Telegram] Error sending order notification:', error.message);
    return false;
  }
}

async function sendOrderNotificationInternal(orderId: number, bot: TelegramBot, db: any, reminderInterval: number): Promise<void> {
  return new Promise((resolve) => {
    // Get order details
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
          resolve();
          return;
        }

        // Get all active recipients (Kitchen, Delivery, Observer)
        db.all(
          'SELECT * FROM telegram_couriers WHERE is_active = 1',
          async (recipientErr: Error | null, recipients: any[]) => {
            if (recipientErr || !recipients || recipients.length === 0) {
              console.log('[Telegram] No active recipients found');
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

                // If order is already assigned, don't send new notifications
                if (existing && existing.status === 'in_progress') {
                  resolve();
                  return;
                }

                // Create or update notification record
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

                // Send notifications based on role
                const kitchenRecipients = recipients.filter(r => r.role === 'kitchen');
                const deliveryRecipients = recipients.filter(r => r.role === 'delivery');
                const observerRecipients = recipients.filter(r => r.role === 'observer');

                // Kitchen message (no buttons)
                const kitchenMessage = `🍳 הזמנה חדשה #${order.id}\n\n` +
                  `👤 לקוח: ${order.customer_name}\n` +
                  `📞 טלפון: ${order.customer_phone || 'לא צוין'}\n` +
                  `📧 אימייל: ${order.customer_email || 'לא צוין'}\n` +
                  (order.delivery_address ? `📍 כתובת למשלוח: ${order.delivery_address}\n` : '') +
                  `💰 סכום: ₪${order.total_amount}\n\n` +
                  `📦 פרטי ההזמנה:\n${order.items || 'אין פריטים'}\n\n` +
                  (order.notes ? `📝 הערות: ${order.notes}\n\n` : '') +
                  `⏰ זמן הזמנה: ${new Date(order.created_at).toLocaleString('he-IL')}`;

                // Delivery message (with buttons)
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

                // Observer message (info only)
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

                // Send to Kitchen
                for (const recipient of kitchenRecipients) {
                  try {
                    await bot.sendMessage(recipient.telegram_id, kitchenMessage);
                  } catch (error: any) {
                    console.error(`[Telegram] Error sending to kitchen ${recipient.name}:`, error.message);
                  }
                }

                // Send to Delivery
                for (const recipient of deliveryRecipients) {
                  try {
                    await bot.sendMessage(recipient.telegram_id, deliveryMessage, {
                      reply_markup: deliveryKeyboard
                    });
                  } catch (error: any) {
                    console.error(`[Telegram] Error sending to delivery ${recipient.name}:`, error.message);
                  }
                }

                // Send to Observer
                for (const recipient of observerRecipients) {
                  try {
                    await bot.sendMessage(recipient.telegram_id, observerMessage);
                  } catch (error: any) {
                    console.error(`[Telegram] Error sending to observer ${recipient.name}:`, error.message);
                  }
                }

                // Single reminder interval for all pending orders
                if (!orderReminderIntervals.has(orderId)) {
                  const interval = setInterval(() => {
                    db.get(
                      'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                      [orderId],
                      async (checkErr: Error | null, notif: any) => {
                        if (!checkErr && notif && notif.status === 'pending') {
                          // Resend reminders
                          for (const recipient of kitchenRecipients) {
                            try {
                              await bot.sendMessage(recipient.telegram_id, `🔔 תזכורת\n\n${kitchenMessage}`);
                            } catch (error) {
                              // Ignore
                            }
                          }

                          for (const recipient of deliveryRecipients) {
                            try {
                              await bot.sendMessage(recipient.telegram_id, `🔔 תזכורת\n\n${deliveryMessage}`, {
                                reply_markup: deliveryKeyboard
                              });
                            } catch (error) {
                              // Ignore
                            }
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

                resolve();
              }
            );
          }
        );
      }
    );
  });
}

export async function handleOrderAccept(orderId: number, deliveryTelegramId: string) {
  const db = getDatabase();
  const bot = await getBotInstance();

  if (!bot) return false;

  return new Promise((resolve) => {
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
          try {
            await bot.sendMessage(deliveryTelegramId, '❌ ההזמנה כבר נלקחה על ידי שליח אחר.');
          } catch (error) {
            console.error('Error sending message:', error);
          }
          resolve(false);
          return;
        }

        // Update notification and order status
        db.get(
          'SELECT name FROM telegram_couriers WHERE telegram_id = ?',
          [deliveryTelegramId],
          async (courierErr: Error | null, courier: any) => {
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

            if (orderReminderIntervals.has(orderId)) {
              clearInterval(orderReminderIntervals.get(orderId)!);
              orderReminderIntervals.delete(orderId);
            }

            db.get(
              `SELECT o.* FROM orders o WHERE o.id = ?`,
              [orderId],
              async (orderErr: Error | null, order: any) => {
                if (orderErr || !order) {
                  console.error('Error fetching order:', orderErr);
                  return;
                }

                const confirmMessage = `✅ ההזמנה #${orderId} בטיפול!\n\n` +
                  `👤 לקוח: ${order.customer_name}\n` +
                  `📞 טלפון: ${order.customer_phone || 'לא צוין'}\n` +
                  (order.delivery_address ? `📍 כתובת: ${order.delivery_address}\n` : '') +
                  `\n❓ ההזמנה נמסרה?`;

                try {
                  await bot.sendMessage(
                    deliveryTelegramId,
                    confirmMessage,
                    {
                      reply_markup: {
                        inline_keyboard: [[
                          { text: '✅ נמסר', callback_data: `order_delivered_${orderId}` }
                        ]]
                      }
                    }
                  );
                } catch (error) {
                  console.error('Error sending confirmation:', error);
                }

                // Start delivery reminders
                const settings: any = await new Promise((res) => {
                  db.get(
                    'SELECT reminder_interval_minutes FROM telegram_bot_settings WHERE is_enabled = 1 ORDER BY id DESC LIMIT 1',
                    (err: Error | null, row: any) => {
                      res(err || !row ? { reminder_interval_minutes: 5 } : row);
                    }
                  );
                });

                const reminderInterval = (settings.reminder_interval_minutes || 5) * 60 * 1000;

                const interval = setInterval(() => {
                  db.get(
                    'SELECT status FROM order_telegram_notifications WHERE order_id = ?',
                    [orderId],
                    async (checkErr: Error | null, notif: any) => {
                      if (!checkErr && notif && notif.status === 'in_progress') {
                        try {
                          const reminderMsg = `⏰ תזכורת: הזמנה #${orderId}\n\n` +
                            `👤 לקוח: ${order.customer_name}\n` +
                            (order.delivery_address ? `📍 כתובת: ${order.delivery_address}\n` : '') +
                            `\n❓ ההזמנה נמסרה?`;

                          await bot.sendMessage(
                            deliveryTelegramId,
                            reminderMsg,
                            {
                              reply_markup: {
                                inline_keyboard: [[
                                  { text: '✅ נמסר', callback_data: `order_delivered_${orderId}` }
                                ]]
                              }
                            }
                          );
                        } catch (error) {
                          console.error('Error sending reminder:', error);
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
            );

            resolve(true);
          }
        );
      }
    );
  });
}

export async function handleOrderDelivered(orderId: number, deliveryTelegramId: string) {
  const db = getDatabase();
  const bot = await getBotInstance();

  if (!bot) return false;

  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM order_telegram_notifications WHERE order_id = ? AND courier_telegram_id = ?',
      [orderId, deliveryTelegramId],
      async (err: Error | null, notification: any) => {
        if (err || !notification || notification.status !== 'in_progress') {
          try {
            await bot.sendMessage(deliveryTelegramId, '❌ שגיאה: ההזמנה לא נמצאה או כבר נמסרה.');
          } catch (error) {
            console.error('Error sending message:', error);
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

        if (orderReminderIntervals.has(orderId)) {
          clearInterval(orderReminderIntervals.get(orderId)!);
          orderReminderIntervals.delete(orderId);
        }

        try {
          await bot.sendMessage(
            deliveryTelegramId,
            `✅ הזמנה #${orderId} נמסרה בהצלחה! תודה רבה!`
          );
        } catch (error) {
          console.error('Error sending confirmation:', error);
        }

        resolve(true);
      }
    );
  });
}