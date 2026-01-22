import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { translateObject } from '@/lib/translations';

/**
 * Optimized combined endpoint that fetches all modal data in a single request
 * Returns: ingredients, volumes, and additional items
 */
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

    // Schema checks moved to migration/setup - not needed on every request

    const dbGet = promisify(db.get).bind(db);
    const dbAll = promisify(db.all).bind(db);

    // Single optimized query to get menu item with category_id
    const menuItem = await dbGet(
      'SELECT id, category_id FROM menu_items WHERE id = ?',
      [id]
    ) as any;

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const availabilityFilter = includeInactive
      ? ''
      : 'AND (ci.is_available = 1 OR ci.is_available = true OR ci.is_available = "1")';

    // Execute all three queries in parallel for maximum performance
    const [ingredients, volumes, additionalItems] = await Promise.all([
      // Ingredients query
      dbAll(
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
        [id, menuItem.category_id, id, menuItem.category_id]
      ),

      // Volumes query
      dbAll(
        `SELECT * FROM menu_item_volumes
        WHERE menu_item_id = ?
        ORDER BY sort_order, volume`,
        [id]
      ),

      // Additional items query
      dbAll(
        'SELECT * FROM menu_item_additional_items WHERE menu_item_id = ? AND is_available = 1 ORDER BY sort_order, name',
        [id]
      )
    ]);

    // Remove duplicate ingredients - menu item ingredients take priority
    const uniqueIngredients = new Map();
    (ingredients as any[] || []).forEach((row: any) => {
      if (!uniqueIngredients.has(row.id) || row.source === 'menu_item') {
        uniqueIngredients.set(row.id, row);
      }
    });

    const finalIngredients = Array.from(uniqueIngredients.values());
    const translatedAdditionalItems = (additionalItems as any[] || []).map((item: any) => translateObject(item));

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Modal API] Item ${id}: ${finalIngredients.length} ingredients, ${(volumes as any[]).length} volumes, ${translatedAdditionalItems.length} additional items`);
    }

    return NextResponse.json({
      ingredients: finalIngredients,
      volumes: volumes || [],
      additionalItems: translatedAdditionalItems
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
