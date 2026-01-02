import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

// Promisify db.all for async/await
const dbAll = (db: any, query: string, params: any[] = []) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Promisify db.run for async/await
const dbRun = (db: any, query: string, params: any[] = []) => {
  return new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
    db.run(query, params, function(this: { lastID: number; changes: number }, err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Promisify db.get for async/await
const dbGet = (db: any, query: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const prompt = await dbGet(
      db,
      'SELECT * FROM order_prompts WHERE id = ?',
      [id]
    );

    if (!prompt) {
      return NextResponse.json(
        { error: 'Order prompt not found' },
        { status: 404 }
      );
    }

    const products = await dbAll(
      db,
      `SELECT * FROM order_prompt_products 
       WHERE prompt_id = ? 
       ORDER BY sort_order`,
      [id]
    );

    return NextResponse.json({ prompt: { ...prompt, products } });
  } catch (error: any) {
    console.error('API error fetching order prompt:', error);
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
    const { title, description, prompt_type, is_active, sort_order, show_on_all_products, products } = body;

    if (!title || !prompt_type) {
      return NextResponse.json(
        { error: 'Title and prompt type are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const result = await dbRun(
      db,
      `UPDATE order_prompts 
       SET title = ?, description = ?, prompt_type = ?, is_active = ?, sort_order = ?, show_on_all_products = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        title,
        description || null,
        prompt_type,
        is_active !== false ? 1 : 0,
        sort_order || 0,
        show_on_all_products !== false ? 1 : 0,
        id
      ]
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Order prompt not found' },
        { status: 404 }
      );
    }

    // Delete existing products and add new ones
    await dbRun(
      db,
      'DELETE FROM order_prompt_products WHERE prompt_id = ?',
      [id]
    );

    // Add products if provided
    if (products && Array.isArray(products) && products.length > 0) {
      for (const product of products) {
        await dbRun(
          db,
          `INSERT INTO order_prompt_products (prompt_id, menu_item_id, product_name, product_price, volume_option, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            product.menu_item_id || null,
            product.product_name || null,
            product.product_price || 0,
            product.volume_option || null,
            product.sort_order || 0,
          ]
        );
      }
    }

    return NextResponse.json({
      id: parseInt(id),
      title,
      description,
      prompt_type,
      is_active: is_active !== false ? 1 : 0,
      sort_order: sort_order || 0,
      show_on_all_products: show_on_all_products !== false ? 1 : 0,
    });
  } catch (error: any) {
    console.error('API error updating order prompt:', error);
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
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const result = await dbRun(
      db,
      'DELETE FROM order_prompts WHERE id = ?',
      [id]
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Order prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API error deleting order prompt:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

