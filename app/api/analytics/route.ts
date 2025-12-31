import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise((resolve) => {
    // Get total orders
    db.get('SELECT COUNT(*) as totalOrders, SUM(total_amount) as totalRevenue FROM orders', (err: Error | null, ordersData: any) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
        return;
      }

      // Get total products (menu items)
      db.get('SELECT COUNT(*) as totalProducts FROM menu_items', (err: Error | null, productsData: any) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        // Get active promo codes
        db.get('SELECT COUNT(*) as activePromoCodes FROM promo_codes WHERE is_active = 1', (err: Error | null, promoData: any) => {
          if (err) {
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          // Get recent orders
          db.all(
            `SELECT o.*, COUNT(oi.id) as items_count 
             FROM orders o 
             LEFT JOIN order_items oi ON o.id = oi.order_id 
             GROUP BY o.id 
             ORDER BY o.created_at DESC 
             LIMIT 10`,
            (err: Error | null, recentOrders: any[]) => {
              if (err) {
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                return;
              }

              // Get orders by status
              db.all(
                'SELECT status, COUNT(*) as count FROM orders GROUP BY status',
                (err: Error | null, ordersByStatus: any[]) => {
                  if (err) {
                    resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                    return;
                  }

                  // Get revenue by month (last 6 months)
                  db.all(
                    `SELECT 
                      strftime('%Y-%m', created_at) as month,
                      SUM(total_amount) as revenue,
                      COUNT(*) as orders
                     FROM orders 
                     WHERE created_at >= date('now', '-6 months')
                     GROUP BY month
                     ORDER BY month ASC`,
                    (err: Error | null, revenueByMonth: any[]) => {
                      if (err) {
                        resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                        return;
                      }

                      // Get top selling products
                      db.all(
                        `SELECT 
                          mi.name,
                          SUM(oi.quantity) as total_sold,
                          SUM(oi.quantity * oi.price) as revenue
                         FROM order_items oi
                         JOIN menu_items mi ON oi.menu_item_id = mi.id
                         GROUP BY oi.menu_item_id
                         ORDER BY total_sold DESC
                         LIMIT 5`,
                        (err: Error | null, topProducts: any[]) => {
                          if (err) {
                            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
                            return;
                          }

                          resolve(NextResponse.json({
                            totalOrders: ordersData.totalOrders || 0,
                            totalRevenue: ordersData.totalRevenue || 0,
                            totalProducts: productsData.totalProducts || 0,
                            activePromoCodes: promoData.activePromoCodes || 0,
                            recentOrders: recentOrders || [],
                            ordersByStatus: ordersByStatus || [],
                            revenueByMonth: revenueByMonth || [],
                            topProducts: topProducts || []
                          }));
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
  });
}
