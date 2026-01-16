import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    const availabilityFilter = includeInactive ? '' : 'AND ci.is_available = 1';
    
    // Ensure tables/columns exist before querying
    const pool = (db as any).pool || (db as any)._pool;
    if (pool) {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ingredient_groups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name_he TEXT NOT NULL,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Check and add ingredient_group column if needed
        const [groupCols] = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'menu_category_custom_ingredients' 
           AND COLUMN_NAME = 'ingredient_group'`
        );
        if (groupCols.length === 0) {
          await pool.query(`ALTER TABLE menu_category_custom_ingredients ADD COLUMN ingredient_group TEXT`);
        }
        
        // Check and add is_required column if needed
        const [requiredCols] = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'menu_category_custom_ingredients' 
           AND COLUMN_NAME = 'is_required'`
        );
        if (requiredCols.length === 0) {
          await pool.query(`ALTER TABLE menu_category_custom_ingredients ADD COLUMN is_required TINYINT(1) DEFAULT 0`);
        }
      } catch (err: any) {
        // Ignore errors if columns already exist
        if (!err.message.includes('Duplicate column')) {
          console.warn('Warning: Could not add columns:', err.message);
        }
      }
    }
    
    // Ensure group columns exist (safety)
    if (pool) {
      try {
        const [groupIdCols] = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'menu_category_custom_ingredients' 
           AND COLUMN_NAME = 'ingredient_group_id'`
        );
        if ((groupIdCols as any[])?.length === 0) {
          await pool.query(`ALTER TABLE menu_category_custom_ingredients ADD COLUMN ingredient_group_id INT`);
        }
      } catch (err: any) {
        if (!String(err?.message || '').includes('Duplicate column')) {
          console.warn('Warning: could not ensure ingredient_group_id column on menu_category_custom_ingredients', err);
        }
      }
    }

    return new Promise<NextResponse>((resolve) => {
      db.all(
        `SELECT 
          mcci.category_id,
          mc.name as category_name,
          mcci.custom_ingredient_id,
          ci.name as ingredient_name,
          mcci.selection_type,
          mcci.price_override,
          COALESCE(mcci.ingredient_group, NULL) as ingredient_group,
          COALESCE(mcci.ingredient_group_id, NULL) as ingredient_group_id,
          COALESCE(ig.name_he, NULL) as ingredient_group_name,
          COALESCE(mcci.is_required, 0) as is_required,
          mcci.volume_prices,
          COALESCE(igci.sort_order, NULL) as group_sort_order
        FROM menu_category_custom_ingredients mcci
        INNER JOIN menu_categories mc ON mcci.category_id = mc.id
        INNER JOIN custom_ingredients ci ON mcci.custom_ingredient_id = ci.id
        LEFT JOIN ingredient_groups ig ON ig.id = mcci.ingredient_group_id
        LEFT JOIN ingredient_group_custom_ingredients igci
          ON igci.ingredient_group_id = mcci.ingredient_group_id
          AND igci.custom_ingredient_id = ci.id
        WHERE mcci.category_id = ? ${availabilityFilter}
        ORDER BY ci.ingredient_category, COALESCE(igci.sort_order, ci.sort_order), ci.name`,
        [id],
        (err: any, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ configs: rows || [] }));
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { configs } = body;

    if (!Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'configs must be an array' },
        { status: 400 }
      );
    }

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const normalizedConfigs = (configs as any[]).map((config: any) => {
      const ingredientId = Number(config.ingredient_id ?? config.custom_ingredient_id);
      const groupId = config.ingredient_group_id ? Number(config.ingredient_group_id) : null;
      const groupName = config.ingredient_group ?? null;
      return {
        ingredient_id: ingredientId,
        selection_type: groupId ? 'single' : (config.selection_type || 'multiple'),
        price_override: config.price_override ?? null,
        ingredient_group_id: groupId || null,
        ingredient_group: groupName,
        is_required: groupId ? !!config.is_required : false,
        volume_prices: config.volume_prices || null,
      };
    });

    return new Promise<NextResponse>((resolve) => {
      // Delete all existing configs for this category
      db.run(
        'DELETE FROM menu_category_custom_ingredients WHERE category_id = ?',
        [id],
        (err: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          // Insert new configs
          if (normalizedConfigs.length === 0) {
            resolve(NextResponse.json({ success: true, configs: [] }));
            return;
          }

          const placeholders = normalizedConfigs.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
          const values: any[] = [];
          normalizedConfigs.forEach((config: any) => {
            values.push(
              id,
              config.ingredient_id,
              config.selection_type || 'multiple',
              config.price_override || null,
              config.ingredient_group_id || null,
              config.ingredient_group || null,
              config.is_required ? 1 : 0,
              config.volume_prices || null // Store as JSON string
            );
          });

          db.run(
            `INSERT INTO menu_category_custom_ingredients (category_id, custom_ingredient_id, selection_type, price_override, ingredient_group_id, ingredient_group, is_required, volume_prices) 
            VALUES ${placeholders}`,
            values,
            function (this: any, err: any) {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }
              resolve(NextResponse.json({ success: true, configs }));
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

