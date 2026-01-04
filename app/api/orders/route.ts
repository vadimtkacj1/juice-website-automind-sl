import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { sendOrderNotification } from '@/lib/telegram-bot';
import { translateObject } from '@/lib/translations';

// Promisify db.all for async/await
const dbAll = (db: any, query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisify db.run for async/await
const dbRun = (db: any, query: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(this: { lastID: number; changes: number }, err: Error | null) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export async function GET() {
  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const orders = await dbAll(
      db,
      `SELECT o.*, 
        COUNT(oi.id) as items_count,
        GROUP_CONCAT(oi.item_name, ', ') as product_names
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    const translatedOrders = orders.map((order: any) => translateObject(order));
    return NextResponse.json(translatedOrders);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
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
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Calculate total
    const total_amount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderResult = await dbRun(
      db,
      `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, payment_method, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [customer_name, customer_email || null, customer_phone || null, delivery_address || null, total_amount, null, notes || null]
    );

    const orderId = orderResult.lastID;

    // Insert order items
    for (const item of items) {
      await dbRun(
        db,
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.menu_item_id || item.product_id, item.item_name || item.product_name, item.quantity, item.price]
      );
    }

    // Send Telegram notification via service (non-blocking)
    fetch('/api/telegram/notify-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    }).catch(() => {
      // Ignore errors - notification is non-critical
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully'
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

