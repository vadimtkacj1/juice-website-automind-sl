import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// Promisify db.all for async/await
const dbAll = (db: any, query: string, params: any[] = []) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Promisify db.run for async/await
const dbRun = (db: any, query: string, params: any[] = []) => {
  return new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
    db.run(query, params, function(this: { lastID: number; changes: number }, err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export async function GET() {
  try {
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const businessHours = await dbAll(db, 'SELECT * FROM business_hours ORDER BY sort_order, day_of_week');
    return NextResponse.json({ businessHours });
  } catch (error: any) {
    console.error('API error fetching business hours:', error);
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
        { error: 'Day of week, open time, and close time are required' },
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

    const result = await dbRun(
      db,
      `INSERT INTO business_hours (day_of_week, open_time, close_time, sort_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        day_of_week,
        open_time,
        close_time,
        sort_order || 0,
        is_active !== false ? 1 : 0,
      ]
    );

    return NextResponse.json({
      id: result.lastID,
      day_of_week,
      open_time,
      close_time,
      sort_order: sort_order || 0,
      is_active: is_active !== false ? 1 : 0,
    });
  } catch (error: any) {
    console.error('API error creating business hours:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

