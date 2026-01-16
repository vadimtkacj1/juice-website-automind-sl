import { NextRequest, NextResponse } from 'next/server';

function ensureTables(db: any) {
  const pool = (db as any).pool || (db as any)._pool;
  if (!pool) return Promise.resolve();
  return pool.query(`
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupId = Number(id);
    if (!Number.isFinite(groupId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    await ensureTables(db);

    return await new Promise<NextResponse>((resolve) => {
      db.all(
        `SELECT 
          ci.id,
          ci.name,
          ci.description,
          ci.price,
          ci.image,
          ci.ingredient_category,
          ci.is_available,
          ci.sort_order,
          igci.sort_order as group_sort_order
        FROM ingredient_group_custom_ingredients igci
        INNER JOIN custom_ingredients ci ON ci.id = igci.custom_ingredient_id
        WHERE igci.ingredient_group_id = ?
        ORDER BY igci.sort_order, ci.ingredient_category, ci.sort_order, ci.name`,
        [groupId],
        (err: any, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ ingredients: rows || [] }));
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupId = Number(id);
    if (!Number.isFinite(groupId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const ingredientIdsRaw = Array.isArray(body?.ingredient_ids) ? body.ingredient_ids : [];
    const ingredientIds = ingredientIdsRaw
      .map((v: any) => Number(v))
      .filter((v: number) => Number.isFinite(v));

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    if (!db) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    await ensureTables(db);

    return await new Promise<NextResponse>((resolve) => {
      db.run(
        'DELETE FROM ingredient_group_custom_ingredients WHERE ingredient_group_id = ?',
        [groupId],
        (err: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          if (ingredientIds.length === 0) {
            resolve(NextResponse.json({ success: true, ingredient_ids: [] }));
            return;
          }

          const placeholders = ingredientIds.map(() => '(?, ?, ?)').join(', ');
          const values: any[] = [];
          ingredientIds.forEach((ingredientId: number, idx: number) => {
            values.push(groupId, ingredientId, idx);
          });

          db.run(
            `INSERT INTO ingredient_group_custom_ingredients (ingredient_group_id, custom_ingredient_id, sort_order) VALUES ${placeholders}`,
            values,
            function (this: any, insertErr: any) {
              if (insertErr) {
                console.error('Database error:', insertErr);
                resolve(NextResponse.json({ error: insertErr.message }, { status: 500 }));
                return;
              }
              resolve(NextResponse.json({ success: true, ingredient_ids: ingredientIds }));
            }
          );
        }
      );
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}


