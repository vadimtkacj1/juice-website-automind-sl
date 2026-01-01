import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';
import { translateObject } from '@/lib/translations';

export async function GET() {
  const db = getDatabase();

  return new Promise<NextResponse>((resolve) => {
    db.all(
      `SELECT o.*, 
        COUNT(oi.id) as items_count,
        GROUP_CONCAT(oi.item_name, ', ') as product_names
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      (err: Error | null, orders: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        const translatedOrders = (orders || []).map((order: any) => translateObject(order));
        resolve(NextResponse.json(translatedOrders));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { customer_name, customer_email, customer_phone, delivery_address, items, notes } = await request.json();

    if (!customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Calculate total
    const total_amount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, payment_method, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [customer_name, customer_email || null, customer_phone || null, delivery_address || null, total_amount, null, notes || null],
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to create order' }, { status: 500 }));
            return;
          }

          const orderId = this.lastID;

          // Insert order items
          const itemsPromises = items.map((item: any) => {
            return new Promise((resolveItem) => {
              db.run(
                `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.menu_item_id || item.product_id, item.item_name || item.product_name, item.quantity, item.price],
                (err: Error | null) => {
                  resolveItem(err);
                }
              );
            });
          });

          Promise.all(itemsPromises).then(() => {
            // Send Telegram notification via service (non-blocking)
            fetch('/api/telegram/notify-service', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId }),
            }).catch(() => {
              // Ignore errors - notification is non-critical
            });
            
            resolve(NextResponse.json({
              success: true,
              orderId,
              message: 'Order created successfully'
            }));
          });
        }
      );
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

