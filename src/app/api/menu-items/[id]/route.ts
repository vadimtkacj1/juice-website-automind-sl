import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';
import { invalidateMenuCache, updateCacheVersion } from '@/lib/menuCache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      db.get(
        `SELECT mi.*, mc.name as category_name 
         FROM menu_items mi 
         LEFT JOIN menu_categories mc ON mi.category_id = mc.id 
         WHERE mi.id = ?`, 
        [id], 
        (err: any, row: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (!row) {
            resolve(NextResponse.json({ error: 'Item not found' }, { status: 404 }));
            return;
          }
          resolve(NextResponse.json({ item: translateObject(row) }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      category_id, name, description,
      price, volume, image, discount_percent, is_available, sort_order 
    } = body;

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `UPDATE menu_items SET 
          category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          volume = COALESCE(?, volume),
          image = COALESCE(?, image),
          discount_percent = COALESCE(?, discount_percent),
          is_available = COALESCE(?, is_available),
          sort_order = COALESCE(?, sort_order)
        WHERE id = ?`,
        [
          category_id, name, description,
          price, volume, image, discount_percent, 
          is_available !== undefined ? (is_available ? 1 : 0) : null, 
          sort_order, id
        ],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Item not found' }, { status: 404 }));
            return;
          }
          // Invalidate menu cache after successful update
          invalidateMenuCache();
          updateCacheVersion();
          resolve(NextResponse.json({ success: true, id, cacheVersion: Date.now() }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      db.run('DELETE FROM menu_items WHERE id = ?', [id], function (this: any, err: any) {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        if (this.changes === 0) {
          resolve(NextResponse.json({ error: 'Item not found' }, { status: 404 }));
          return;
        }
        // Invalidate menu cache after successful deletion
        invalidateMenuCache();
        resolve(NextResponse.json({ success: true }));
      });
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
