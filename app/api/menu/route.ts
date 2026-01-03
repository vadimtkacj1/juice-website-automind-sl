import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

export async function GET() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    // Log database path for debugging
    const dbPath = process.env.DATABASE_PATH || require('path').join(process.cwd(), 'juice_website.db');
    console.log(`[Menu API] Using database path: ${dbPath}`);
    
    if (!db) {
      console.error(`[Menu API] Database connection failed. Path: ${dbPath}`);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
          // Get all active categories
      db.all(
        'SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order',
        [],
        (err: any, categories: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          console.log(`[Menu API] Found ${categories.length} active categories`);

          // Get all available menu items
          db.all(
            'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order',
            [],
            (err: any, items: any[]) => {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }

              console.log(`[Menu API] Found ${items.length} available items`);

              // Group items by category and translate
              const menu = categories
                .map((category: any) => {
                  // Convert both to numbers for proper comparison (handles string/number mismatch)
                  const categoryId = Number(category.id);
                  const categoryItems = items.filter((item: any) => Number(item.category_id) === categoryId);
                  
                  if (categoryItems.length > 0) {
                    console.log(`[Menu API] Category "${category.name}" (ID: ${categoryId}) has ${categoryItems.length} items`);
                  }
                  
                  return {
                    ...translateObject(category),
                    items: categoryItems.map((item: any) => translateObject(item)),
                  };
                })
                .filter((category: any) => category.items && category.items.length > 0); // Only return categories with items

              console.log(`[Menu API] Returning ${menu.length} categories with items`);
              
              // Debug: If no menu but data exists, log the mismatch
              if (menu.length === 0 && categories.length > 0 && items.length > 0) {
                console.error('[Menu API] WARNING: Categories and items exist but no matches found!');
                console.error('[Menu API] Category IDs:', categories.map((c: any) => ({ id: c.id, name: c.name, type: typeof c.id })));
                const uniqueCategoryIds = Array.from(new Set(items.map((i: any) => i.category_id)));
                console.error('[Menu API] Item category_ids:', uniqueCategoryIds.map((id: any) => ({ category_id: id, type: typeof id })));
              }
              
              resolve(NextResponse.json({ menu }));
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


