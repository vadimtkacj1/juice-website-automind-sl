import { NextRequest, NextResponse } from 'next/server';

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
      db.all('SELECT * FROM business_hours ORDER BY sort_order, day_of_week', [], (err: Error | null, rows: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ businessHours: rows || [] }));
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
    const { day_of_week, open_time, close_time, sort_order, is_active } = body;

    if (!day_of_week || !open_time || !close_time) {
      return NextResponse.json(
        { error: 'Day of week, open time, and close time are required.' },
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
        'INSERT INTO business_hours (day_of_week, open_time, close_time, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
        [day_of_week, open_time, close_time, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1],
        function (this: any, err: Error | null) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(
            NextResponse.json(
              {
                id: this.lastID,
                day_of_week,
                open_time,
                close_time,
                sort_order: sort_order || 0,
                is_active: is_active !== undefined ? is_active : true
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

