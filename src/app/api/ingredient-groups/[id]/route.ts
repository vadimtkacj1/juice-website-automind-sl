import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupId = Number(id);
    if (!Number.isFinite(groupId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const pool = (db as any).pool || (db as any)._pool;
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ingredient_groups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name_he TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    return await new Promise<NextResponse>((resolve) => {
      db.get(
        'SELECT id, name_he, sort_order FROM ingredient_groups WHERE id = ?',
        [groupId],
        (err: any, row: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (!row) {
            resolve(NextResponse.json({ error: 'Not found' }, { status: 404 }));
            return;
          }
          resolve(NextResponse.json({ group: row }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupId = Number(id);
    if (!Number.isFinite(groupId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await request.json();
    const { name_he, sort_order } = body || {};
    if (!name_he || !String(name_he).trim()) {
      return NextResponse.json({ error: 'שדה שם קבוצה נדרש' }, { status: 400 });
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    return await new Promise<NextResponse>((resolve) => {
      db.run(
        'UPDATE ingredient_groups SET name_he = ?, sort_order = COALESCE(?, sort_order) WHERE id = ?',
        [String(name_he).trim(), Number.isFinite(sort_order) ? sort_order : null, groupId],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Not found' }, { status: 404 }));
            return;
          }
          resolve(NextResponse.json({ success: true }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupId = Number(id);
    if (!Number.isFinite(groupId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    return await new Promise<NextResponse>((resolve) => {
      db.run('DELETE FROM ingredient_groups WHERE id = ?', [groupId], function (this: any, err: any) {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ success: true, deleted: this.changes || 0 }));
      });
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

