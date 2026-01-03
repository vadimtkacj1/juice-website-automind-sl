import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

export async function GET() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
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
                  const categoryItems = items.filter((item: any) => item.category_id == category.id);
                  return {
                    ...translateObject(category),
                    items: categoryItems.map((item: any) => translateObject(item)),
                  };
                })
                .filter((category: any) => category.items && category.items.length > 0); // Only return categories with items

              console.log(`[Menu API] Returning ${menu.length} categories with items`);
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


