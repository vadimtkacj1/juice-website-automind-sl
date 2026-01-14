import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

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
      db.all('SELECT * FROM locations ORDER BY sort_order, id', [], (err: Error | null, rows: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        const translatedLocations = (rows || []).map((location: any) => translateObject(location));
        resolve(NextResponse.json({ locations: translatedLocations }));
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
    const { country, city, address, hours, image, map_url, show_map_button, is_active, sort_order } = body;

    if (!country || !city || !address) {
      return NextResponse.json(
        { error: 'Country, city, and address are required.' },
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
        `INSERT INTO locations (country, city, address, hours, image, map_url, show_map_button, is_active, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [country, city, address, hours || '', image || '', map_url || '', show_map_button !== false ? 1 : 0, is_active !== false ? 1 : 0, sort_order || 0],
        function (this: any, err: Error | null) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(
            NextResponse.json(
              { id: this.lastID, country, city, address, hours, image, map_url, show_map_button },
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
