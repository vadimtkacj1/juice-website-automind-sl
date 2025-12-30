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

    // Check if any admin exists
    return new Promise((resolve) => {
      db.get('SELECT COUNT(*) as count FROM admins', async (err: Error | null, result: any) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        if (result.count > 0) {
          resolve(NextResponse.json({ error: 'Admin already exists' }, { status: 400 }));
          return;
        }

        const hashedPassword = await hashPassword(password);

        db.run(
          'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
          [username, hashedPassword, email || null],
          function(err: Error | null) {
            if (err) {
              resolve(NextResponse.json({ error: 'Failed to create admin' }, { status: 500 }));
              return;
            }

            resolve(NextResponse.json({
              success: true,
              message: 'Admin created successfully',
              id: this.lastID
            }));
          }
        );
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

