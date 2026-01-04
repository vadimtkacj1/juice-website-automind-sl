import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { translateObject } from '@/lib/translations';

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisify db.all for async/await
const dbAll = (db: any, query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export async function GET() {
  const db = getDatabase();

  if (!db) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }

  try {
    // Get total orders and revenue
    const ordersData = await dbGet(db, 'SELECT COUNT(*) as totalOrders, SUM(total_amount) as totalRevenue FROM orders');

    // Get total products (menu items)
    const productsData = await dbGet(db, 'SELECT COUNT(*) as totalProducts FROM menu_items');

    // Get active promo codes
    const promoData = await dbGet(db, 'SELECT COUNT(*) as activePromoCodes FROM promo_codes WHERE is_active = 1');

    // Get recent orders
    const recentOrders = await dbAll(
      db,
      `SELECT o.*, COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Get orders by status
    const ordersByStatus = await dbAll(
      db,
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    // Get revenue by month (last 6 months) - MySQL version
    const revenueByMonth = await dbAll(
      db,
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month
       ORDER BY month ASC`
    );

    // Get top selling products
    const topProducts = await dbAll(
      db,
      `SELECT
        mi.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       GROUP BY oi.menu_item_id
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    return NextResponse.json({
      totalOrders: ordersData?.totalOrders || 0,
      totalRevenue: ordersData?.totalRevenue || 0,
      totalProducts: productsData?.totalProducts || 0,
      activePromoCodes: promoData?.activePromoCodes || 0,
      recentOrders: (recentOrders || []).map((order: any) => translateObject(order)),
      ordersByStatus: (ordersByStatus || []).map((status: any) => translateObject(status)),
      revenueByMonth: (revenueByMonth || []).map((month: any) => translateObject(month)),
      topProducts: (topProducts || []).map((product: any) => translateObject(product))
    });

  } catch (error: any) {
    console.error('API error (GET analytics):', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
