import { NextRequest, NextResponse } from 'next/server';

// Promisify db.all and db.run for async/await
const dbAll = (db: any, query: string, params: any[] = []) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

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
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    try {
      const rows = await dbAll(db, 'SELECT * FROM contacts');
      return NextResponse.json({ contacts: rows || [] });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
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
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required.' },
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

    try {
      const runResult = await dbRun(
        db,
        'INSERT INTO contacts (type, value) VALUES (?, ?)',
        [type, value]
      );
      return NextResponse.json({ id: runResult.lastID, type, value }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

