import { NextRequest, NextResponse } from 'next/server';
import { translateObject } from '@/lib/translations';

export async function GET() {
  const requestId = `[${Date.now()}]`;
  console.error(`${requestId} [Menu API] ===== GET /api/menu called =====`);
  
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
    
    console.error(`${requestId} [Menu API] Database path: ${dbPath}`);
    console.error(`${requestId} [Menu API] Database exists: ${fs.existsSync(dbPath)}`);
    console.error(`${requestId} [Menu API] DATABASE_PATH env: ${process.env.DATABASE_PATH}`);
    console.error(`${requestId} [Menu API] NODE_ENV: ${process.env.NODE_ENV}`);
    console.error(`${requestId} [Menu API] cwd: ${process.cwd()}`);
    
    const db = getDatabase();
    
    if (!db) {
      console.error(`${requestId} [Menu API] Database connection failed. Path: ${dbPath}`);
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
          // First verify database connection and file - run synchronously
          db.get('SELECT COUNT(*) as total FROM menu_categories', [], (err: any, countResult: any) => {
            if (err) {
              console.error(`${requestId} [Menu API] Error checking database:`, err);
            } else {
              console.error(`${requestId} [Menu API] Database verification - Total categories in DB: ${countResult?.total || 0}`);
            }
            
            // Also check items count
            db.get('SELECT COUNT(*) as total FROM menu_items', [], (err2: any, itemsCount: any) => {
              if (!err2 && itemsCount) {
                console.error(`${requestId} [Menu API] Database verification - Total items in DB: ${itemsCount.total || 0}`);
              }
              
              // Now run the actual queries
              // Get all active categories
              db.all(
                'SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order',
                [],
                (err: any, categories: any[]) => {
          if (err) {
            console.error(`${requestId} [Menu API] Database error:`, err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          console.error(`${requestId} [Menu API] Found ${categories.length} active categories`);
          console.error(`${requestId} [Menu API] Raw categories query result count: ${categories.length}`);
          if (categories.length > 0) {
            console.error(`${requestId} [Menu API] Category details:`, JSON.stringify(categories.map((c: any) => ({ 
              id: c.id, 
              name: c.name, 
              is_active: c.is_active,
              sort_order: c.sort_order 
            }))));
          }
          
          // Debug: Check total categories (including inactive)
          db.get('SELECT COUNT(*) as total FROM menu_categories', [], (err: any, totalCats: any) => {
            if (!err && totalCats) {
              console.error(`${requestId} [Menu API] Total categories in DB: ${totalCats.total} (${categories.length} active)`);
            } else if (err) {
              console.error(`${requestId} [Menu API] Error counting categories:`, err);
            }
          });
          
          // If no categories found, check if table exists and has any data
          if (categories.length === 0) {
            console.error(`${requestId} [Menu API] No active categories found, checking all categories...`);
            db.all('SELECT * FROM menu_categories LIMIT 10', [], (err: any, allCats: any[]) => {
              if (!err) {
                console.error(`${requestId} [Menu API] All categories (including inactive): ${allCats.length}`);
                if (allCats.length > 0) {
                  console.error(`${requestId} [Menu API] Sample categories:`, JSON.stringify(allCats.map((c: any) => ({ 
                    id: c.id, 
                    name: c.name, 
                    is_active: c.is_active,
                    is_active_type: typeof c.is_active,
                    is_active_value: c.is_active
                  }))));
                  
                  // Test the WHERE clause directly
                  console.error(`${requestId} [Menu API] Testing WHERE clause: is_active = 1`);
                  const activeCats = allCats.filter((c: any) => c.is_active == 1 || c.is_active === 1 || c.is_active === '1');
                  console.error(`${requestId} [Menu API] Categories matching is_active = 1: ${activeCats.length}`);
                }
              } else {
                console.error(`${requestId} [Menu API] Error fetching all categories:`, err);
              }
            });
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

              console.error(`${requestId} [Menu API] Found ${items.length} available items`);
              console.error(`${requestId} [Menu API] Raw items query result count: ${items.length}`);
              if (items.length > 0) {
                console.error(`${requestId} [Menu API] Sample items:`, JSON.stringify(items.slice(0, 5).map((i: any) => ({ 
                  id: i.id, 
                  name: i.name, 
                  category_id: i.category_id,
                  is_available: i.is_available,
                  sort_order: i.sort_order
                }))));
              }
              
              // Debug: Check total items (including unavailable)
              db.get('SELECT COUNT(*) as total FROM menu_items', [], (err: any, totalItems: any) => {
                if (!err && totalItems) {
                  console.error(`${requestId} [Menu API] Total items in DB: ${totalItems.total} (${items.length} available)`);
                } else if (err) {
                  console.error(`${requestId} [Menu API] Error counting items:`, err);
                }
              });

              // Group items by category and translate
              const menu = categories
                .map((category: any) => {
                  // Convert both to numbers for proper comparison (handles string/number mismatch)
                  const categoryId = Number(category.id);
                  const categoryItems = items.filter((item: any) => Number(item.category_id) === categoryId);
                  
                  if (categoryItems.length > 0) {
                    console.error(`${requestId} [Menu API] Category "${category.name}" (ID: ${categoryId}) has ${categoryItems.length} items`);
                  } else {
                    console.error(`${requestId} [Menu API] Category "${category.name}" (ID: ${categoryId}) has NO items - checking why...`);
                    const itemsInThisCategory = items.filter((item: any) => {
                      const itemCatId = Number(item.category_id);
                      const match = itemCatId === categoryId;
                      if (!match && itemCatId) {
                        console.error(`${requestId} [Menu API] Item ${item.id} (${item.name}) has category_id ${item.category_id} (type: ${typeof item.category_id}, num: ${itemCatId}) but category ID is ${categoryId} (type: ${typeof category.id})`);
                      }
                      return match;
                    });
                    console.error(`${requestId} [Menu API] Items matching category ${categoryId}: ${itemsInThisCategory.length}`);
                  }
                  
                  return {
                    ...translateObject(category),
                    items: categoryItems.map((item: any) => translateObject(item)),
                  };
                })
                .filter((category: any) => category.items && category.items.length > 0); // Only return categories with items

              console.error(`${requestId} [Menu API] Returning ${menu.length} categories with items`);
              if (menu.length > 0) {
                console.error(`${requestId} [Menu API] Menu structure:`, JSON.stringify(menu.map((m: any) => ({
                  id: m.id,
                  name: m.name,
                  itemCount: m.items?.length || 0
                }))));
              }
              console.error(`${requestId} [Menu API] ===== Response ready =====`);
              
              // Debug: If no menu but data exists, log the mismatch
              if (menu.length === 0) {
                console.error(`${requestId} [Menu API] WARNING: Empty menu returned!`);
                console.error(`${requestId} [Menu API] Categories found: ${categories.length}`);
                console.error(`${requestId} [Menu API] Items found: ${items.length}`);
                
                if (categories.length > 0) {
                  console.error(`${requestId} [Menu API] Category IDs:`, categories.map((c: any) => ({ id: c.id, name: c.name, is_active: c.is_active, type: typeof c.id })));
                }
                
                if (items.length > 0) {
                  const uniqueCategoryIds = Array.from(new Set(items.map((i: any) => i.category_id)));
                  console.error(`${requestId} [Menu API] Item category_ids:`, uniqueCategoryIds.map((id: any) => ({ category_id: id, type: typeof id })));
                  
                  // Show sample items
                  console.error(`${requestId} [Menu API] Sample items:`, items.slice(0, 3).map((i: any) => ({ 
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
            });
          }
        });
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


