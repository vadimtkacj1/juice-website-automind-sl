import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
const getDatabase = require('@/lib/database');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { name, description, price, is_available, sort_order } = body;

    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const runWithChanges = (sql: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(this: any, err: any) {
          if (err) {
            return reject(err);
          }
          resolve(this.changes);
        });
      });
    };

    try {
      const changes = await runWithChanges(
        `UPDATE menu_item_additional_items
        SET name = ?, description = ?, price = ?, is_available = ?, sort_order = ?
        WHERE id = ? AND menu_item_id = ?`,
        [
          name,
          description || null,
          price,
          is_available !== false ? 1 : 0,
          sort_order || 0,
          itemId,
          id
        ]
      );

      if (changes === 0) {
        return NextResponse.json({ error: 'Additional item not found' }, { status: 404 });
      }
      return NextResponse.json({
        id: parseInt(itemId),
        menu_item_id: parseInt(id),
        name, description, price, is_available, sort_order
      });
    } catch (err: any) {
      console.error('Database error (PUT):', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error (PUT):', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const runWithChanges = (sql: string, params: any[]) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(this: any, err: any) {
          if (err) {
            return reject(err);
          }
          resolve(this.changes);
        });
      });
    };

    try {
      const changes = await runWithChanges(
        'DELETE FROM menu_item_additional_items WHERE id = ? AND menu_item_id = ?',
        [itemId, id]
      );

      if (changes === 0) {
        return NextResponse.json({ error: 'Additional item not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error('Database error (DELETE):', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error (DELETE):', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

