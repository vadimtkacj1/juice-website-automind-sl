import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ingredientId = Number(id);
    if (!Number.isFinite(ingredientId)) {
      return NextResponse.json({ error: 'Invalid ingredient id' }, { status: 400 });
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();

    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const categories = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT
          mc.id,
          mc.name,
          mc.description
        FROM menu_category_custom_ingredients mcci
        INNER JOIN menu_categories mc ON mc.id = mcci.category_id
        WHERE mcci.custom_ingredient_id = ?
        ORDER BY mc.sort_order, mc.name`,
        [ingredientId],
        (err: any, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const menuItems = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT
          mi.id,
          mi.name,
          mi.image,
          mc.name as category_name
        FROM menu_item_custom_ingredients mici
        INNER JOIN menu_items mi ON mi.id = mici.menu_item_id
        LEFT JOIN menu_categories mc ON mc.id = mi.category_id
        WHERE mici.custom_ingredient_id = ?
        ORDER BY mc.sort_order, mi.sort_order, mi.name`,
        [ingredientId],
        (err: any, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    return NextResponse.json({ categories, menuItems });
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
    const ingredientId = Number(id);
    if (!Number.isFinite(ingredientId)) {
      return NextResponse.json({ error: 'Invalid ingredient id' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const categoryIdRaw = searchParams.get('category_id');
    const menuItemIdRaw = searchParams.get('menu_item_id');

    if (!categoryIdRaw && !menuItemIdRaw) {
      return NextResponse.json(
        { error: 'category_id or menu_item_id is required' },
        { status: 400 }
      );
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    if (categoryIdRaw) {
      const categoryId = Number(categoryIdRaw);
      if (!Number.isFinite(categoryId)) {
        return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
      }

      return await new Promise<NextResponse>((resolve) => {
        db.run(
          'DELETE FROM menu_category_custom_ingredients WHERE category_id = ? AND custom_ingredient_id = ?',
          [categoryId, ingredientId],
          function (this: any, err: any) {
            if (err) {
              console.error('Database error:', err);
              resolve(NextResponse.json({ error: err.message }, { status: 500 }));
              return;
            }
            resolve(NextResponse.json({ success: true, changes: this.changes || 0 }));
          }
        );
      });
    }

    const menuItemId = Number(menuItemIdRaw);
    if (!Number.isFinite(menuItemId)) {
      return NextResponse.json({ error: 'Invalid menu_item_id' }, { status: 400 });
    }

    return await new Promise<NextResponse>((resolve) => {
      db.run(
        'DELETE FROM menu_item_custom_ingredients WHERE menu_item_id = ? AND custom_ingredient_id = ?',
        [menuItemId, ingredientId],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ success: true, changes: this.changes || 0 }));
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


