import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { translateObject } from '@/lib/translations';
const getDatabase = require('@/lib/database');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const dbAll = promisify(db.all).bind(db);

    try {
      const rows = await dbAll(
        'SELECT * FROM menu_item_additional_items WHERE menu_item_id = ? AND is_available = 1 ORDER BY sort_order, name',
        [id]
      );
      const translatedItems = (rows || []).map((item: any) => translateObject(item));
      return NextResponse.json({ additionalItems: translatedItems });
    } catch (err: any) {
      console.error('Database error (GET):', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error (GET):', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, is_available, sort_order } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required.' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const runAndGetLastID = (sql: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(this: any, err: any) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID);
        });
      });
    };

    try {
      const lastID = await runAndGetLastID(
        `INSERT INTO menu_item_additional_items (menu_item_id, name, description, price, is_available, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          description || null,
          price,
          is_available !== false ? 1 : 0,
          sort_order || 0
        ]
      );

      return NextResponse.json(
        {
          id: lastID,
          menu_item_id: parseInt(id),
          name, description, price, is_available, sort_order
        },
        { status: 201 }
      );
    } catch (err: any) {
      console.error('Database error (POST):', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error (POST):', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

