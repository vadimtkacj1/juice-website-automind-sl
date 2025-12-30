import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise((resolve) => {
    db.all(
      `SELECT o.*, 
        COUNT(oi.id) as items_count,
        GROUP_CONCAT(p.name, ', ') as product_names
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      (err: Error | null, orders: any[]) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json(orders || []));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { customer_name, customer_email, customer_phone, items, payment_method, notes } = await request.json();

    if (!customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Calculate total
    const total_amount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return new Promise((resolve) => {
      db.run(
        `INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, payment_method, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [customer_name, customer_email || null, customer_phone || null, total_amount, payment_method || null, notes || null],
        function(err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to create order' }, { status: 500 }));
            return;
          }

          const orderId = this.lastID;

          // Insert order items
          const itemsPromises = items.map((item: any) => {
            return new Promise((resolveItem) => {
              db.run(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.product_name, item.quantity, item.price],
                (err: Error | null) => {
                  resolveItem(err);
                }
              );
            });
          });

          Promise.all(itemsPromises).then(() => {
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

