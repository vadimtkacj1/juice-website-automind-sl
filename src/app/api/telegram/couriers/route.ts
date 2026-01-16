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
          role: courier.role || 'delivery',
          is_active: courier.is_active === 1
        }));

        resolve(NextResponse.json({ couriers: formattedCouriers }));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { telegram_id, name, role, is_active } = await request.json();

    if (!telegram_id || !name) {
      return NextResponse.json(
        { error: 'Telegram ID and name are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `INSERT INTO telegram_couriers (telegram_id, name, role, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [telegram_id, name, role || 'delivery', is_active !== false ? 1 : 0],
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            console.error('Error creating courier:', err);
            if (err.message.includes('UNIQUE constraint') || err.message.includes('Duplicate entry')) {
              resolve(NextResponse.json({ error: 'Courier with this Telegram ID already exists' }, { status: 400 }));
              return;
            }
            resolve(NextResponse.json({ error: 'Failed to create courier', details: err.message }, { status: 500 }));
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
    console.error('POST /api/telegram/couriers error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, telegram_id, name, role, is_active } = await request.json();

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
         SET telegram_id = ?, name = ?, role = ?, is_active = ?, updated_at = NOW()
         WHERE id = ?`,
        [telegram_id, name, role || 'delivery', is_active ? 1 : 0, id],
        function(this: { lastID: number; changes: number }, err: Error | null) {
          if (err) {
            console.error('Error updating courier:', err);
            resolve(NextResponse.json({ error: 'Failed to update courier', details: err.message }, { status: 500 }));
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
    console.error('PUT /api/telegram/couriers error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
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
            console.error('Error deleting courier:', err);
            resolve(NextResponse.json({ error: 'Failed to delete courier', details: err.message }, { status: 500 }));
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
    console.error('DELETE /api/telegram/couriers error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

