import { NextRequest, NextResponse } from 'next/server';

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
      db.get('SELECT * FROM menu_categories WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        if (!row) {
          resolve(NextResponse.json({ error: 'Category not found' }, { status: 404 }));
          return;
        }
        resolve(NextResponse.json({ category: row }));
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, sort_order, is_active } = body;

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
        `UPDATE menu_categories SET 
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active)
        WHERE id = ?`,
        [name, description, sort_order, is_active !== undefined ? (is_active ? 1 : 0) : null, id],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Category not found' }, { status: 404 }));
            return;
          }
          resolve(NextResponse.json({ success: true, id }));
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
      // First check if there are menu items in this category
      db.get('SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?', [id], (err: any, row: any) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        
        if (row.count > 0) {
          resolve(NextResponse.json(
            { error: 'Cannot delete category with menu items. Delete items first.' },
            { status: 400 }
          ));
          return;
        }

        db.run('DELETE FROM menu_categories WHERE id = ?', [id], function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          if (this.changes === 0) {
            resolve(NextResponse.json({ error: 'Category not found' }, { status: 404 }));
            return;
          }
          resolve(NextResponse.json({ success: true }));
        });
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
