import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { hashPassword } from '@/lib/auth';

// This endpoint creates a default admin if none exists
export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Promisify db.get and db.run for async/await
    const dbGet = (query: string, params: any[] = []) => {
      return new Promise<any>((resolve, reject) => {
        db.get(query, params, (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    const dbRun = (query: string, params: any[] = []) => {
      return new Promise<any>((resolve, reject) => {
        db.run(query, params, function(err: Error | null) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };

    // Check if any admin exists
    const result = await dbGet('SELECT COUNT(*) as count FROM admins');

    if (result.count > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const runResult = await dbRun(
      'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      id: runResult.lastID
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

