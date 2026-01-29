import { NextRequest, NextResponse } from 'next/server';

// Ensure fresh data after reorders
export const revalidate = 0;
export const dynamic = 'force-dynamic';
import { translateObject } from '@/lib/translations';
import path from 'path';
import fs from 'fs';
import getDatabase from '@/lib/database';
import { getMenuCache, setMenuCache, getCacheVersion } from '@/lib/menuCache';
import { addCacheVersion } from '@/lib/cache-utils';

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
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    console.log(`${requestId} [Menu API] GET /api/menu called`);
  }

  try {
    // Check cache first
    const cachedData = getMenuCache();
    if (cachedData) {
      if (isDev) {
        console.log(`${requestId} [Menu API] Returning cached data`);
      }
      return NextResponse.json(cachedData);
    }

    // 1. Resolve Database Path (for debugging)
    const dbPath = process.env.DATABASE_PATH || 
                  (process.env.NODE_ENV === 'production' && process.cwd() === '/app' 
                    ? '/app/data/juice_website.db' 
                    : path.join(process.cwd(), 'juice_website.db'));

    const db = getDatabase();
    if (!db) {
      throw new Error('Database connection failed');
    }

    // 2. Fetch Data Concurrently
    // We fetch categories, items, and volumes in parallel to improve performance
    const [categories, items, volumes] = await Promise.all([
      dbAll(db, 'SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order'),
      dbAll(db, 'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order'),
      dbAll(db, 'SELECT * FROM menu_category_volumes ORDER BY category_id, sort_order, volume')
    ]);

    if (isDev) {
      console.log(`${requestId} [Menu API] Found ${categories.length} active categories, ${items.length} available items, ${volumes.length} volumes`);
    }

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
      console.warn(`${requestId} [Menu API] WARNING: Resulting menu is empty!`);
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

    if (isDev) {
      console.log(`${requestId} [Menu API] Success: Returning ${menu.length} categories`);
    }

    // Add cache version to image URLs for cache busting
    const cacheVersion = getCacheVersion();
    const menuWithCacheBusting = menu.map((category: any) => ({
      ...category,
      image: addCacheVersion(category.image, cacheVersion),
      items: category.items.map((item: any) => ({
        ...item,
        image: addCacheVersion(item.image, cacheVersion),
      })),
    }));

    // Cache the result
    const responseData = { menu: menuWithCacheBusting, cacheVersion };
    setMenuCache(responseData);

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error(`${requestId} [Menu API] CRITICAL ERROR:`, error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}