import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const pool = (db as any).pool || (db as any)._pool;
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ingredient_groups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name_he TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ingredient_group_custom_ingredients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ingredient_group_id INT NOT NULL,
          custom_ingredient_id INT NOT NULL,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ingredient_group_id) REFERENCES ingredient_groups(id) ON DELETE CASCADE,
          FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients(id) ON DELETE CASCADE,
          UNIQUE KEY unique_group_ingredient (ingredient_group_id, custom_ingredient_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    return await new Promise<NextResponse>((resolve) => {
      db.all(
        `SELECT 
          ig.id, 
          ig.name_he, 
          ig.sort_order,
          COUNT(igci.custom_ingredient_id) AS ingredients_count
        FROM ingredient_groups ig
        LEFT JOIN ingredient_group_custom_ingredients igci ON igci.ingredient_group_id = ig.id
        GROUP BY ig.id, ig.name_he, ig.sort_order
        ORDER BY ig.sort_order, ig.name_he`,
        [],
        (err: any, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ groups: rows || [] }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name_he, sort_order } = body || {};

    if (!name_he || !String(name_he).trim()) {
      return NextResponse.json({ error: 'שדה שם קבוצה נדרש' }, { status: 400 });
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const pool = (db as any).pool || (db as any)._pool;
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ingredient_groups (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name_he TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }

    return await new Promise<NextResponse>((resolve) => {
      db.run(
        'INSERT INTO ingredient_groups (name_he, sort_order) VALUES (?, ?)',
        [String(name_he).trim(), Number.isFinite(sort_order) ? sort_order : 0],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ id: this.lastID, name_he: String(name_he).trim(), sort_order: sort_order || 0 }, { status: 201 }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

