import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menu_item_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = `
      SELECT ci.*, 
        CASE WHEN mici.menu_item_id IS NOT NULL THEN 1 ELSE 0 END as is_available_for_item
      FROM custom_ingredients ci
    `;
    const params: any[] = [];

    if (menuItemId) {
      query = `
        SELECT ci.*, 
          CASE WHEN mici.menu_item_id IS NOT NULL THEN 1 ELSE 0 END as is_available_for_item
        FROM custom_ingredients ci
        LEFT JOIN menu_item_custom_ingredients mici 
          ON ci.id = mici.custom_ingredient_id AND mici.menu_item_id = ?
      `;
      params.push(menuItemId);
    } else {
      query += ' LEFT JOIN menu_item_custom_ingredients mici ON ci.id = mici.custom_ingredient_id';
    }

    const conditions: string[] = [];
    if (!includeInactive) {
      conditions.push('ci.is_available = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ci.sort_order, ci.name';

    return new Promise((resolve) => {
      db.all(query, params, (err: any, rows: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ ingredients: rows || [] }));
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, ingredient_category, is_available, sort_order } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required.' },
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
      db.run(
        `INSERT INTO custom_ingredients (name, description, price, image, ingredient_category, is_available, sort_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || null,
          price || 0,
          image || null,
          ingredient_category || 'fruits',
          is_available !== false ? 1 : 0,
          sort_order || 0
        ],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(
            NextResponse.json(
              { 
                id: this.lastID, 
                name, description, price: price || 0, image, ingredient_category: ingredient_category || 'fruits', is_available, sort_order 
              },
              { status: 201 }
            )
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

