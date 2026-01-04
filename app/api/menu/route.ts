import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';
import path from 'path';
import fs from 'fs';
import getDatabase from '@/lib/database';

// Helper to promisify database queries
const dbAll = (db: any, query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err: any, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (db: any, query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err: any, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export async function GET() {
  const requestId = `[${Date.now()}]`;
  console.error(`${requestId} [Menu API] ===== GET /api/menu called =====`);

  try {
    // 1. Resolve Database Path (for debugging)
    const dbPath = process.env.DATABASE_PATH || 
                  (process.env.NODE_ENV === 'production' && process.cwd() === '/app' 
                    ? '/app/data/juice_website.db' 
                    : path.join(process.cwd(), 'juice_website.db'));

    console.error(`${requestId} [Menu API] DB Path: ${dbPath} | Exists: ${fs.existsSync(dbPath)}`);

    const db = getDatabase();
    if (!db) {
      throw new Error('Database connection failed');
    }

    // 2. Fetch Data Concurrently
    // We fetch categories and items in parallel to improve performance
    const [categories, items, stats] = await Promise.all([
      dbAll(db, 'SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order'),
      dbAll(db, 'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order'),
      dbGet(db, 'SELECT (SELECT COUNT(*) FROM menu_categories) as catCount, (SELECT COUNT(*) FROM menu_items) as itemCount')
    ]);

    console.error(`${requestId} [Menu API] Found ${categories.length}/${stats.catCount} active categories`);
    console.error(`${requestId} [Menu API] Found ${items.length}/${stats.itemCount} available items`);

    // 3. Process and Group Data
    const menu = categories
      .map((category: any) => {
        const categoryId = Number(category.id);
        
        // Filter items belonging to this category
        const categoryItems = items
          .filter((item: any) => Number(item.category_id) === categoryId)
          .map((item: any) => translateObject(item));

        if (categoryItems.length === 0) {
          console.error(`${requestId} [Menu API] Category "${category.name}" (ID: ${categoryId}) has no items.`);
        }

        return {
          ...translateObject(category),
          items: categoryItems,
        };
      })
      // Only return categories that actually have items
      .filter((category: any) => category.items.length > 0);

    // 4. Handle Empty Menu Scenario
    if (menu.length === 0) {
      console.error(`${requestId} [Menu API] WARNING: Resulting menu is empty!`);
      return NextResponse.json({
        menu: [],
        debug: {
          categoriesFound: categories.length,
          itemsFound: items.length,
          dbPath,
          dbExists: fs.existsSync(dbPath)
        }
      });
    }

    console.error(`${requestId} [Menu API] Success: Returning ${menu.length} categories.`);
    return NextResponse.json({ menu });

  } catch (error: any) {
    console.error(`${requestId} [Menu API] CRITICAL ERROR:`, error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}