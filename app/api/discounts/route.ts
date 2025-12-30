import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise((resolve) => {
    db.all(
      `SELECT d.*, p.name as product_name
       FROM discounts d
       LEFT JOIN products p ON d.product_id = p.id
       ORDER BY d.created_at DESC`,
      (err: Error | null, discounts: any[]) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json(discounts || []));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, value, product_id, is_active, start_date, end_date } = await request.json();

    if (!name || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Name, type, and value are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise((resolve) => {
      db.run(
        `INSERT INTO discounts (name, type, value, product_id, is_active, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          type,
          value,
          product_id || null,
          is_active !== undefined ? is_active : 1,
          start_date || null,
          end_date || null
        ],
        function(err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to create discount' }, { status: 500 }));
            return;
          }

          resolve(NextResponse.json({
            success: true,
            id: this.lastID,
            message: 'Discount created successfully'
          }));
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

