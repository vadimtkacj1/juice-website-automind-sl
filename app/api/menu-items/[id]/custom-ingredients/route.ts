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
          ci.*,
          mici.selection_type,
          mici.price_override
        FROM custom_ingredients ci
        INNER JOIN menu_item_custom_ingredients mici ON ci.id = mici.custom_ingredient_id
        WHERE mici.menu_item_id = ? AND ci.is_available = 1
        ORDER BY ci.ingredient_category, ci.sort_order, ci.name`,
        [id],
        (err: any, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ ingredients: rows || [] }));
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ingredient_ids } = body;

    if (!Array.isArray(ingredient_ids)) {
      return NextResponse.json(
        { error: 'ingredient_ids must be an array' },
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
      // First, remove all existing associations
      db.run(
        'DELETE FROM menu_item_custom_ingredients WHERE menu_item_id = ?',
        [id],
        (err: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          // Then, insert new associations with default values
          if (ingredient_ids.length === 0) {
            resolve(NextResponse.json({ success: true, ingredients: [] }));
            return;
          }

          const placeholders = ingredient_ids.map(() => '(?, ?, ?, ?)').join(', ');
          const values: any[] = [];
          ingredient_ids.forEach((ingredientId: number) => {
            values.push(id, ingredientId, 'multiple', null);
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
              resolve(NextResponse.json({ success: true, ingredients: ingredient_ids }));
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

