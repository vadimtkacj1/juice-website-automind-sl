import { useEffect, useState } from 'react';
import { ProductModalItem, CustomIngredient, VolumeOption, AdditionalItem } from './types';

export function useProductModalData(item: ProductModalItem | null, isOpen: boolean) {
  const [customIngredients, setCustomIngredients] = useState<CustomIngredient[]>([]);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([]);

  useEffect(() => {
    if (!isOpen || !item) {
      setCustomIngredients([]);
      setVolumeOptions([]);
      setAdditionalItems([]);
      return;
    }

    // Fetch custom ingredients from both category and menu item
    const fetchIngredients = async (categoryId: number | null, itemId: number) => {
      console.log('Fetching ingredients for category:', categoryId, 'and menu item:', itemId);
      
      const allIngredients: CustomIngredient[] = [];
      const ingredientIds = new Set<number>(); // To avoid duplicates

      // Fetch ingredients from category (if categoryId is provided)
      if (categoryId && categoryId > 0) {
        try {
          // Include inactive ingredients since admin explicitly added them to the category
          const categoryRes = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs?include_inactive=true`);
          if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            console.log('Fetched ingredient configs for category', categoryId, ':', categoryData);
            
            if (categoryData.configs && categoryData.configs.length > 0) {
              console.log(`Found ${categoryData.configs.length} ingredient configs from category`);
              
              const categoryIngredients = await Promise.all(
                categoryData.configs.map(async (config: any) => {
                  try {
                    const ingRes = await fetch(`/api/custom-ingredients/${config.custom_ingredient_id}`);
                    let ingData: any = null;
                    
                    if (ingRes.ok) {
                      ingData = await ingRes.json();
                    } else {
                      console.warn(`Failed to fetch ingredient ${config.custom_ingredient_id}:`, ingRes.status, 'Using config data only');
                    }
                    
                    // For category configs, we trust the admin's selection
                    // The ingredient was explicitly added to the category, so it should be shown
                    // Use config data as fallback if ingredient fetch failed
                    if (ingData?.ingredient || config.ingredient_name) {
                      // Check is_available properly (handles both number 1/0 and boolean true/false)
                      const isAvailable = ingData?.ingredient 
                        ? (ingData.ingredient.is_available === 1 || 
                           ingData.ingredient.is_available === true || 
                           ingData.ingredient.is_available === '1')
                        : true; // Assume available if we can't check
                      
                      // Even if not available, show it if it's in category config (admin explicitly added it)
                      // But log a warning
                      if (ingData?.ingredient && !isAvailable) {
                        console.warn(`Ingredient ${config.custom_ingredient_id} (${config.ingredient_name}) is marked as unavailable but is in category config`);
                      }
                      
                      const ingredient: CustomIngredient = {
                        id: config.custom_ingredient_id,
                        name: config.ingredient_name || ingData?.ingredient?.name || 'Unknown',
                        price: config.price_override !== null && config.price_override !== undefined 
                          ? config.price_override 
                          : (ingData?.ingredient?.price || 0),
                        selection_type: config.selection_type || 'multiple',
                        price_override: config.price_override,
                        ingredient_category: ingData?.ingredient?.ingredient_category || 'fruits',
                        image: ingData?.ingredient?.image || undefined,
                        description: ingData?.ingredient?.description || undefined,
                      };
                      // Don't add to ingredientIds here - it will be added in forEach below
                      console.log('Prepared ingredient from category:', ingredient.name, ingredient.id);
                      return ingredient;
                    }
                    console.warn(`No ingredient data available for ${config.custom_ingredient_id}`);
                    return null;
                  } catch (err) {
                    console.error(`Error fetching ingredient ${config.custom_ingredient_id}:`, err);
                    // Try to create ingredient from config data as fallback
                    if (config.custom_ingredient_id && config.ingredient_name) {
                      console.log('Creating ingredient from config data as fallback:', config.ingredient_name);
                      const fallbackIngredient: CustomIngredient = {
                        id: config.custom_ingredient_id,
                        name: config.ingredient_name,
                        price: config.price_override !== null && config.price_override !== undefined 
                          ? config.price_override 
                          : 0,
                        selection_type: config.selection_type || 'multiple',
                        price_override: config.price_override,
                        ingredient_category: 'fruits',
                      };
                      // Don't add to ingredientIds here - it will be added in forEach below
                      return fallbackIngredient;
                    }
                    return null;
                  }
                })
              );
              
              categoryIngredients.forEach(ing => {
                if (ing && !ingredientIds.has(ing.id)) {
                  allIngredients.push(ing);
                  ingredientIds.add(ing.id);
                  console.log('Added ingredient from category:', ing.name, ing.id);
                }
              });
            }
          }
        } catch (err) {
          console.error('Error fetching category ingredients:', err);
        }
      }

      // Fetch ingredients directly from menu item
      try {
        const itemRes = await fetch(`/api/menu-items/${itemId}/custom-ingredients`);
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          console.log('Fetched ingredients for menu item', itemId, ':', itemData);
          
          if (itemData.ingredients && itemData.ingredients.length > 0) {
            console.log(`Found ${itemData.ingredients.length} ingredients from menu item`);
            
            itemData.ingredients.forEach((ing: any) => {
              // Only add if not already added from category
              if (!ingredientIds.has(ing.id)) {
                // Menu item ingredients are already filtered by is_available in the API
                // So we can add them directly
                const ingredient: CustomIngredient = {
                  id: ing.id,
                  name: ing.name,
                  price: ing.price_override !== null && ing.price_override !== undefined 
                    ? ing.price_override 
                    : (typeof ing.price === 'string' ? parseFloat(ing.price) : (ing.price || 0)),
                  selection_type: ing.selection_type || 'multiple',
                  price_override: ing.price_override !== null && ing.price_override !== undefined ? ing.price_override : undefined,
                  ingredient_category: ing.ingredient_category || 'fruits',
                  image: ing.image || undefined,
                  description: ing.description || undefined,
                };
                allIngredients.push(ingredient);
                ingredientIds.add(ingredient.id);
                console.log('Added ingredient from menu item:', ingredient.name, ingredient.id, 'image:', ingredient.image);
              } else {
                console.log('Skipped ingredient from menu item (already added from category):', ing.id, ing.name);
              }
            });
          } else {
            console.log('No ingredients found for menu item', itemId);
          }
        } else {
          console.error('Failed to fetch ingredients for menu item', itemId, 'Status:', itemRes.status);
        }
      } catch (err) {
        console.error('Error fetching menu item ingredients:', err);
      }

      console.log('Setting custom ingredients (total):', allIngredients.length, allIngredients);
      setCustomIngredients(allIngredients);
    };

    if (item.category_id) {
      console.log('Item has category_id:', item.category_id);
      fetchIngredients(item.category_id, item.id);
    } else {
      console.log('Item missing category_id, fetching from API for item:', item.id);
      fetch(`/api/menu-items/${item.id}`)
        .then(res => res.json())
        .then(itemData => {
          console.log('Fetched item data:', itemData);
          if (itemData.item?.category_id) {
            console.log('Found category_id from API:', itemData.item.category_id);
            fetchIngredients(itemData.item.category_id, item.id);
          } else {
            console.warn('No category_id found for item:', item.id);
            // Still try to fetch ingredients from menu item only
            fetchIngredients(null, item.id);
          }
        })
        .catch(err => {
          console.error('Error fetching item category:', err);
          // Still try to fetch ingredients from menu item only
          fetchIngredients(null, item.id);
        });
    }

    // Fetch volume options from category (not item)
    const fetchCategoryVolumes = (categoryId: number) => {
      fetch(`/api/menu-categories/${categoryId}/volumes`)
        .then(res => res.json())
        .then(data => {
          if (data.volumes && data.volumes.length > 0) {
            // Convert category volumes to volume options with prices
            // Prices will be calculated based on item base price
            // Ensure basePrice is always a number
            const basePrice = typeof item.price === 'number' 
              ? item.price 
              : (typeof item.price === 'string' ? parseFloat(item.price) : 0) || 0;
            
            const volumes: VolumeOption[] = data.volumes.map((vol: any) => {
              // Ensure vol.price is a number if it exists, otherwise use basePrice
              let volPrice = basePrice;
              if (vol.price !== undefined && vol.price !== null) {
                volPrice = typeof vol.price === 'number' 
                  ? vol.price 
                  : (typeof vol.price === 'string' ? parseFloat(vol.price) : 0) || 0;
              }
              
              return {
                id: vol.id,
                volume: vol.volume,
                price: volPrice, // Ensure it's always a number
                is_default: vol.is_default || false,
                sort_order: vol.sort_order || 0,
              };
            });
            setVolumeOptions(volumes);
          } else {
            setVolumeOptions([]);
          }
        })
        .catch(err => console.error('Error fetching category volumes:', err));
    };

    if (item.category_id) {
      fetchCategoryVolumes(item.category_id);
    } else {
      // Try to get category_id from API
      fetch(`/api/menu-items/${item.id}`)
        .then(res => res.json())
        .then(itemData => {
          if (itemData.item?.category_id) {
            fetchCategoryVolumes(itemData.item.category_id);
          }
        })
        .catch(err => console.error('Error fetching item category:', err));
    }

    // Fetch additional items for this menu item
    fetch(`/api/menu-items/${item.id}/additional-items`)
      .then(res => res.json())
      .then(data => {
        if (data.additionalItems) {
          setAdditionalItems(data.additionalItems);
        }
      })
      .catch(err => console.error('Error fetching additional items:', err));
  }, [isOpen, item]);

  return { customIngredients, volumeOptions, additionalItems };
}
