import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

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
    const categoryId = searchParams.get('category_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = `
      SELECT mi.*, mc.name as category_name 
      FROM menu_items mi 
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
    `;
    const params: any[] = [];

    const conditions: string[] = [];
    
    if (!includeInactive) {
      conditions.push('mi.is_available = 1');
    }
    
    if (categoryId) {
      conditions.push('mi.category_id = ?');
      params.push(categoryId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mi.category_id, mi.sort_order';

    return new Promise<NextResponse>((resolve) => {
      db.all(query, params, (err: any, rows: any[]) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }
        const translatedItems = (rows || []).map(item => translateObject(item));
        resolve(NextResponse.json({ items: translatedItems }));
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
    const { 
      category_id, name, description, 
      price, volume, image, discount_percent, is_available, sort_order 
    } = body;

    if (!category_id || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Category, name and price are required.' },
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

    return new Promise<NextResponse>((resolve) => {
      db.run(
        `INSERT INTO menu_items 
          (category_id, name, description, price, volume, image, discount_percent, is_available, sort_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category_id, 
          name, 
          description || null, 
          price, 
          volume || null, 
          image || null, 
          discount_percent || 0, 
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
                category_id, name, description,
                price, volume, image, discount_percent, is_available, sort_order 
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
