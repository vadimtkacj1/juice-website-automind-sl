import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discountId = params.id;
    const { name, type, value, product_id, is_active, start_date, end_date } = await request.json();

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (type !== undefined) {
        updates.push('type = ?');
        values.push(type);
      }
      if (value !== undefined) {
        updates.push('value = ?');
        values.push(value);
      }
      if (product_id !== undefined) {
        updates.push('product_id = ?');
        values.push(product_id || null);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }
      if (start_date !== undefined) {
        updates.push('start_date = ?');
        values.push(start_date || null);
      }
      if (end_date !== undefined) {
        updates.push('end_date = ?');
        values.push(end_date || null);
      }

      values.push(discountId);

      db.run(
        `UPDATE discounts SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to update discount' }, { status: 500 }));
            return;
          }

          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Discount not found' }, { status: 404 }));
            return;
          }

          resolve(NextResponse.json({ success: true, message: 'Discount updated successfully' }));
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
  const discountId = params.id;

  return new Promise<NextResponse>((resolve) => {
    db.run('DELETE FROM discounts WHERE id = ?', [discountId], function(this: { lastID: number; changes: number }, err: Error | null) {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 }));
        return;
      }

      if (this.changes === 0) {
        resolve(NextResponse.json({ error: 'Discount not found' }, { status: 404 }));
        return;
      }

      resolve(NextResponse.json({ success: true, message: 'Discount deleted successfully' }));
    });
  });
}

