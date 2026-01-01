import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util'; // Импортируем promisify
import { translateObject } from '@/lib/translations';
const getDatabase = require('@/lib/database');

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = 'SELECT * FROM addons';
    const params: any[] = [];

    if (!includeInactive) {
      query += ' WHERE is_available = 1';
    }

    query += ' ORDER BY sort_order, name';

    const dbAll = promisify(db.all).bind(db); // Промисифицируем db.all

    try {
      const rows = await dbAll(query, params);
      const translatedAddons = (rows || []).map((addon: any) => translateObject(addon));
      return NextResponse.json({ addons: translatedAddons });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, is_available, sort_order } = body;

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

    // Пользовательская обертка для db.run, чтобы получить this.lastID
    const runAndGetLastID = (sql: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(this: any, err: any) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID); // Разрешаем с lastID
        });
      });
    };

    try {
      const lastID = await runAndGetLastID(
        `INSERT INTO addons (name, description, price, image, is_available, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || null,
          price,
          image || null,
          is_available !== false ? 1 : 0,
          sort_order || 0
        ]
      );

      return NextResponse.json(
        {
          id: lastID,
          name, description, price, image, is_available, sort_order
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
