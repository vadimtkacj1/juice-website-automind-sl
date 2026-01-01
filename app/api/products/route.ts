import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

// Redirect products API to menu-items since we use menu_items table
export async function GET() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      db.all('SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order, name', [], (err: Error | null, rows: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        // Map menu_items to products format for compatibility and translate
        const products = (rows || []).map((item: any) => {
          const translated = translateObject({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            availability: item.is_available ? 1 : 0
          });
          return translated;
        });
        resolve(NextResponse.json({ products }));
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
    const { name, description, price, image, availability } = body;

    if (!name || !price) {
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

    return new Promise<NextResponse>((resolve) => {
      db.run(
        'INSERT INTO products (name, description, price, image, availability) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, image, availability ? 1 : 0],
        function (this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(
            NextResponse.json(
              { id: this.lastID, name, description, price, image, availability },
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

