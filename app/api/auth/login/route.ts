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

    return new Promise((resolve) => {
      db.get(
        'SELECT * FROM admins WHERE username = ?',
        [username],
        async (err: Error | null, admin: any) => {
          if (err) {
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
            return;
          }

          if (!admin) {
            resolve(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
            return;
          }

          const isValid = await verifyPassword(password, admin.password);

          if (!isValid) {
            resolve(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
            return;
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

          resolve(response);
        }
      );
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

