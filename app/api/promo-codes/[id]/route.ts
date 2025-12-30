import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promoId = params.id;
    const { discount_type, discount_value, usage_limit, is_active, start_date, end_date } = await request.json();

    const db = getDatabase();

    return new Promise((resolve) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (discount_type !== undefined) {
        updates.push('discount_type = ?');
        values.push(discount_type);
      }
      if (discount_value !== undefined) {
        updates.push('discount_value = ?');
        values.push(discount_value);
      }
      if (usage_limit !== undefined) {
        updates.push('usage_limit = ?');
        values.push(usage_limit || null);
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

      values.push(promoId);

      db.run(
        `UPDATE promo_codes SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 }));
            return;
          }

          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Promo code not found' }, { status: 404 }));
            return;
          }

          resolve(NextResponse.json({ success: true, message: 'Promo code updated successfully' }));
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
  const promoId = params.id;

  return new Promise((resolve) => {
    db.run('DELETE FROM promo_codes WHERE id = ?', [promoId], function(err: Error | null) {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 }));
        return;
      }

      if (this.changes === 0) {
        resolve(NextResponse.json({ error: 'Promo code not found' }, { status: 404 }));
        return;
      }

      resolve(NextResponse.json({ success: true, message: 'Promo code deleted successfully' }));
    });
  });
}

