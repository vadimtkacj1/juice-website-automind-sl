import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDatabase();
  const orderId = params.id;

  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM orders WHERE id = ?',
      [orderId],
      (err: Error | null, order: any) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        if (!order) {
          resolve(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
          return;
        }

        // Get order items
        db.all(
          'SELECT * FROM order_items WHERE order_id = ?',
          [orderId],
          (err: Error | null, items: any[]) => {
            if (err) {
              resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
              return;
            }

            resolve(NextResponse.json({
              ...order,
              items: items || []
            }));
          }
        );
      }
    );
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { status, notes } = await request.json();

    const db = getDatabase();

    return new Promise((resolve) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (status) {
        updates.push('status = ?');
        values.push(status);
      }

      if (notes !== undefined) {
        updates.push('notes = ?');
        values.push(notes);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(orderId);

      db.run(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to update order' }, { status: 500 }));
            return;
          }

          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
            return;
          }

          resolve(NextResponse.json({ success: true, message: 'Order updated successfully' }));
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDatabase();
  const orderId = params.id;

  return new Promise((resolve) => {
    // Delete order items first
    db.run('DELETE FROM order_items WHERE order_id = ?', [orderId], (err: Error | null) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to delete order items' }, { status: 500 }));
        return;
      }

      // Then delete the order
      db.run('DELETE FROM orders WHERE id = ?', [orderId], function(err: Error | null) {
        if (err) {
          resolve(NextResponse.json({ error: 'Failed to delete order' }, { status: 500 }));
          return;
        }

        if (this.changes === 0) {
          resolve(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
          return;
        }

        resolve(NextResponse.json({ success: true, message: 'Order deleted successfully' }));
      });
    });
  });
}

