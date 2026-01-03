import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const getDatabase = require('@/lib/database');
    
    // Check what database path is being used
    const dbPath = process.env.DATABASE_PATH 
      ? process.env.DATABASE_PATH 
      : path.join(process.cwd(), 'juice_website.db');
    
    const dbExists = fs.existsSync(dbPath);
    const dbSize = dbExists ? fs.statSync(dbPath).size : 0;
    
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json({
        error: 'Database connection failed',
        dbPath,
        dbExists,
        dbSize,
        envPath: process.env.DATABASE_PATH,
        cwd: process.cwd(),
      });
    }
    
    return new Promise<NextResponse>((resolve) => {
      // Get counts
      db.get('SELECT COUNT(*) as catCount FROM menu_categories WHERE is_active = 1', [], (err: any, activeCats: any) => {
        if (err) {
          resolve(NextResponse.json({
            error: err.message,
            dbPath,
            dbExists,
            dbSize,
            envPath: process.env.DATABASE_PATH,
            cwd: process.cwd(),
          }));
          return;
        }
        
        db.get('SELECT COUNT(*) as itemCount FROM menu_items WHERE is_available = 1', [], (err: any, availableItems: any) => {
          if (err) {
            resolve(NextResponse.json({
              error: err.message,
              dbPath,
              dbExists,
              dbSize,
              activeCategories: activeCats?.catCount || 0,
            }));
            return;
          }
          
          db.all('SELECT id, name, is_active FROM menu_categories LIMIT 10', [], (err: any, sampleCats: any[]) => {
            if (err) {
              resolve(NextResponse.json({
                error: err.message,
                dbPath,
                dbExists,
                dbSize,
                activeCategories: activeCats?.catCount || 0,
                availableItems: availableItems?.itemCount || 0,
              }));
              return;
            }
            
            // Get sample items with their category info
            db.all(`
              SELECT mi.id, mi.name, mi.category_id, mi.is_available, mc.name as category_name, mc.is_active as category_active
              FROM menu_items mi
              LEFT JOIN menu_categories mc ON mi.category_id = mc.id
              LIMIT 10
            `, [], (err: any, sampleItems: any[]) => {
              // Get category-item matching stats
              db.all(`
                SELECT 
                  mc.id as category_id,
                  mc.name as category_name,
                  mc.is_active,
                  COUNT(mi.id) as item_count
                FROM menu_categories mc
                LEFT JOIN menu_items mi ON mc.id = mi.category_id AND mi.is_available = 1
                GROUP BY mc.id, mc.name, mc.is_active
                ORDER BY mc.sort_order
              `, [], (err: any, categoryStats: any[]) => {
                resolve(NextResponse.json({
                  dbPath,
                  dbExists,
                  dbSize,
                  envPath: process.env.DATABASE_PATH,
                  cwd: process.cwd(),
                  activeCategories: activeCats?.catCount || 0,
                  availableItems: availableItems?.itemCount || 0,
                  totalCategories: sampleCats?.length || 0,
                  sampleCategories: sampleCats || [],
                  sampleItems: sampleItems || [],
                  categoryStats: categoryStats || [],
                }));
              });
            });
          });
        });
      });
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Internal server error',
      dbPath: process.env.DATABASE_PATH || 'not set',
      cwd: process.cwd(),
    });
  }
}

