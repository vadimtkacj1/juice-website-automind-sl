import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// Helper function to send notification (can be called directly from server-side)
async function sendTelegramNotification(orderId: number) {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/telegram/notify-service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`[Test Order] Notification response:`, result);
      return result;
    } else {
      const errorText = await response.text();
      console.error(`[Test Order] Notification failed: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (err: any) {
    console.error(`[Test Order] Notification error:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();

    return new Promise((resolve) => {
      // First, get some real menu items from database
      db.all(
        'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY RANDOM() LIMIT 3',
        [],
        (itemsErr: Error | null, menuItems: any[]) => {
          if (itemsErr || !menuItems || menuItems.length === 0) {
            // If no menu items, create a simple test order
            const testOrder = {
              customer_name: 'Test Customer',
              customer_email: 'test@example.com',
              customer_phone: '+1234567890',
              delivery_address: '123 Test Street, Test City, Test State 12345',
              total_amount: 25.99,
              status: 'pending',
              notes: 'TEST ORDER - This is a test order for Telegram delivery system'
            };

            db.run(
              `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method, notes, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
              [testOrder.customer_name, testOrder.customer_email, testOrder.customer_phone, 
               testOrder.delivery_address, testOrder.total_amount, testOrder.status, null, testOrder.notes],
              function(err: Error | null) {
                if (err) {
                  resolve(NextResponse.json({ error: 'Failed to create test order' }, { status: 500 }));
                  return;
                }

                const orderId = this.lastID;

                // Add simple test items
                const testItems = [
                  { name: 'Test Item 1', quantity: 2, price: 10.99, menu_item_id: 1 },
                  { name: 'Test Item 2', quantity: 1, price: 4.01, menu_item_id: 1 }
                ];

                let itemsInserted = 0;
                testItems.forEach((item) => {
                  db.run(
                    `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.menu_item_id, item.name, item.quantity, item.price],
                    (itemErr: Error | null) => {
                      if (itemErr) {
                        console.error('Error inserting test order item:', itemErr);
                      }
                      itemsInserted++;
                      
                      if (itemsInserted === testItems.length) {
                        // Send notification
                        console.log(`[Test Order] Created order #${orderId}, sending Telegram notification...`);
                        sendTelegramNotification(orderId).catch((err) => {
                          console.error(`[Test Order] Notification error:`, err);
                        });

                        resolve(NextResponse.json({
                          success: true,
                          orderId,
                          message: 'Test order created successfully. Telegram notification sent.',
                          order: {
                            id: orderId,
                            customer_name: testOrder.customer_name,
                            total: testOrder.total_amount
                          }
                        }));
                      }
                    }
                  );
                });
              }
            );
            return;
          }

          // Calculate total from real menu items
          const total_amount = menuItems.reduce((sum, item, index) => {
            const quantity = index === 0 ? 2 : 1; // First item x2, others x1
            return sum + (item.price * quantity);
          }, 0);

          // Create test order with real items
          const testOrder = {
            customer_name: 'Test Customer',
            customer_email: 'test@example.com',
            customer_phone: '+1234567890',
            delivery_address: '123 Test Street, Test City, Test State 12345',
            total_amount: total_amount,
            status: 'pending',
            notes: 'TEST ORDER - This is a test order for Telegram delivery system'
          };

          db.run(
            `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, status, payment_method, notes, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [testOrder.customer_name, testOrder.customer_email, testOrder.customer_phone, 
             testOrder.delivery_address, testOrder.total_amount, testOrder.status, null, testOrder.notes],
            function(err: Error | null) {
              if (err) {
                resolve(NextResponse.json({ error: 'Failed to create test order' }, { status: 500 }));
                return;
              }

              const orderId = this.lastID;

              // Add real menu items to order
              let itemsInserted = 0;
              menuItems.forEach((item, index) => {
                const quantity = index === 0 ? 2 : 1; // First item x2, others x1
                
                db.run(
                  `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) 
                   VALUES (?, ?, ?, ?, ?)`,
                  [orderId, item.id, item.name, quantity, item.price],
                  (itemErr: Error | null) => {
                    if (itemErr) {
                      console.error('Error inserting test order item:', itemErr);
                    }
                    itemsInserted++;
                    
                    // When all items are inserted, send notification
                    if (itemsInserted === menuItems.length) {
                      // Send Telegram notification via service (non-blocking)
                      console.log(`[Test Order] Created order #${orderId}, sending Telegram notification...`);
                      sendTelegramNotification(orderId).catch((err) => {
                        console.error(`[Test Order] Notification error:`, err);
                      });

                      resolve(NextResponse.json({
                        success: true,
                        orderId,
                        message: `Test order #${orderId} created successfully with ${menuItems.length} real menu items. Telegram notification sent.`,
                        order: {
                          id: orderId,
                          customer_name: testOrder.customer_name,
                          total: testOrder.total_amount,
                          items_count: menuItems.length
                        }
                      }));
                    }
                  }
                );
              });
            }
          );
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

