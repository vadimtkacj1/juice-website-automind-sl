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

    return new Promise((resolve) => {
      db.all(
        `SELECT 
          mici.menu_item_id,
          mi.name as menu_item_name,
          mici.custom_ingredient_id,
          ci.name as ingredient_name,
          mici.selection_type,
          mici.price_override
        FROM menu_item_custom_ingredients mici
        INNER JOIN menu_items mi ON mici.menu_item_id = mi.id
        INNER JOIN custom_ingredients ci ON mici.custom_ingredient_id = ci.id
        WHERE mici.menu_item_id = ?
        ORDER BY ci.ingredient_category, ci.sort_order, ci.name`,
        [id],
        (err: any, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ configs: rows || [] }));
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
    const { configs } = body;

    if (!Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'configs must be an array' },
        { status: 400 }
      );
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise((resolve) => {
      // Start transaction by deleting all existing configs for this menu item
      db.run(
        'DELETE FROM menu_item_custom_ingredients WHERE menu_item_id = ?',
        [id],
        (err: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          // Insert new configs
          if (configs.length === 0) {
            resolve(NextResponse.json({ success: true, configs: [] }));
            return;
          }

          const placeholders = configs.map(() => '(?, ?, ?, ?)').join(', ');
          const values: any[] = [];
          configs.forEach((config: any) => {
            values.push(
              id,
              config.ingredient_id,
              config.selection_type || 'multiple',
              config.price_override || null
            );
          });

          db.run(
            `INSERT INTO menu_item_custom_ingredients (menu_item_id, custom_ingredient_id, selection_type, price_override) 
            VALUES ${placeholders}`,
            values,
            function (this: any, err: any) {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }
              resolve(NextResponse.json({ success: true, configs }));
            }
          );
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

