import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promisify db.run for async/await (if not already in lib/database)
const dbRun = (db: any, query: string, params: any[] = []) => {
  return new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
    db.run(query, params, function(this: { lastID: number; changes: number }, err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const ingredient = await dbGet(db, 'SELECT * FROM custom_ingredients WHERE id = ?', [id]);

    if (!ingredient) {
      return NextResponse.json({ error: 'Custom ingredient not found' }, { status: 404 });
    }

    return NextResponse.json({ ingredient });
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, price, image, ingredient_category, is_available, sort_order } = body;

    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const result = await dbRun(
      db,
      `UPDATE custom_ingredients 
      SET name = ?, description = ?, price = ?, image = ?, ingredient_category = ?, is_available = ?, sort_order = ?
      WHERE id = ?`,
      [
        name,
        description || null,
        price || 0,
        image || null,
        ingredient_category || 'fruits',
        is_available !== false ? 1 : 0,
        sort_order || 0,
        id
      ]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Custom ingredient not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      id: parseInt(id), 
      name, description, price: price || 0, image, ingredient_category: ingredient_category || 'fruits', is_available, sort_order 
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const result = await dbRun(db, 'DELETE FROM custom_ingredients WHERE id = ?', [id]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Custom ingredient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
