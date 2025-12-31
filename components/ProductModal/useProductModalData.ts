import { useEffect, useState } from 'react';

interface Addon {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

interface CustomIngredient {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredient_category?: 'boosters' | 'fruits' | 'toppings';
  selection_type?: 'single' | 'multiple';
  price_override?: number;
}

interface VolumeOption {
  id?: number;
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

interface ProductModalItem {
  id: number;
  category_id?: number;
  [key: string]: any;
}

export function useProductModalData(item: ProductModalItem | null, isOpen: boolean) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [customIngredients, setCustomIngredients] = useState<CustomIngredient[]>([]);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);

  useEffect(() => {
    if (!isOpen || !item) {
      setAddons([]);
      setCustomIngredients([]);
      setVolumeOptions([]);
      return;
    }

    // Fetch addons
    fetch('/api/addons')
      .then(res => res.json())
      .then(data => {
        if (data.addons) {
          setAddons(data.addons);
        }
      })
      .catch(err => console.error('Error fetching addons:', err));

    // Fetch custom ingredients for this menu item's category
    const fetchIngredients = (categoryId: number) => {
      console.log('Fetching ingredients for category:', categoryId);
      fetch(`/api/menu-categories/${categoryId}/ingredient-configs`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch ingredient configs: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Fetched ingredient configs for category', categoryId, ':', data);
          if (data.configs && data.configs.length > 0) {
            console.log(`Found ${data.configs.length} ingredient configs`);
            Promise.all(
              data.configs.map((config: any) =>
                fetch(`/api/custom-ingredients/${config.custom_ingredient_id}`)
                  .then(res => {
                    if (!res.ok) {
                      throw new Error(`Failed to fetch ingredient ${config.custom_ingredient_id}`);
                    }
                    return res.json();
                  })
                  .then(ingData => {
                    if (ingData.ingredient && ingData.ingredient.is_available) {
                      return {
                        id: config.custom_ingredient_id,
                        name: config.ingredient_name,
                        price: config.price_override !== null && config.price_override !== undefined 
                          ? config.price_override 
                          : (ingData.ingredient?.price || 0),
                        selection_type: config.selection_type,
                        price_override: config.price_override,
                        ingredient_category: ingData.ingredient?.ingredient_category || 'fruits',
                      };
                    }
                    return null;
                  })
                  .catch(err => {
                    console.error(`Error fetching ingredient ${config.custom_ingredient_id}:`, err);
                    return null;
                  })
              )
            ).then(fullIngredients => {
              const availableIngredients = fullIngredients.filter((ing: any) => ing !== null);
              console.log('Setting custom ingredients:', availableIngredients);
              setCustomIngredients(availableIngredients);
            })
            .catch(err => {
              console.error('Error processing ingredients:', err);
              setCustomIngredients([]);
            });
          } else {
            console.log('No ingredient configs found for category:', categoryId);
            setCustomIngredients([]);
          }
        })
        .catch(err => {
          console.error('Error fetching custom ingredients:', err);
          setCustomIngredients([]);
        });
    };

    if (item.category_id) {
      console.log('Item has category_id:', item.category_id);
      fetchIngredients(item.category_id);
    } else {
      console.log('Item missing category_id, fetching from API for item:', item.id);
      fetch(`/api/menu-items/${item.id}`)
        .then(res => res.json())
        .then(itemData => {
          console.log('Fetched item data:', itemData);
          if (itemData.item?.category_id) {
            console.log('Found category_id from API:', itemData.item.category_id);
            fetchIngredients(itemData.item.category_id);
          } else {
            console.warn('No category_id found for item:', item.id);
          }
        })
        .catch(err => console.error('Error fetching item category:', err));
    }

    // Fetch volume options from category (not item)
    const fetchCategoryVolumes = (categoryId: number) => {
      fetch(`/api/menu-categories/${categoryId}/volumes`)
        .then(res => res.json())
        .then(data => {
          if (data.volumes && data.volumes.length > 0) {
            // Convert category volumes to volume options with prices
            // Prices will be calculated based on item base price
            const basePrice = item.price || 0;
            const volumes: VolumeOption[] = data.volumes.map((vol: any) => ({
              id: vol.id,
              volume: vol.volume,
              price: basePrice, // Base price, will be adjusted if needed
              is_default: vol.is_default || false,
              sort_order: vol.sort_order || 0,
            }));
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
  }, [isOpen, item]);

  return { addons, customIngredients, volumeOptions };
}

