import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise<NextResponse>((resolve) => {
    db.all(
      'SELECT * FROM promo_codes ORDER BY created_at DESC',
      (err: Error | null, promoCodes: any[]) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json(promoCodes || []));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { code, discount_type, discount_value, usage_limit, is_active, start_date, end_date } = await request.json();

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: 'Code, discount type, and discount value are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      // Check if code already exists
      db.get('SELECT id FROM promo_codes WHERE code = ?', [code], (err: Error | null, existing: any) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        if (existing) {
          resolve(NextResponse.json({ error: 'Promo code already exists' }, { status: 400 }));
          return;
        }

        db.run(
          `INSERT INTO promo_codes (code, discount_type, discount_value, usage_limit, is_active, start_date, end_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            code.toUpperCase(),
            discount_type,
            discount_value,
            usage_limit || null,
            is_active !== undefined ? is_active : 1,
            start_date || null,
            end_date || null
          ],
          function(this: { lastID: number; changes: number }, err: Error | null) {
            if (err) {
              resolve(NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 }));
              return;
            }

            resolve(NextResponse.json({
              success: true,
              id: this.lastID,
              message: 'Promo code created successfully'
            }));
          }
        );
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

