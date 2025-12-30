import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { createRapydCheckout, isRapydConfigured } from '@/lib/rapyd';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerInfo {
  phone: string;
  email: string;
}

// Helper to save order to database
async function saveOrder(items: CartItem[], customer: CustomerInfo, paymentMethod: string): Promise<{
  orderId: number;
  orderNumber: string;
  total: number;
}> {
  return new Promise((resolve, reject) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    db.run(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, status, payment_method, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      ['Customer', customer.email, customer.phone, total, 'pending', paymentMethod, `Order: ${orderNumber}`],
      function(err: any) {
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
          db.run(
            `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.id, item.name, item.quantity, item.price],
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
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!customer || !customer.phone || !customer.email) {
      return NextResponse.json(
        { error: 'Phone and email are required' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const total = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

    // Check if Rapyd is configured
    if (isRapydConfigured()) {
      // Save order to database first
      let orderData: { orderId: number; orderNumber: string; total: number } | null = null;
      try {
        orderData = await saveOrder(items, customer, 'rapyd');
      } catch (dbError) {
        console.error('Database error saving order:', dbError);
        // Continue anyway - don't block checkout
      }

      // Create Rapyd checkout
      const rapydResult = await createRapydCheckout({
        amount: total,
        currency: 'ILS', // Israeli Shekel
        country: 'IL', // Israel
        customer_email: customer.email,
        customer_phone: customer.phone,
        complete_checkout_url: `${origin}/checkout/success?order=${orderData?.orderNumber || ''}`,
        cancel_checkout_url: `${origin}/menu`,
        metadata: {
          order_number: orderData?.orderNumber || '',
          order_id: orderData?.orderId || '',
        },
        cart_items: items.map((item: CartItem) => ({
          name: item.name,
          amount: item.price,
          quantity: item.quantity,
        })),
      });

      if (rapydResult.success && rapydResult.checkoutUrl) {
        return NextResponse.json({
          url: rapydResult.checkoutUrl,
          checkoutId: rapydResult.checkoutId,
        });
      }

      // Rapyd failed - return error
      return NextResponse.json(
        { error: rapydResult.error || 'Failed to create payment' },
        { status: 500 }
      );
    }

    // Rapyd not configured - return error with instructions
    return NextResponse.json(
      { 
        error: 'Payment not configured. Add RAPYD_ACCESS_KEY and RAPYD_SECRET_KEY to .env.local',
        instructions: 'Get your API keys from https://dashboard.rapyd.net'
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
