import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
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

    // Promisify db.get for async/await
    const dbGet = (db: any, query: string, params: any[] = []): Promise<any> => {
        return new Promise((resolve, reject) => {
            db.get(query, params, (err: Error | null, row: any) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    };

    let admin;
    try {
        admin = await dbGet(db, 'SELECT * FROM admins WHERE username = ?', [username]);
    } catch (err: any) {
        console.error('Database error:', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password);

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const response = NextResponse.json({
        success: true,
        user: {
            id: admin.id,
            username: admin.username,
            email: admin.email
        }
    });

    response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('API error (POST login):', error); // Added specific log
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, // Use error.message if available
      { status: 500 }
    );
  }
}

