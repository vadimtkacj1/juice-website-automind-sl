import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';
import { generatePayPlusLink } from '@/lib/payplus';
import { CartItem } from '@/lib/cart-context';
import crypto from 'crypto';

interface CustomerInfo {
  phone: string;
  email: string;
  name?: string;
  deliveryAddress?: string;
}

// Helper to calculate order total
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const itemPrice = item.price * item.quantity;
    const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal, ing) => 
      ingTotal + ing.price * item.quantity, 0
    );
    return sum + itemPrice + ingredientsPrice;
  }, 0);
}

// Helper to save pending order (before payment)
async function savePendingOrder(items: CartItem[], customer: CustomerInfo, total: number): Promise<{
  orderToken: string;
  orderNumber: string;
}> {
  return new Promise((resolve, reject) => {
    const dbInstance = getDatabase();
    const orderToken = crypto.randomBytes(32).toString('hex');
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Store order data as JSON
    const orderData = {
      items,
      customer,
      orderNumber,
    };
    
    // Set expiration to 1 hour from now
    // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    
    dbInstance.run(
      `INSERT INTO pending_orders (order_token, order_data, total_amount, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [orderToken, JSON.stringify(orderData), total, expiresAt],
      function(this: { lastID: number; changes: number }, err: any) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ orderToken, orderNumber });
      }
    );
  });
}

// Helper to save order to database (after payment)
async function saveOrder(items: CartItem[], customer: CustomerInfo): Promise<{
  orderId: number;
  orderNumber: string;
  total: number;
}> {
  return new Promise((resolve, reject) => {
    const dbInstance = getDatabase();
    // Calculate total including custom ingredients
    const total = items.reduce((sum, item) => {
      const itemPrice = item.price * item.quantity;
      const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal, ing) => 
        ingTotal + ing.price * item.quantity, 0
      );
      return sum + itemPrice + ingredientsPrice;
    }, 0);
    
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Build notes with ingredient information
    const notesParts = [`Order: ${orderNumber}`];
    items.forEach((item, idx) => {
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredientsList = item.customIngredients.map(ing => ing.name).join(', ');
        notesParts.push(`Item ${idx + 1} custom ingredients: ${ingredientsList}`);
      }
    });
    const notes = notesParts.join(' | ');
    
    dbInstance.run(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [customer.name || 'Customer', customer.email, customer.phone, customer.deliveryAddress || null, total, 'pending', null, notes],
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
          const ingredientsPrice = (item.customIngredients || []).reduce((ingTotal, ing) => 
            ingTotal + ing.price, 0
          );
          const additionalItemsPrice = (item.additionalItems || []).reduce((addTotal, addItem) => 
            addTotal + addItem.price, 0
          );
          const itemTotalPrice = item.price + ingredientsPrice + additionalItemsPrice;
          
          // Build item name with ingredients and additional items info
          let itemName = item.name;
          if (item.customIngredients && item.customIngredients.length > 0) {
            const ingredientsList = item.customIngredients.map(ing => ing.name).join(', ');
            itemName += ` [Ingredients: ${ingredientsList}]`;
          }
          if (item.additionalItems && item.additionalItems.length > 0) {
            const additionalList = item.additionalItems.map(addItem => `+${addItem.name}`).join(', ');
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
    const body = await request.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'אין פריטים בעגלה' },
        { status: 400 }
      );
    }

    if (!customer || !customer.phone || !customer.email) {
      return NextResponse.json(
        { error: 'מספר טלפון ואימייל נדרשים' },
        { status: 400 }
      );
    }

    // Calculate total and save pending order (NOT final order yet)
    try {
      const total = calculateTotal(items);
      const pendingOrder = await savePendingOrder(items, customer, total);
      
      // Generate PayPlus payment link
      // Use DEPLOYMENT_URL for production, or construct from request for development
      let baseUrl = process.env.DEPLOYMENT_URL;
      if (!baseUrl) {
        // For development, try to get from request headers
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000';
        baseUrl = `${protocol}://${host}`;
      }
      // Ensure baseUrl doesn't have trailing slash
      baseUrl = baseUrl.replace(/\/$/, '');
      const callbackUrl = `${baseUrl}/api/payplus/callback?token=${pendingOrder.orderToken}`;
      
      console.log('Generating PayPlus link with callback URL:', callbackUrl);
      
      const paymentResult = await generatePayPlusLink({
        amount: total,
        currency_code: 'ILS',
        orderNumber: pendingOrder.orderNumber,
        callbackUrl: callbackUrl,
        customerEmail: customer.email,
        customerName: customer.name || customer.email.split('@')[0],
      });

      if (!paymentResult.success || !paymentResult.paymentUrl) {
        console.error('❌ Failed to generate PayPlus payment link');
        console.error('   Error:', paymentResult.error);
        console.error('   Order:', pendingOrder.orderNumber);
        console.error('   Amount:', total);
        console.error('   API Key configured:', !!process.env.PAYPLUS_API_KEY);
        console.error('   Secret Key configured:', !!process.env.PAYPLUS_SECRET_KEY);
        console.error('   Page UID configured:', !!process.env.PAYPLUS_PAGE_UID);
        console.error('   Test Mode:', process.env.PAYPLUS_TEST_MODE);
        
        // Clean up pending order if payment link generation fails
        const dbInstance = getDatabase();
        dbInstance.run(
          `DELETE FROM pending_orders WHERE order_token = ?`,
          [pendingOrder.orderToken],
          () => {}
        );
        
        return NextResponse.json({
          success: false,
          error: paymentResult.error || 'נכשל ביצירת קישור תשלום. אנא נסה שוב.',
        }, { status: 500 });
      }
      
      console.log('✅ PayPlus payment link generated successfully');
      console.log('   Payment URL:', paymentResult.paymentUrl);
      console.log('   Order:', pendingOrder.orderNumber);

      // Update pending order with payment UID
      const dbInstance = getDatabase();
      dbInstance.run(
        `UPDATE pending_orders SET payment_uid = ? WHERE order_token = ?`,
        [paymentResult.paymentUid || null, pendingOrder.orderToken],
        (err: any) => {
          if (err) {
            console.error('Error updating pending order with payment info:', err);
          }
        }
      );
      
      return NextResponse.json({
        success: true,
        orderToken: pendingOrder.orderToken,
        orderNumber: pendingOrder.orderNumber,
        total: total,
        paymentUrl: paymentResult.paymentUrl,
        redirectUrl: paymentResult.paymentUrl, // Redirect to PayPlus payment page
      });
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      return NextResponse.json(
        { error: 'נכשל בעיבוד ההזמנה. אנא נסה שוב.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'נכשל ליצור סשן תשלום. אנא נסה שוב.' },
      { status: 500 }
    );
  }
}
