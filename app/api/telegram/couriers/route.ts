import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  return new Promise<NextResponse>((resolve) => {
    db.all(
      'SELECT * FROM telegram_couriers ORDER BY created_at DESC',
      (err: Error | null, couriers: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }));
          return;
        }

        const formattedCouriers = (couriers || []).map(courier => ({
          id: courier.id,
          telegram_id: courier.telegram_id,
          name: courier.name,
          is_active: courier.is_active === 1
        }));

        resolve(NextResponse.json({ couriers: formattedCouriers }));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { telegram_id, name, is_active } = await request.json();

    if (!telegram_id || !name) {
      return NextResponse.json(
        { error: 'Telegram ID and name are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `INSERT INTO telegram_couriers (telegram_id, name, is_active, created_at, updated_at)
         VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        [telegram_id, name, is_active !== false ? 1 : 0],
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              resolve(NextResponse.json({ error: 'Courier with this Telegram ID already exists' }, { status: 400 }));
              return;
            }
            resolve(NextResponse.json({ error: 'Failed to create courier' }, { status: 500 }));
            return;
          }

          resolve(NextResponse.json({
            success: true,
            message: 'Courier created successfully',
            id: this.lastID
          }));
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

export async function PUT(request: NextRequest) {
  try {
    const { id, telegram_id, name, is_active } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Courier ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `UPDATE telegram_couriers 
         SET telegram_id = ?, name = ?, is_active = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [telegram_id, name, is_active ? 1 : 0, id],
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to update courier' }, { status: 500 }));
            return;
          }

          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Courier not found' }, { status: 404 }));
            return;
          }

          resolve(NextResponse.json({ success: true, message: 'Courier updated successfully' }));
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Courier ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      db.run(
        'DELETE FROM telegram_couriers WHERE id = ?',
        [id],
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            resolve(NextResponse.json({ error: 'Failed to delete courier' }, { status: 500 }));
            return;
          }

          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Courier not found' }, { status: 404 }));
            return;
          }

          resolve(NextResponse.json({ success: true, message: 'Courier deleted successfully' }));
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

