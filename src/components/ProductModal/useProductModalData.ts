import { useEffect, useState } from 'react';
import { ProductModalItem, CustomIngredient, VolumeOption, AdditionalItem } from './types';

// Client-side cache for modal data
const modalDataCache = new Map<number, {
  ingredients: CustomIngredient[];
  volumes: VolumeOption[];
  additionalItems: AdditionalItem[];
  timestamp: number;
}>();

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Prefetch function for hover optimization
export const prefetchModalData = async (itemId: number) => {
  // Check if already cached and valid
  const cached = modalDataCache.get(itemId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return; // Already cached
  }

  try {
    const response = await fetch(`/api/menu-items/${itemId}/modal-data`);
    if (!response.ok) return;

    const data = await response.json();

    // Store in cache
    modalDataCache.set(itemId, {
      ingredients: data.ingredients || [],
      volumes: data.volumes || [],
      additionalItems: data.additionalItems || [],
      timestamp: Date.now()
    });
  } catch (err) {
    // Silently fail for prefetch
  }
};

// Process ingredients data
function processIngredients(ingredients: any[]): CustomIngredient[] {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  console.log(`Found ${ingredients.length} ingredients from optimized API`);

  return ingredients.map((ing: any) => {
    const ingredient: CustomIngredient = {
      id: ing.id,
      name: ing.name,
      price: ing.price_override !== null && ing.price_override !== undefined
        ? ing.price_override
        : (typeof ing.price === 'string' ? parseFloat(ing.price) : (ing.price || 0)),
      selection_type: ing.ingredient_group ? 'single' : (ing.selection_type || 'multiple'),
      price_override: ing.price_override !== null && ing.price_override !== undefined ? ing.price_override : undefined,
      ingredient_category: ing.ingredient_category || 'fruits',
      ingredient_group: ing.ingredient_group_name || ing.ingredient_group || undefined,
      is_required: ing.ingredient_group ? (ing.is_required === 1 || ing.is_required === true) : false,
      image: ing.image || undefined,
      description: ing.description || undefined,
    };
    return ingredient;
  });
}

// Process volume options data
function processVolumes(volumes: any[], item: ProductModalItem): VolumeOption[] {
  if (!volumes || volumes.length === 0) {
    return [];
  }

  const basePrice = typeof item.price === 'number'
    ? item.price
    : (typeof item.price === 'string' ? parseFloat(item.price) : 0) || 0;

  return volumes.map((vol: any) => {
    let volPrice = basePrice;
    if (vol.price !== undefined && vol.price !== null) {
      volPrice = typeof vol.price === 'number'
        ? vol.price
        : (typeof vol.price === 'string' ? parseFloat(vol.price) : 0) || 0;
    }

    return {
      id: vol.id,
      volume: vol.volume,
      price: volPrice,
      is_default: vol.is_default || false,
      sort_order: vol.sort_order || 0,
    };
  });
}

export function useProductModalData(item: ProductModalItem | null, isOpen: boolean) {
  const [customIngredients, setCustomIngredients] = useState<CustomIngredient[]>([]);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !item) {
      setCustomIngredients([]);
      setVolumeOptions([]);
      setAdditionalItems([]);
      setIsLoading(false);
      return;
    }

    // Optimized: fetch all modal data in a single API call with caching
    const fetchModalData = async (itemId: number) => {
      // Check cache first
      const cached = modalDataCache.get(itemId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('Using cached modal data for menu item:', itemId);
        setCustomIngredients(processIngredients(cached.ingredients));
        setVolumeOptions(processVolumes(cached.volumes, item));
        setAdditionalItems(cached.additionalItems);
        setIsLoading(false);
        return;
      }

      console.log('Fetching all modal data for menu item:', itemId);
      setIsLoading(true);

      try {
        const response = await fetch(`/api/menu-items/${itemId}/modal-data`);

        if (!response.ok) {
          console.error('Failed to fetch modal data for menu item', itemId, 'Status:', response.status);
          setCustomIngredients([]);
          setVolumeOptions([]);
          setAdditionalItems([]);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Fetched modal data for menu item', itemId, ':', data);

        // Store in cache
        modalDataCache.set(itemId, {
          ingredients: data.ingredients || [],
          volumes: data.volumes || [],
          additionalItems: data.additionalItems || [],
          timestamp: Date.now()
        });

        // Process and set data
        setCustomIngredients(processIngredients(data.ingredients || []));
        setVolumeOptions(processVolumes(data.volumes || [], item));
        setAdditionalItems(data.additionalItems || []);
        setIsLoading(false);

      } catch (err) {
        console.error('Error fetching modal data:', err);
        setCustomIngredients([]);
        setVolumeOptions([]);
        setAdditionalItems([]);
        setIsLoading(false);
      }
    };

    fetchModalData(item.id);
  }, [isOpen, item]);

  return { customIngredients, volumeOptions, additionalItems, isLoading };
}
