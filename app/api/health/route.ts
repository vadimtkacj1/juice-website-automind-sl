import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

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
    return new Promise<NextResponse>((resolve) => {
      db.get('SELECT 1', (err: Error | null) => {
        if (err) {
          resolve(
            NextResponse.json(
              { status: 'error', message: 'Database query failed', error: err.message },
              { status: 503 }
            )
          );
          return;
        }

        resolve(
          NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
          })
        );
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 503 }
    );
  }
}

