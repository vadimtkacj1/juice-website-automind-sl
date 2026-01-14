import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export async function GET() {
  try {
    // Check database connection
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 503 }
      );
    }

    // Simple database query to verify connection
    try {
      await dbGet(db, 'SELECT 1');
      
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (err: any) {
      return NextResponse.json(
        { status: 'error', message: 'Database query failed', error: err.message },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 503 }
    );
  }
}

