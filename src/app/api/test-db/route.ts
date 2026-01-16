import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

/**
 * Test database connection and pending_orders table
 * Visit /api/test-db to check if MySQL is running and configured correctly
 */
export async function GET() {
  try {
    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      // Test 1: Check if we can query the database
      db.get(
        `SELECT 1 as test`,
        [],
        (err1: any, result1: any) => {
          if (err1) {
            console.error('[DB Test] Basic query failed:', err1);
            return resolve(NextResponse.json({
              success: false,
              error: 'Database connection failed',
              details: err1?.message,
              errorCode: err1?.code,
              mysqlConfig: {
                host: process.env.MYSQL_HOST || 'localhost',
                port: process.env.MYSQL_PORT || '3306',
                user: process.env.MYSQL_USER || 'root',
                database: process.env.MYSQL_DATABASE || 'juice_website',
              }
            }, { status: 500 }));
          }

          // Test 2: Check if pending_orders table exists
          db.all(
            `SELECT order_token, total_amount, expires_at, created_at FROM pending_orders ORDER BY created_at DESC LIMIT 10`,
            [],
            (err2: any, orders: any) => {
              if (err2) {
                console.error('[DB Test] pending_orders query failed:', err2);
                return resolve(NextResponse.json({
                  success: false,
                  error: 'pending_orders table query failed',
                  details: err2?.message,
                  errorCode: err2?.code,
                  hint: 'The pending_orders table may not exist. Please run database migrations.',
                }, { status: 500 }));
              }

              // Test 3: Get current time from database
              db.get(
                `SELECT NOW() as currentTime`,
                [],
                (err3: any, timeResult: any) => {
                  if (err3) {
                    console.error('[DB Test] NOW() query failed:', err3);
                  }

                  return resolve(NextResponse.json({
                    success: true,
                    message: 'Database connection is working!',
                    tests: {
                      basicQuery: true,
                      pendingOrdersTable: true,
                      timeQuery: !err3
                    },
                    data: {
                      pendingOrdersCount: orders?.length || 0,
                      recentOrders: orders?.slice(0, 3).map((o: any) => ({
                        token: o.order_token?.substring(0, 16) + '...',
                        amount: o.total_amount,
                        expiresAt: o.expires_at,
                        createdAt: o.created_at
                      })) || [],
                      databaseTime: timeResult?.currentTime,
                      serverTime: new Date().toISOString()
                    },
                    mysqlConfig: {
                      host: process.env.MYSQL_HOST || 'localhost',
                      port: process.env.MYSQL_PORT || '3306',
                      user: process.env.MYSQL_USER || 'root',
                      database: process.env.MYSQL_DATABASE || 'juice_website',
                    }
                  }));
                }
              );
            }
          );
        }
      );
    });
  } catch (error: any) {
    console.error('[DB Test] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error?.message
    }, { status: 500 });
  }
}
