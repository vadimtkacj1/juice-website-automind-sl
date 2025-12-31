import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { promisify } from 'util'; // Import promisify

export async function GET() {
  const db = getDatabase();

  if (!db) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }

  const dbGet = promisify(db.get).bind(db);
  const dbAll = promisify(db.all).bind(db);

  try {
    // Get total orders and revenue
    const ordersData = await dbGet('SELECT COUNT(*) as totalOrders, SUM(total_amount) as totalRevenue FROM orders');

    // Get total products (menu items)
    const productsData = await dbGet('SELECT COUNT(*) as totalProducts FROM menu_items');

    // Get active promo codes
    const promoData = await dbGet('SELECT COUNT(*) as activePromoCodes FROM promo_codes WHERE is_active = 1');

    // Get recent orders
    const recentOrders = await dbAll(
      `SELECT o.*, COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Get orders by status
    const ordersByStatus = await dbAll(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    // Get revenue by month (last 6 months)
    const revenueByMonth = await dbAll(
      `SELECT
        strftime('%Y-%m', created_at) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
       FROM orders
       WHERE created_at >= date('now', '-6 months')
       GROUP BY month
       ORDER BY month ASC`
    );

    // Get top selling products
    const topProducts = await dbAll(
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
      recentOrders: recentOrders || [],
      ordersByStatus: ordersByStatus || [],
      revenueByMonth: revenueByMonth || [],
      topProducts: topProducts || []
    });

  } catch (error: any) {
    console.error('API error (GET analytics):', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
