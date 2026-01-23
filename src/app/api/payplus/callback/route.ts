import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('@/lib/email.js');

/**
 * PayPlus callback handler
 * This endpoint receives callbacks from PayPlus after payment processing
 */
// Helper to save order to database (after payment)
async function saveOrder(items: any[], customer: any, orderNumber: string): Promise<{
  orderId: number;
  orderNumber: string;
  total: number;
}> {
  return new Promise((resolve, reject) => {
    const dbInstance = getDatabase();
    // Calculate total including custom ingredients
    const total = items.reduce((sum: number, item: any) => {
      const itemPrice = item.price * item.quantity;
      const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal: number, ing: any) => 
        ingTotal + ing.price * item.quantity, 0
      );
      return sum + itemPrice + ingredientsPrice;
    }, 0);
    
    // Build notes with ingredient information
    const notesParts = [`Order: ${orderNumber}`];
    items.forEach((item: any, idx: number) => {
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredientsList = item.customIngredients.map((ing: any) => ing.name).join(', ');
        notesParts.push(`Item ${idx + 1} custom ingredients: ${ingredientsList}`);
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
          // Calculate item price including ingredients
          const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal: number, ing: any) => 
            ingTotal + ing.price, 0
          );
          const itemTotalPrice = item.price + ingredientsPrice;
          
          // Build item name with ingredients info
          let itemName = item.name;
          if (item.customIngredients && item.customIngredients.length > 0) {
            const ingredientsList = item.customIngredients.map((ing: any) => ing.name).join(', ');
            itemName += ` [Ingredients: ${ingredientsList}]`;
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    console.log('');
    console.log('='.repeat(80));
    console.log('🔙 PAYPLUS CALLBACK RECEIVED (GET)');
    console.log('='.repeat(80));
    console.log('[PayPlus Callback GET] Timestamp:', new Date().toISOString());
    console.log('[PayPlus Callback GET] Full URL:', request.url);
    console.log('[PayPlus Callback GET] Query Params:', Object.fromEntries(searchParams.entries()));
    console.log('[PayPlus Callback GET] Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

    // Get order token from callback URL
    const orderToken = searchParams.get('token');
    if (!orderToken) {
      console.error('[PayPlus Callback] ❌ Missing order token');

      // Construct proper redirect URL
      let baseUrl = process.env.DEPLOYMENT_URL;
      if (!baseUrl) {
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      }
      baseUrl = baseUrl.replace(/\/$/, '');

      return NextResponse.redirect(new URL('/checkout/success?error=missing_token', baseUrl));
    }

    // PayPlus typically sends payment status in query parameters
    const status = searchParams.get('status');
    const paymentUid = searchParams.get('uid') || searchParams.get('payment_uid');
    const transactionId = searchParams.get('transaction_id');
    const isTestMode = searchParams.get('test_mode') === 'true';
    
    // Log ALL query parameters to debug production status values
    console.log('[PayPlus Callback] 📊 Payment Status Details:', {
      status,
      paymentUid,
      transactionId,
      isTestMode,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // In test mode, automatically mark as success
    if (isTestMode) {
      console.log('🧪 PayPlus TEST MODE: Auto-approving payment');
    }

    const dbInstance = getDatabase();

    // Clean up expired pending orders (older than 2 hours)
    dbInstance.run(
      `DELETE FROM pending_orders WHERE expires_at < NOW()`,
      [],
      (cleanupErr: any) => {
        if (cleanupErr) {
          console.error('[PayPlus Callback] Error cleaning up expired orders:', cleanupErr?.message);
        }
      }
    );

    // Debug: Check all pending orders to help diagnose issues
    console.log('[PayPlus Callback] Looking up pending order', {
      orderToken: orderToken.substring(0, 16) + '...',
      fullToken: orderToken
    });

    // First, check if this specific token exists at all (ignoring expiration)
    dbInstance.get(
      `SELECT order_token, expires_at, created_at, NOW() as db_now FROM pending_orders WHERE order_token = ?`,
      [orderToken],
      (specificErr: any, specificOrder: any) => {
        if (!specificErr && specificOrder) {
          console.log('[PayPlus Callback] Found matching token in database (ignoring expiration):', {
            token: specificOrder.order_token?.substring(0, 16) + '...',
            expiresAt: specificOrder.expires_at,
            createdAt: specificOrder.created_at,
            currentTime: specificOrder.db_now,
            isExpired: specificOrder.expires_at <= specificOrder.db_now
          });
        } else {
          console.log('[PayPlus Callback] Token NOT found in database at all');
        }
      }
    );

    // Also check all pending orders for context
    dbInstance.all(
      `SELECT order_token, expires_at, created_at, NOW() as db_now FROM pending_orders ORDER BY created_at DESC LIMIT 10`,
      [],
      (debugErr: any, allOrders: any) => {
        if (!debugErr && allOrders) {
          console.log('[PayPlus Callback] Recent pending orders in database:', {
            count: allOrders.length,
            currentTime: allOrders[0]?.db_now,
            orders: allOrders.map((o: any) => ({
              token: o.order_token?.substring(0, 16) + '...',
              expiresAt: o.expires_at,
              createdAt: o.created_at,
              isExpired: o.expires_at <= o.db_now
            }))
          });
        } else if (debugErr) {
          console.error('[PayPlus Callback] Error fetching debug info:', debugErr?.message);
        }
      }
    );

    // Retrieve pending order data
    return new Promise<NextResponse>((resolve) => {
      dbInstance.get(
        `SELECT order_data, total_amount, order_token FROM pending_orders WHERE order_token = ? AND expires_at > NOW()`,
        [orderToken],
        async (err: any, pendingOrder: any) => {
          if (err) {
            console.error('PayPlus callback: Database error while looking up pending order', {
              error: err,
              errorMessage: err?.message,
              errorCode: err?.code,
              orderToken: orderToken
            });

            // Construct proper redirect URL
            let baseUrl = process.env.DEPLOYMENT_URL;
            if (!baseUrl) {
              const url = new URL(request.url);
              baseUrl = `${url.protocol}//${url.host}`;
            }
            baseUrl = baseUrl.replace(/\/$/, '');

            return resolve(NextResponse.redirect(
              new URL('/checkout/success?error=database_error', baseUrl)
            ));
          }

          if (!pendingOrder) {
            console.error('PayPlus callback: Pending order not found or expired', orderToken);

            // Construct proper redirect URL
            let baseUrl = process.env.DEPLOYMENT_URL;
            if (!baseUrl) {
              const url = new URL(request.url);
              baseUrl = `${url.protocol}//${url.host}`;
            }
            baseUrl = baseUrl.replace(/\/$/, '');

            return resolve(NextResponse.redirect(
              new URL('/checkout/success?error=order_not_found', baseUrl)
            ));
          }

          // Determine payment status - PayPlus may send status in different formats
          // In test mode, always succeed
          // IMPORTANT: If no status parameter, assume success (PayPlus redirects without status on success)
          const isSuccess = isTestMode || 
            !status || // No status = success (PayPlus default behavior)
            status === 'success' || 
            status === 'approved' || 
            status === '1' ||
            status === 'Success' ||
            status === 'SUCCESS' ||
            status === 'paid' ||
            status === 'Paid' ||
            status === 'completed' ||
            status === 'COMPLETED';
          
          console.log('[PayPlus Callback GET] 🔍 Payment Status Check:', {
            isSuccess,
            statusValue: status || 'null/undefined',
            reasoning: !status ? 'No status parameter - treating as success (PayPlus default)' : `Status value: ${status}`,
            willCreateOrder: isSuccess
          });
          
          if (!isSuccess) {
            console.log('[PayPlus Callback GET] ❌ Payment failed, deleting pending order');
            // Payment failed - delete pending order and redirect
            dbInstance.run(
              `DELETE FROM pending_orders WHERE order_token = ?`,
              [orderToken],
              () => {}
            );
            
            // Construct proper redirect URL
            let baseUrl = process.env.DEPLOYMENT_URL;
            if (!baseUrl) {
              const url = new URL(request.url);
              baseUrl = `${url.protocol}//${url.host}`;
            }
            baseUrl = baseUrl.replace(/\/$/, '');
            
            return resolve(NextResponse.redirect(
              new URL('/checkout/success?error=payment_failed', baseUrl)
            ));
          }

          // Payment successful - create actual order
          try {
            const orderData = JSON.parse(pendingOrder.order_data);
            const orderResult = await saveOrder(orderData.items, orderData.customer, orderData.orderNumber);
            
            // Delete pending order
            dbInstance.run(
              `DELETE FROM pending_orders WHERE order_token = ?`,
              [orderToken],
              () => {}
            );

            // Send Telegram notification for successful payment
            console.log('');
            console.log('=== Order Created Successfully ===');
            console.log(`[PayPlus Callback] Order ID: ${orderResult.orderId}`);
            console.log(`[PayPlus Callback] Order Number: ${orderResult.orderNumber}`);
            console.log(`[PayPlus Callback] Total: ₪${orderResult.total}`);
            console.log(`[PayPlus Callback] Sending Telegram notification for order #${orderResult.orderId}...`);
            
            // Send notifications synchronously to ensure they complete before redirect
            try {
              const telegramSuccess = await sendOrderNotification(orderResult.orderId);
              if (telegramSuccess) {
                console.log(`[PayPlus Callback] ✅ Telegram notification sent successfully for order #${orderResult.orderId}`);
              } else {
                console.log(`[PayPlus Callback] ⚠️ Failed to send Telegram notification for order #${orderResult.orderId}`);
                console.log(`[PayPlus Callback] ⚠️ Check that Telegram bot is configured and recipients are added in admin panel`);
              }
            } catch (error) {
              console.error(`[PayPlus Callback] ❌ Error sending Telegram notification:`, error);
            }

            // Send email notifications
            console.log(`[PayPlus Callback] Sending email notifications...`);
            const emailData = {
              orderNumber: orderResult.orderNumber,
              customerName: orderData.customer.name || 'Customer',
              customerEmail: orderData.customer.email,
              items: orderData.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })),
              total: orderResult.total,
              deliveryAddress: orderData.customer.deliveryAddress
            };

            // Send customer confirmation email
            try {
              const customerEmailSuccess = await sendOrderConfirmationEmail(emailData);
              if (customerEmailSuccess) {
                console.log(`[PayPlus Callback] ✅ Customer confirmation email sent to ${orderData.customer.email}`);
              } else {
                console.log(`[PayPlus Callback] ⚠️ Failed to send customer email`);
              }
            } catch (error) {
              console.error(`[PayPlus Callback] ❌ Error sending customer email:`, error);
            }

            // Admin notification email removed - not needed
            
            // Construct proper redirect URL using DEPLOYMENT_URL or request origin
            let baseUrl = process.env.DEPLOYMENT_URL;
            if (!baseUrl) {
              // Fallback to request origin
              const url = new URL(request.url);
              baseUrl = `${url.protocol}//${url.host}`;
            }
            baseUrl = baseUrl.replace(/\/$/, '');
            
            // Redirect to success page
            resolve(NextResponse.redirect(
              new URL(`/checkout/success?order=${orderResult.orderNumber}`, baseUrl)
            ));
          } catch (error: any) {
            console.error('PayPlus callback: Error creating order', error);
            
            // Construct proper redirect URL
            let baseUrl = process.env.DEPLOYMENT_URL;
            if (!baseUrl) {
              const url = new URL(request.url);
              baseUrl = `${url.protocol}//${url.host}`;
            }
            baseUrl = baseUrl.replace(/\/$/, '');
            
            resolve(NextResponse.redirect(
              new URL('/checkout/success?error=order_creation_failed', baseUrl)
            ));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('PayPlus callback error:', error);
    
    // Construct proper redirect URL
    let baseUrl = process.env.DEPLOYMENT_URL;
    if (!baseUrl) {
      try {
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      } catch {
        baseUrl = 'http://localhost:3000';
      }
    }
    baseUrl = baseUrl.replace(/\/$/, '');
    
    return NextResponse.redirect(
      new URL('/checkout/success?error=callback_error', baseUrl)
    );
  }
}

/**
 * Handle POST callbacks (if PayPlus sends POST requests)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('🔙 PAYPLUS CALLBACK RECEIVED (POST)');
    console.log('='.repeat(80));
    console.log('[PayPlus Callback POST] Timestamp:', new Date().toISOString());
    console.log('[PayPlus Callback POST] Request URL:', request.url);
    
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;
    
    console.log('[PayPlus Callback POST] Body:', JSON.stringify(body, null, 2));
    console.log('[PayPlus Callback POST] Query Params:', Object.fromEntries(searchParams.entries()));
    
    // Get order token from callback URL
    const orderToken = searchParams.get('token') || body.token;
    if (!orderToken) {
      console.error('PayPlus callback: Missing order token');
      return NextResponse.json({ error: 'Missing order token' }, { status: 400 });
    }
    
    // Try to get data from both body and query params
    const status = body.status || searchParams.get('status') || body.Status;
    const paymentUid = body.uid || searchParams.get('uid') || body.payment_uid;
    const transactionId = body.transaction_id || searchParams.get('transaction_id');
    const isTestMode = body.test_mode === true || searchParams.get('test_mode') === 'true';
    
    // In test mode, automatically mark as success
    if (isTestMode) {
      console.log('🧪 PayPlus TEST MODE: Auto-approving payment');
    }

    const dbInstance = getDatabase();
    
    return new Promise<NextResponse>((resolve) => {
      dbInstance.get(
        `SELECT order_data, total_amount, order_token FROM pending_orders WHERE order_token = ? AND expires_at > NOW()`,
        [orderToken],
        async (err: any, pendingOrder: any) => {
          if (err) {
            console.error('PayPlus callback POST: Database error while looking up pending order', {
              error: err,
              errorMessage: err?.message,
              errorCode: err?.code,
              orderToken: orderToken
            });
            return resolve(NextResponse.json(
              { error: 'Database error' },
              { status: 500 }
            ));
          }

          if (!pendingOrder) {
            console.error('PayPlus callback POST: Pending order not found or expired', orderToken);
            return resolve(NextResponse.json(
              { error: 'Order not found or expired' },
              { status: 404 }
            ));
          }

          // Determine payment status - PayPlus may send status in different formats
          // In test mode, always succeed
          // IMPORTANT: If no status parameter, assume success (PayPlus may send POST without status)
          const isSuccess = isTestMode || 
            !status || // No status = success (PayPlus default behavior)
            status === 'success' || 
            status === 'approved' || 
            status === '1' ||
            status === 'Success' ||
            status === 'SUCCESS' ||
            status === 'paid' ||
            status === 'Paid' ||
            status === 'completed' ||
            status === 'COMPLETED';
          
          console.log('[PayPlus Callback POST] 🔍 Payment Status Check:', {
            isSuccess,
            statusValue: status || 'null/undefined',
            reasoning: !status ? 'No status parameter - treating as success (PayPlus default)' : `Status value: ${status}`,
            willCreateOrder: isSuccess
          });
          
          if (!isSuccess) {
            console.log('[PayPlus Callback POST] ❌ Payment failed, deleting pending order');
            // Payment failed - delete pending order
            dbInstance.run(
              `DELETE FROM pending_orders WHERE order_token = ?`,
              [orderToken],
              () => {}
            );
            return resolve(NextResponse.json({
              success: false,
              error: 'Payment failed',
            }));
          }

          // Payment successful - create actual order
          try {
            const orderData = JSON.parse(pendingOrder.order_data);
            const orderResult = await saveOrder(orderData.items, orderData.customer, orderData.orderNumber);
            
            // Delete pending order
            dbInstance.run(
              `DELETE FROM pending_orders WHERE order_token = ?`,
              [orderToken],
              () => {}
            );

            // Send Telegram notification
            console.log(`[PayPlus Callback POST] Order created successfully!`);
            console.log(`[PayPlus Callback POST] - Order ID: ${orderResult.orderId}`);
            console.log(`[PayPlus Callback POST] - Order Number: ${orderResult.orderNumber}`);
            console.log(`[PayPlus Callback POST] - Total: ₪${orderResult.total}`);
            console.log(`[PayPlus Callback POST] Sending Telegram notification for order #${orderResult.orderId}...`);
            
            // Send notifications synchronously to ensure they complete
            try {
              const telegramSuccess = await sendOrderNotification(orderResult.orderId);
              if (telegramSuccess) {
                console.log(`[PayPlus Callback POST] ✅ Telegram notification sent successfully for order #${orderResult.orderId}`);
              } else {
                console.log(`[PayPlus Callback POST] ⚠️ Failed to send Telegram notification for order #${orderResult.orderId}`);
                console.log(`[PayPlus Callback POST] ⚠️ Check that Telegram bot is configured and recipients are added in admin panel`);
              }
            } catch (error) {
              console.error(`[PayPlus Callback POST] ❌ Error sending Telegram notification:`, error);
            }

            // Send email notifications
            console.log(`[PayPlus Callback POST] Sending email notifications...`);
            const emailData = {
              orderNumber: orderResult.orderNumber,
              customerName: orderData.customer.name || 'Customer',
              customerEmail: orderData.customer.email,
              items: orderData.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })),
              total: orderResult.total,
              deliveryAddress: orderData.customer.deliveryAddress
            };

            // Send customer confirmation email
            try {
              const customerEmailSuccess = await sendOrderConfirmationEmail(emailData);
              if (customerEmailSuccess) {
                console.log(`[PayPlus Callback POST] ✅ Customer confirmation email sent to ${orderData.customer.email}`);
              } else {
                console.log(`[PayPlus Callback POST] ⚠️ Failed to send customer email`);
              }
            } catch (error) {
              console.error(`[PayPlus Callback POST] ❌ Error sending customer email:`, error);
            }

            // Admin notification email removed - not needed

            resolve(NextResponse.json({
              success: true,
              orderId: orderResult.orderId,
              orderNumber: orderResult.orderNumber,
              status: 'paid',
            }));
          } catch (error: any) {
            console.error('PayPlus callback: Error creating order', error);
            resolve(NextResponse.json(
              { error: 'Order creation failed' },
              { status: 500 }
            ));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('PayPlus callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

