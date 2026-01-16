import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Best-effort: ensure tables/columns exist for group/required support
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

        const [groupIdCols] = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu_item_custom_ingredients' AND COLUMN_NAME = 'ingredient_group_id'`
        );
        if ((groupIdCols as any[])?.length === 0) {
          await pool.query(`ALTER TABLE menu_item_custom_ingredients ADD COLUMN ingredient_group_id INT`);
        }

        const [groupCols] = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu_item_custom_ingredients' AND COLUMN_NAME = 'ingredient_group'`
        );
        if ((groupCols as any[])?.length === 0) {
          await pool.query(`ALTER TABLE menu_item_custom_ingredients ADD COLUMN ingredient_group TEXT`);
        }

        const [requiredCols] = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'menu_item_custom_ingredients' AND COLUMN_NAME = 'is_required'`
        );
        if ((requiredCols as any[])?.length === 0) {
          await pool.query(`ALTER TABLE menu_item_custom_ingredients ADD COLUMN is_required TINYINT(1) DEFAULT 0`);
        }
      } catch (err: any) {
        if (!String(err?.message || '').includes('Duplicate column')) {
          console.warn('Warning: could not ensure ingredient group columns on menu_item_custom_ingredients', err);
        }
      }
    }

    const availabilityFilter = includeInactive ? '' : 'AND (ci.is_available = 1 OR ci.is_available = true OR ci.is_available = "1")';

    return new Promise<NextResponse>((resolve) => {
      // First get the menu item to find its category
      db.get(
        'SELECT category_id FROM menu_items WHERE id = ?',
        [id],
        (err: any, menuItem: any) => {
          if (err) {
            console.error('Database error getting menu item:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          if (!menuItem) {
            resolve(NextResponse.json({ error: 'Menu item not found' }, { status: 404 }));
            return;
          }

          // Get ingredients from both menu item and its category
          db.all(
            `SELECT 
              ci.*,
              COALESCE(mici.selection_type, mcci.selection_type, 'multiple') as selection_type,
              COALESCE(mici.price_override, mcci.price_override, NULL) as price_override,
              COALESCE(mici.ingredient_group, mcci.ingredient_group, NULL) as ingredient_group,
              COALESCE(mici.ingredient_group_id, mcci.ingredient_group_id, NULL) as ingredient_group_id,
              COALESCE(ig.name_he, NULL) as ingredient_group_name,
              COALESCE(mici.is_required, mcci.is_required, 0) as is_required,
              COALESCE(igci.sort_order, NULL) as group_sort_order,
              CASE 
                WHEN mici.custom_ingredient_id IS NOT NULL THEN 'menu_item'
                ELSE 'category'
              END as source
            FROM custom_ingredients ci
            LEFT JOIN menu_item_custom_ingredients mici ON ci.id = mici.custom_ingredient_id AND mici.menu_item_id = ?
            LEFT JOIN menu_category_custom_ingredients mcci ON ci.id = mcci.custom_ingredient_id AND mcci.category_id = ?
            LEFT JOIN ingredient_groups ig ON ig.id = COALESCE(mici.ingredient_group_id, mcci.ingredient_group_id)
            LEFT JOIN ingredient_group_custom_ingredients igci 
              ON igci.ingredient_group_id = COALESCE(mici.ingredient_group_id, mcci.ingredient_group_id)
              AND igci.custom_ingredient_id = ci.id
            WHERE (mici.menu_item_id = ? OR mcci.category_id = ?) ${availabilityFilter}
            ORDER BY 
              CASE WHEN mici.custom_ingredient_id IS NOT NULL THEN 0 ELSE 1 END,
              ci.ingredient_category, 
              COALESCE(igci.sort_order, ci.sort_order), 
              ci.name`,
            [id, menuItem.category_id, id, menuItem.category_id],
            (err: any, rows: any[]) => {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }

              // Remove duplicates - menu item ingredients take priority over category ingredients
              const uniqueIngredients = new Map();
              (rows || []).forEach((row: any) => {
                if (!uniqueIngredients.has(row.id) || row.source === 'menu_item') {
                  uniqueIngredients.set(row.id, row);
                }
              });

              const finalIngredients = Array.from(uniqueIngredients.values());
              console.log(`[GET /api/menu-items/${id}/custom-ingredients] Found ${finalIngredients.length} ingredients (${rows?.filter((r: any) => r.source === 'menu_item').length || 0} from menu item, ${rows?.filter((r: any) => r.source === 'category').length || 0} from category)`);
              resolve(NextResponse.json({ ingredients: finalIngredients }));
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ingredient_ids, configs } = body;

    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Normalize input into configs
    let configsToSave: Array<{
      ingredient_id: number;
      selection_type: 'single' | 'multiple';
      price_override: number | null;
      ingredient_group_id: number | null;
      ingredient_group: string | null;
      is_required: boolean;
    }> = [];

    if (Array.isArray(configs)) {
      configsToSave = configs
        .map((config: any) => {
          const ingredientId = Number(config.ingredient_id ?? config.custom_ingredient_id);
          if (!Number.isFinite(ingredientId)) return null;
          const groupId = config.ingredient_group_id ? Number(config.ingredient_group_id) : null;
          const groupName = config.ingredient_group ? String(config.ingredient_group) : null;
          const selectionType: 'single' | 'multiple' =
            groupId ? 'single' : (config.selection_type === 'single' ? 'single' : 'multiple');
          return {
            ingredient_id: ingredientId,
            selection_type: selectionType,
            price_override: config.price_override ?? null,
            ingredient_group_id: groupId,
            ingredient_group: groupName,
            is_required: groupId ? !!config.is_required : false,
          };
        })
        .filter((v): v is NonNullable<typeof v> => !!v);
    } else if (Array.isArray(ingredient_ids)) {
      configsToSave = ingredient_ids
        .map((raw: any) => Number(raw))
        .filter((idNum) => Number.isFinite(idNum))
        .map((ingredientId) => ({
          ingredient_id: ingredientId,
          selection_type: 'multiple' as const,
          price_override: null,
          ingredient_group_id: null,
          ingredient_group: null,
          is_required: false,
        }));
    } else {
      return NextResponse.json(
        { error: 'ingredient_ids or configs must be an array' },
        { status: 400 }
      );
    }

    return new Promise<NextResponse>((resolve) => {
      // First, remove all existing associations
      db.run(
        'DELETE FROM menu_item_custom_ingredients WHERE menu_item_id = ?',
        [id],
        (err: any) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }

          // Then, insert new associations with default values
          if (configsToSave.length === 0) {
            resolve(NextResponse.json({ success: true, ingredients: [] }));
            return;
          }

          const placeholders = configsToSave.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
          const values: any[] = [];
          configsToSave.forEach((config) => {
            values.push(
              id,
              config.ingredient_id,
              config.selection_type || 'multiple',
              config.price_override ?? null,
              config.ingredient_group_id || null,
              config.ingredient_group || null,
              config.is_required ? 1 : 0
            );
          });

          db.run(
            `INSERT INTO menu_item_custom_ingredients (menu_item_id, custom_ingredient_id, selection_type, price_override, ingredient_group_id, ingredient_group, is_required) 
            VALUES ${placeholders}`,
            values,
            function (this: any, err: any) {
              if (err) {
                console.error('Database error:', err);
                resolve(NextResponse.json({ error: err.message }, { status: 500 }));
                return;
              }
              console.log(`[POST /api/menu-items/${id}/custom-ingredients] Successfully saved ${configsToSave.length} configs`);
              resolve(NextResponse.json({ success: true, ingredients: configsToSave }));
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('ingredient_id');

    if (!ingredientId) {
      return NextResponse.json(
        { error: 'ingredient_id parameter is required' },
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

    return new Promise<NextResponse>((resolve) => {
      db.run(
        'DELETE FROM menu_item_custom_ingredients WHERE menu_item_id = ? AND custom_ingredient_id = ?',
        [id, ingredientId],
        function (this: any, err: any) {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ success: true, message: 'Ingredient removed successfully' }));
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
