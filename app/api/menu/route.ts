import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

export async function GET() {
  try {
    const getDatabase = require('@/lib/database');
    const path = require('path');
    const fs = require('fs');
    
    // Calculate database path using same logic as database.js
    let dbPath;
    if (process.env.DATABASE_PATH) {
      dbPath = process.env.DATABASE_PATH;
    } else if (process.env.NODE_ENV === 'production' && process.cwd() === '/app') {
      dbPath = '/app/data/juice_website.db';
    } else {
      dbPath = path.join(process.cwd(), 'juice_website.db');
    }
    
    console.log(`[Menu API] Database path: ${dbPath}`);
    console.log(`[Menu API] Database exists: ${fs.existsSync(dbPath)}`);
    console.log(`[Menu API] DATABASE_PATH env: ${process.env.DATABASE_PATH}`);
    console.log(`[Menu API] NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[Menu API] cwd: ${process.cwd()}`);
    
    const db = getDatabase();
    
    if (!db) {
      console.error(`[Menu API] Database connection failed. Path: ${dbPath}`);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          debug: {
            dbPath,
            dbExists: fs.existsSync(dbPath),
            envPath: process.env.DATABASE_PATH,
            nodeEnv: process.env.NODE_ENV,
            cwd: process.cwd()
          }
        },
        { status: 500 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
          // Get all active categories
      db.all(
        'SELECT * FROM menu_categories WHERE (is_active = 1 OR is_active = true) ORDER BY sort_order',
        [],
        (err: any, categories: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          console.log(`[Menu API] Found ${categories.length} active categories`);
          
          // Debug: Check total categories (including inactive)
          db.get('SELECT COUNT(*) as total FROM menu_categories', [], (err: any, totalCats: any) => {
            if (!err && totalCats) {
              console.log(`[Menu API] Total categories in DB: ${totalCats.total} (${categories.length} active)`);
            } else if (err) {
              console.error(`[Menu API] Error counting categories:`, err);
            }
          });
          
          // If no categories found, check if table exists and has any data
          if (categories.length === 0) {
            db.all('SELECT * FROM menu_categories LIMIT 5', [], (err: any, allCats: any[]) => {
              if (!err) {
                console.log(`[Menu API] All categories (including inactive): ${allCats.length}`);
                if (allCats.length > 0) {
                  console.log(`[Menu API] Sample categories:`, allCats.map((c: any) => ({ id: c.id, name: c.name, is_active: c.is_active })));
                }
              }
            });
          }

          // Get all available menu items
          db.all(
            'SELECT * FROM menu_items WHERE (is_available = 1 OR is_available = true) ORDER BY sort_order',
            [],
            (err: any, items: any[]) => {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }

              console.log(`[Menu API] Found ${items.length} available items`);
              
              // Debug: Check total items (including unavailable)
              db.get('SELECT COUNT(*) as total FROM menu_items', [], (err: any, totalItems: any) => {
                if (!err && totalItems) {
                  console.log(`[Menu API] Total items in DB: ${totalItems.total} (${items.length} available)`);
                }
              });

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
              if (menu.length === 0) {
                console.error('[Menu API] WARNING: Empty menu returned!');
                console.error(`[Menu API] Categories found: ${categories.length}`);
                console.error(`[Menu API] Items found: ${items.length}`);
                
                if (categories.length > 0) {
                  console.error('[Menu API] Category IDs:', categories.map((c: any) => ({ id: c.id, name: c.name, is_active: c.is_active, type: typeof c.id })));
                }
                
                if (items.length > 0) {
                  const uniqueCategoryIds = Array.from(new Set(items.map((i: any) => i.category_id)));
                  console.error('[Menu API] Item category_ids:', uniqueCategoryIds.map((id: any) => ({ category_id: id, type: typeof id })));
                  
                  // Show sample items
                  console.error('[Menu API] Sample items:', items.slice(0, 3).map((i: any) => ({ 
                    id: i.id, 
                    name: i.name, 
                    category_id: i.category_id, 
                    is_available: i.is_available 
                  })));
                }
                
                // Return debug info in response if menu is empty
                resolve(NextResponse.json({ 
                  menu: [],
                  debug: {
                    categoriesFound: categories.length,
                    itemsFound: items.length,
                    categoryIds: categories.map((c: any) => ({ id: c.id, name: c.name, is_active: c.is_active })),
                    itemCategoryIds: Array.from(new Set(items.map((i: any) => i.category_id))),
                    sampleItems: items.slice(0, 3).map((i: any) => ({ 
                      id: i.id, 
                      name: i.name, 
                      category_id: i.category_id, 
                      is_available: i.is_available 
                    }))
                  }
                }));
                return;
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


