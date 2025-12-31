import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const getDatabase = require('@/lib/database');
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

    return new Promise((resolve) => {
      db.all(query, params, (err: any, rows: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ addons: rows || [] }));
      });
    });
  } catch (error: any) {
    console.error('API error:', error);
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

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise((resolve) => {
      db.run(
        `INSERT INTO addons (name, description, price, image, is_available, sort_order) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || null,
          price,
          image || null,
          is_available !== false ? 1 : 0,
          sort_order || 0
        ],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(
            NextResponse.json(
              { 
                id: this.lastID, 
                name, description, price, image, is_available, sort_order 
              },
              { status: 201 }
            )
          );
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

