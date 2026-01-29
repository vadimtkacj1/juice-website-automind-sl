import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';
import { getPayPlusReceipt } from '@/lib/payplus';
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('@/lib/email.js');

/**
 * PayPlus Webhook Handler
 *
 * This endpoint receives server-to-server notifications from PayPlus about payment status.
 * Unlike the callback URL (which relies on user's browser redirect), webhooks are more reliable
 * as they are sent directly from PayPlus servers to our server.
 *
 * Configure this webhook URL in your PayPlus dashboard:
 * https://yourdomain.com/api/payplus/webhook
 */

interface PayPlusWebhookData {
  // PayPlus webhook data structure
  transaction_uid?: string;
  page_request_uid?: string;
  status?: string;
  status_code?: number;
  amount?: number;
  currency_code?: string;
  transaction_id?: string;
  approval_number?: string;
  customer_name?: string;
  more_info?: string; // This should contain our orderToken
  created_at?: string;
  // Additional fields PayPlus might send
  [key: string]: any;
}

/**
 * Helper to save order to database (after payment)
 */
async function saveOrder(items: any[], customer: any, orderNumber: string): Promise<{
  orderId: number;
  orderNumber: string;
  total: number;
}> {
  return new Promise((resolve, reject) => {
    const dbInstance = getDatabase();

    // Calculate total including custom ingredients and additional items
    const total = items.reduce((sum: number, item: any) => {
      const itemPrice = item.price * item.quantity;
      const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal: number, ing: any) =>
        ingTotal + ing.price * item.quantity, 0
      );
      const additionalItemsPrice = (item.additionalItems || []).reduce((addTotal: number, addItem: any) =>
        addTotal + addItem.price * item.quantity, 0
      );
      return sum + itemPrice + ingredientsPrice + additionalItemsPrice;
    }, 0);

    // Build notes with ingredient information
    const notesParts = [`Order: ${orderNumber}`];

    // Add delivery date if available
    if (customer.deliveryDate) {
      notesParts.push(`Delivery Date: ${customer.deliveryDate}`);
    }

    items.forEach((item: any, idx: number) => {
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredientsList = item.customIngredients.map((ing: any) => ing.name).join(', ');
        notesParts.push(`Item ${idx + 1} custom ingredients: ${ingredientsList}`);
      }
      if (item.additionalItems && item.additionalItems.length > 0) {
        const additionalList = item.additionalItems.map((addItem: any) => addItem.name).join(', ');
        notesParts.push(`Item ${idx + 1} additional items: ${additionalList}`);
      }
    });
    const notes = notesParts.join(' | ');

    dbInstance.run(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [customer.name || 'Customer', customer.email, customer.phone, customer.deliveryAddress || null, total, 'paid', 'payplus', notes],
      function(this: { lastID: number; changes: number }, err: any) {
        if (err) {
          reject(err);
          return;
        }

        const orderId = this.lastID;

        // Insert order items
        const insertItem = (index: number) => {
          if (index >= items.length) {
            resolve({ orderId, orderNumber, total });
            return;
          }

          const item = items[index];
          // Calculate item price including ingredients and additional items
          const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal: number, ing: any) =>
            ingTotal + ing.price, 0
          );
          const additionalItemsPrice = (item.additionalItems || []).reduce((addTotal: number, addItem: any) =>
            addTotal + addItem.price, 0
          );
          const itemTotalPrice = item.price + ingredientsPrice + additionalItemsPrice;

          // Build item name with ingredients and additional items info
          let itemName = item.name;
          if (item.customIngredients && item.customIngredients.length > 0) {
            const ingredientsList = item.customIngredients.map((ing: any) => ing.name).join(', ');
            itemName += ` [Ingredients: ${ingredientsList}]`;
          }
          if (item.additionalItems && item.additionalItems.length > 0) {
            const additionalList = item.additionalItems.map((addItem: any) => `+${addItem.name}`).join(', ');
            itemName += ` [${additionalList}]`;
          }

          dbInstance.run(
            `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.id, itemName, item.quantity, itemTotalPrice],
            (itemErr: any) => {
              if (itemErr) {
                console.error('Error inserting order item:', itemErr);
              }
              insertItem(index + 1);
            }
          );
        };

        insertItem(0);
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('🔔 PAYPLUS WEBHOOK CALLED');
    console.log('='.repeat(80));
    console.log('[PayPlus Webhook] Timestamp:', new Date().toISOString());
    console.log('[PayPlus Webhook] Request URL:', request.url);
    console.log('[PayPlus Webhook] Request Method:', request.method);
    console.log('[PayPlus Webhook] Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

    const body: PayPlusWebhookData = await request.json();

    console.log('[PayPlus Webhook] 📦 Full webhook data:', JSON.stringify(body, null, 2));
    console.log('[PayPlus Webhook] 🔑 Key fields:', {
      status: body.status,
      status_code: body.status_code,
      transaction_uid: body.transaction_uid,
      page_request_uid: body.page_request_uid,
      more_info: body.more_info,
      more_info_6: body.more_info_6,
      amount: body.amount,
    });

    // Extract order token from more_info field or custom field
    // The orderToken should be sent in the more_info field when creating the payment
    const orderToken = body.more_info;

    if (!orderToken) {
      console.error('[PayPlus Webhook] Missing order token in webhook data');
      return NextResponse.json({
        success: false,
        error: 'Missing order token'
      }, { status: 400 });
    }

    // Check payment status
    // PayPlus might send different status values - check documentation
    const isSuccess =
      body.status === 'success' ||
      body.status === 'approved' ||
      body.status === 'paid' ||
      body.status_code === 0 ||
      body.status_code === 1 ||
      body.status === 'Success' ||
      body.status === 'APPROVED';

    console.log('[PayPlus Webhook] Payment status:', {
      isSuccess,
      status: body.status,
      status_code: body.status_code,
    });

    const dbInstance = getDatabase();

    // Look up pending order
    return new Promise<NextResponse>((resolve) => {
      dbInstance.get(
        `SELECT order_data, total_amount, order_token FROM pending_orders WHERE order_token = ? AND expires_at > NOW()`,
        [orderToken],
        async (err: any, pendingOrder: any) => {
          if (err) {
            console.error('[PayPlus Webhook] Database error:', err);
            return resolve(NextResponse.json({
              success: false,
              error: 'Database error'
            }, { status: 500 }));
          }

          if (!pendingOrder) {
            console.error('[PayPlus Webhook] Pending order not found or expired:', orderToken);
            return resolve(NextResponse.json({
              success: false,
              error: 'Order not found or expired'
            }, { status: 404 }));
          }

          if (!isSuccess) {
            // Payment failed - delete pending order
            console.log('[PayPlus Webhook] Payment failed, deleting pending order');
            dbInstance.run(
              `DELETE FROM pending_orders WHERE order_token = ?`,
              [orderToken],
              () => {}
            );

            return resolve(NextResponse.json({
              success: false,
              error: 'Payment failed',
            }, { status: 200 })); // Return 200 to acknowledge webhook
          }

          // Payment successful - create actual order
          try {
            const orderData = JSON.parse(pendingOrder.order_data);

            // Check if order already exists (prevent duplicate orders from multiple webhook calls)
            dbInstance.get(
              `SELECT id FROM orders WHERE notes LIKE ?`,
              [`%Order: ${orderData.orderNumber}%`],
              async (checkErr: any, existingOrder: any) => {
                if (existingOrder) {
                  console.log('[PayPlus Webhook] Order already exists, skipping creation');
                  return resolve(NextResponse.json({
                    success: true,
                    message: 'Order already processed',
                    orderId: existingOrder.id,
                  }));
                }

                // Create order
                const orderResult = await saveOrder(orderData.items, orderData.customer, orderData.orderNumber);

                // Delete pending order
                dbInstance.run(
                  `DELETE FROM pending_orders WHERE order_token = ?`,
                  [orderToken],
                  () => {}
                );

                console.log('');
                console.log('=== Order Created Successfully (Webhook) ===');
                console.log('[PayPlus Webhook] - Order ID:', orderResult.orderId);
                console.log('[PayPlus Webhook] - Order Number:', orderResult.orderNumber);
                console.log('[PayPlus Webhook] - Total: ₪', orderResult.total);

                // Send Telegram notification
                console.log('[PayPlus Webhook] Sending Telegram notification...');
                try {
                  const telegramSuccess = await sendOrderNotification(orderResult.orderId);
                  if (telegramSuccess) {
                    console.log('[PayPlus Webhook] ✅ Telegram notification sent');
                  } else {
                    console.log('[PayPlus Webhook] ⚠️ Failed to send Telegram notification');
                  }
                } catch (error) {
                  console.error('[PayPlus Webhook] ❌ Error sending Telegram notification:', error);
                }

                // Send email notifications
                console.log('[PayPlus Webhook] Sending email notifications...');
                const emailData = {
                  orderNumber: orderResult.orderNumber,
                  customerName: orderData.customer.name || 'Customer',
                  customerEmail: orderData.customer.email,
                  items: orderData.items.map((item: any) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    customIngredients: item.customIngredients || [],
                    additionalItems: item.additionalItems || []
                  })),
                  total: orderResult.total,
                  deliveryAddress: orderData.customer.deliveryAddress
                };

                // Get PDF receipt from PayPlus
                let pdfAttachment = null;
                if (body.transaction_uid) {
                  console.log('[PayPlus Webhook] Fetching PDF receipt from PayPlus...');
                  try {
                    const receiptResult = await getPayPlusReceipt(body.transaction_uid);
                    if (receiptResult.success && receiptResult.pdfBuffer) {
                      pdfAttachment = receiptResult.pdfBuffer;
                      console.log('[PayPlus Webhook] ✅ PDF receipt obtained from PayPlus');
                    } else {
                      console.log('[PayPlus Webhook] ⚠️ Could not get PDF receipt from PayPlus:', receiptResult.error);
                    }
                  } catch (error) {
                    console.error('[PayPlus Webhook] ❌ Error fetching PDF receipt:', error);
                  }
                } else {
                  console.log('[PayPlus Webhook] ⚠️ No transaction_uid in webhook, skipping PDF fetch');
                }

                // Send customer confirmation email with PDF attachment
                try {
                  const customerEmailSuccess = await sendOrderConfirmationEmail(emailData, pdfAttachment);
                  if (customerEmailSuccess) {
                    console.log('[PayPlus Webhook] ✅ Customer confirmation email sent' + (pdfAttachment ? ' with PDF attachment' : ''));
                  } else {
                    console.log('[PayPlus Webhook] ⚠️ Failed to send customer email');
                  }
                } catch (error) {
                  console.error('[PayPlus Webhook] ❌ Error sending customer email:', error);
                }

                // Send admin notification email
                try {
                  const adminEmailSuccess = await sendAdminOrderNotification(emailData);
                  if (adminEmailSuccess) {
                    console.log('[PayPlus Webhook] ✅ Admin notification email sent');
                  } else {
                    console.log('[PayPlus Webhook] ⚠️ Failed to send admin email');
                  }
                } catch (error) {
                  console.error('[PayPlus Webhook] ❌ Error sending admin email:', error);
                }

                resolve(NextResponse.json({
                  success: true,
                  orderId: orderResult.orderId,
                  orderNumber: orderResult.orderNumber,
                }));
              }
            );
          } catch (error: any) {
            console.error('[PayPlus Webhook] Error creating order:', error);
            resolve(NextResponse.json(
              { success: false, error: 'Order creation failed' },
              { status: 500 }
            ));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('[PayPlus Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
  console.log('');
  console.log('='.repeat(80));
  console.log('🔔 PAYPLUS WEBHOOK GET REQUEST');
  console.log('='.repeat(80));
  console.log('[PayPlus Webhook GET] Timestamp:', new Date().toISOString());
  console.log('[PayPlus Webhook GET] Request URL:', request.url);
  console.log('[PayPlus Webhook GET] Query Params:', Object.fromEntries(request.nextUrl.searchParams.entries()));
  
  return NextResponse.json({
    message: 'PayPlus Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
