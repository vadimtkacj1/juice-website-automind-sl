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

export async function GET() {
  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const prompts = await dbAll(
      db,
      `SELECT * FROM order_prompts WHERE is_active = 1 ORDER BY sort_order, created_at`
    );

    // For each prompt, get associated products
    const promptsWithProducts = await Promise.all(
      prompts.map(async (prompt: any) => {
        const products = await dbAll(
          db,
          `SELECT * FROM order_prompt_products 
           WHERE prompt_id = ? 
           ORDER BY sort_order`,
          [prompt.id]
        );
        return { ...prompt, products };
      })
    );

    return NextResponse.json({ prompts: promptsWithProducts });
  } catch (error: any) {
    console.error('API error fetching order prompts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      `INSERT INTO order_prompts (title, description, prompt_type, is_active, sort_order, show_on_all_products, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        title,
        description || null,
        prompt_type,
        is_active !== false ? 1 : 0,
        sort_order || 0,
        show_on_all_products !== false ? 1 : 0,
      ]
    );

    const promptId = result.lastID;

    // Add products if provided
    if (products && Array.isArray(products) && products.length > 0) {
      for (const product of products) {
        await dbRun(
          db,
          `INSERT INTO order_prompt_products (prompt_id, menu_item_id, product_name, product_price, volume_option, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            promptId,
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
      id: promptId,
      title,
      description,
      prompt_type,
      is_active: is_active !== false ? 1 : 0,
      sort_order: sort_order || 0,
      show_on_all_products: show_on_all_products !== false ? 1 : 0,
    });
  } catch (error: any) {
    console.error('API error creating order prompt:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

