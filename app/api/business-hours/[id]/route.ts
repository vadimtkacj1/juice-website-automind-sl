import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisify db.run for async/await
const dbRun = (db: any, query: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.run(query, params, function(err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const businessHour = await dbGet(db, 'SELECT * FROM business_hours WHERE id = ?', [id]);

    if (!businessHour) {
      return NextResponse.json({ error: 'Business hour entry not found' }, { status: 404 });
    }

    return NextResponse.json({ businessHour });
  } catch (error: any) {
    console.error('API error fetching business hour:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
      `UPDATE business_hours 
       SET day_of_week = ?, open_time = ?, close_time = ?, sort_order = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        day_of_week,
        open_time,
        close_time,
        sort_order || 0,
        is_active !== false ? 1 : 0,
        id
      ]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Business hour entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: parseInt(id),
      day_of_week,
      open_time,
      close_time,
      sort_order: sort_order || 0,
      is_active: is_active !== false ? 1 : 0,
    });
  } catch (error: any) {
    console.error('API error updating business hour:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const result = await dbRun(db, 'DELETE FROM business_hours WHERE id = ?', [id]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Business hour entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API error deleting business hour:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

