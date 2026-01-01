import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';

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
    // Calculate total including addons and custom ingredients
    const total = items.reduce((sum: number, item: any) => {
      const itemPrice = item.price * item.quantity;
      const addonsPrice = (item.addons || []).reduce((addonTotal: number, addon: any) => 
        addonTotal + addon.price * addon.quantity * item.quantity, 0
      );
      const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal: number, ing: any) => 
        ingTotal + ing.price * item.quantity, 0
      );
      return sum + itemPrice + addonsPrice + ingredientsPrice;
    }, 0);
    
    // Build notes with addon and ingredient information
    const notesParts = [`Order: ${orderNumber}`];
    items.forEach((item: any, idx: number) => {
      if (item.addons && item.addons.length > 0) {
        const addonsList = item.addons.map((a: any) => `${a.name} (x${a.quantity})`).join(', ');
        notesParts.push(`Item ${idx + 1} addons: ${addonsList}`);
      }
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredientsList = item.customIngredients.map((ing: any) => ing.name).join(', ');
        notesParts.push(`Item ${idx + 1} custom ingredients: ${ingredientsList}`);
      }
    });
    const notes = notesParts.join(' | ');
    
    dbInstance.run(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
          // Calculate item price including addons and ingredients
          const addonsPrice = (item.addons || []).reduce((addonTotal: number, addon: any) => 
            addonTotal + addon.price * addon.quantity, 0
          );
          const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal: number, ing: any) => 
            ingTotal + ing.price, 0
          );
          const itemTotalPrice = item.price + addonsPrice + ingredientsPrice;
          
          // Build item name with addons and ingredients info
          let itemName = item.name;
          if (item.addons && item.addons.length > 0) {
            const addonsList = item.addons.map((a: any) => `+${a.name}${a.quantity > 1 ? `(x${a.quantity})` : ''}`).join(' ');
            itemName += ` [${addonsList}]`;
          }
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
    
    // Get order token from callback URL
    const orderToken = searchParams.get('token');
    if (!orderToken) {
      console.error('PayPlus callback: Missing order token');
      
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
    
    // In test mode, automatically mark as success
    if (isTestMode) {
      console.log('🧪 PayPlus TEST MODE: Auto-approving payment');
    }
    
    const dbInstance = getDatabase();
    
    // Retrieve pending order data
    return new Promise<NextResponse>((resolve) => {
      dbInstance.get(
        `SELECT order_data, total_amount, order_token FROM pending_orders WHERE order_token = ? AND expires_at > datetime('now')`,
        [orderToken],
        async (err: any, pendingOrder: any) => {
          if (err || !pendingOrder) {
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
          const isSuccess = isTestMode || 
            status === 'success' || 
            status === 'approved' || 
            status === '1' ||
            status === 'Success' ||
            status === 'SUCCESS' ||
            status === 'paid' ||
            status === 'Paid';
          
          if (!isSuccess) {
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
            fetch('/api/telegram/notify-service', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderResult.orderId }),
            }).catch(() => {
              // Ignore errors - notification is non-critical
            });
            
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
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;
    
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
        `SELECT order_data, total_amount, order_token FROM pending_orders WHERE order_token = ? AND expires_at > datetime('now')`,
        [orderToken],
        async (err: any, pendingOrder: any) => {
          if (err || !pendingOrder) {
            console.error('PayPlus callback: Pending order not found or expired', orderToken);
            return resolve(NextResponse.json(
              { error: 'Order not found or expired' },
              { status: 404 }
            ));
          }

          // Determine payment status - PayPlus may send status in different formats
          // In test mode, always succeed
          const isSuccess = isTestMode || 
            status === 'success' || 
            status === 'approved' || 
            status === '1' ||
            status === 'Success' ||
            status === 'SUCCESS' ||
            status === 'paid' ||
            status === 'Paid';
          
          if (!isSuccess) {
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
            fetch('/api/telegram/notify-service', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderResult.orderId }),
            }).catch(() => {});

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

