import { NextRequest, NextResponse } from 'next/server';

// Ensure fresh data after reorders
export const revalidate = 0;
export const dynamic = 'force-dynamic';
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
    // We fetch categories, items, and volumes in parallel to improve performance
    const [categories, items, volumes, stats] = await Promise.all([
      dbAll(db, 'SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order'),
      dbAll(db, 'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order'),
      dbAll(db, 'SELECT * FROM menu_category_volumes ORDER BY category_id, sort_order, volume'),
      dbGet(db, 'SELECT (SELECT COUNT(*) FROM menu_categories) as catCount, (SELECT COUNT(*) FROM menu_items) as itemCount')
    ]);

    console.error(`${requestId} [Menu API] Found ${categories.length}/${stats.catCount} active categories`);
    console.error(`${requestId} [Menu API] Found ${items.length}/${stats.itemCount} available items`);
    console.error(`${requestId} [Menu API] Found ${volumes.length} volume options`);

    // 3. Group volumes by category_id for quick lookup
    const volumesByCategory = new Map<number, any[]>();
    volumes.forEach((volume: any) => {
      const categoryId = Number(volume.category_id);
      if (!volumesByCategory.has(categoryId)) {
        volumesByCategory.set(categoryId, []);
      }
      volumesByCategory.get(categoryId)!.push(translateObject(volume));
    });

    // 4. Process and Group Data
    const sortedCategories = [...categories].sort(
      (a, b) => (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0)
    );

    const menu = sortedCategories
      .map((category: any) => {
        const categoryId = Number(category.id);
        
        // Filter items belonging to this category
        const categoryItems = items
          .filter((item: any) => Number(item.category_id) === categoryId)
          .sort((a: any, b: any) => (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0))
          .map((item: any) => translateObject(item));

        if (categoryItems.length === 0) {
          console.error(`${requestId} [Menu API] Category "${category.name}" (ID: ${categoryId}) has no items.`);
        }

        // Get volumes for this category and sort them
        const categoryVolumes = (volumesByCategory.get(categoryId) || [])
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        // Add volumes to each item
        const itemsWithVolumes = categoryItems.map((item: any) => {
          if (categoryVolumes.length > 0) {
            return {
              ...item,
              categoryVolumes: categoryVolumes,
            };
          }
          return item;
        });

        return {
          ...translateObject(category),
          items: itemsWithVolumes,
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