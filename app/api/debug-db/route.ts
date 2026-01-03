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
          
          db.all('SELECT id, name, is_active FROM menu_categories LIMIT 5', [], (err: any, sampleCats: any[]) => {
            resolve(NextResponse.json({
              dbPath,
              dbExists,
              dbSize,
              envPath: process.env.DATABASE_PATH,
              cwd: process.cwd(),
              activeCategories: activeCats?.catCount || 0,
              availableItems: availableItems?.itemCount || 0,
              sampleCategories: sampleCats || [],
            }));
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

