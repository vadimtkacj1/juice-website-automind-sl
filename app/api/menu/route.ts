import { NextRequest, NextResponse } from 'next/server';

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

    return new Promise((resolve) => {
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

              // Group items by category
              const menu = categories.map((category) => ({
                ...category,
                items: items.filter((item) => item.category_id === category.id),
              }));

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


