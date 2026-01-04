import { useState, useCallback } from 'react';
import { useLoading } from '@/lib/loading-context';
import { translateToHebrew } from '@/lib/translations';
import { MenuCategory } from '../components/MenuCategorySection';
import { MenuItem } from '../components/MenuItemCard';

const ITEMS_PER_LOAD = 6;

export function useMenuData() {
  const [allMenuItems, setAllMenuItems] = useState<MenuCategory[]>([]);
  const [displayedMenu, setDisplayedMenu] = useState<MenuCategory[]>([]);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_LOAD);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setLoading: setGlobalLoading } = useLoading();

  const processAndSetMenu = useCallback(async (data: MenuCategory[]) => {
    const requestId = `[${Date.now()}]`;
    console.log(`${requestId} [Frontend] ===== processAndSetMenu called =====`);
    console.log(`${requestId} [Frontend] Input data: ${data.length} categories`);
    
    const newMenu: MenuCategory[] = [];

    // Process each category and fetch volumes
    for (const category of data) {
      console.log(`${requestId} [Frontend] Processing category: ${category.name} (ID: ${category.id}) with ${category.items?.length || 0} items`);
      if (category.items && category.items.length > 0) {
        // Fetch category volumes
        let categoryVolumes: any[] = [];
        try {
          const volumesRes = await fetch(`/api/menu-categories/${category.id}/volumes`);
          const volumesData = await volumesRes.json();
          categoryVolumes = volumesData.volumes || [];
        } catch (err) {
          console.error('Error fetching category volumes:', err);
        }

        // Sort volumes by sort_order
        const sortedVolumes = [...categoryVolumes].sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        );

        // Update items with all volume info
        const itemsWithVolumes = category.items.map((item) => {
          if (sortedVolumes.length > 0) {
            return {
              ...item,
              categoryVolumes: sortedVolumes, // Store all volumes for this category
            };
          }
          return item;
        });

        newMenu.push({
          ...category,
          items: itemsWithVolumes,
        });
      }
    }

    console.log(`${requestId} [Frontend] Final menu: ${newMenu.length} categories`);
    console.log(`${requestId} [Frontend] Total items across all categories: ${newMenu.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}`);
    
    setAllMenuItems(newMenu);
    setDisplayedMenu(
      newMenu.map((cat) => ({ ...cat, items: cat.items.slice(0, ITEMS_PER_LOAD) }))
    );
    setHasMore(newMenu.some((cat) => cat.items.length > ITEMS_PER_LOAD));
    console.log(`${requestId} [Frontend] ===== processAndSetMenu completed =====`);
  }, []);

  const fetchMenu = useCallback(async () => {
    const requestId = `[${Date.now()}]`;
    console.log(`${requestId} [Frontend] ===== fetchMenu called =====`);
    
    setLoading(true);
    setGlobalLoading(true);
    try {
      console.log(`${requestId} [Frontend] Fetching from /api/menu...`);
      const response = await fetch('/api/menu');
      console.log(`${requestId} [Frontend] Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log(`${requestId} [Frontend] Response data:`, {
        hasError: !!data.error,
        hasMenu: !!data.menu,
        menuLength: data.menu?.length || 0,
        debug: data.debug || null
      });

      if (data.error) {
        console.error(`${requestId} [Frontend] API returned error:`, data.error);
        if (data.debug) {
          console.error(`${requestId} [Frontend] Debug info:`, data.debug);
        }
        setError(data.error);
      } else {
        console.log(`${requestId} [Frontend] Processing menu with ${data.menu?.length || 0} categories`);
        if (data.menu && data.menu.length > 0) {
          console.log(`${requestId} [Frontend] Category breakdown:`, data.menu.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            itemCount: cat.items?.length || 0
          })));
        } else {
          console.warn(`${requestId} [Frontend] WARNING: Menu array is empty!`);
          if (data.debug) {
            console.warn(`${requestId} [Frontend] Debug info:`, data.debug);
          }
        }
        await processAndSetMenu(data.menu || []);
        console.log(`${requestId} [Frontend] Menu processed successfully`);
      }
    } catch (err: any) {
      console.error(`${requestId} [Frontend] Fetch error:`, err);
      console.error(`${requestId} [Frontend] Error message:`, err.message);
      console.error(`${requestId} [Frontend] Error stack:`, err.stack);
      setError(translateToHebrew('Failed to load menu'));
    } finally {
      // Small delay to prevent flash
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
        console.log(`${requestId} [Frontend] ===== fetchMenu completed =====`);
      }, 300);
    }
  }, [processAndSetMenu, setGlobalLoading]);

  const loadMoreItems = useCallback(() => {
    setLoadingMore(true);
    console.log('Loading more items...', { displayLimit, hasMore });
    const newLimit = displayLimit + ITEMS_PER_LOAD;

    const newDisplayedMenu = allMenuItems.map((category) => {
      const currentlyDisplayed = category.items.slice(0, displayLimit);
      const newItems = category.items.slice(displayLimit, newLimit);
      return { ...category, items: [...currentlyDisplayed, ...newItems] };
    });
    setDisplayedMenu(newDisplayedMenu);
    setDisplayLimit(newLimit);
    setHasMore(allMenuItems.some((cat) => cat.items.length > newLimit));
    setLoadingMore(false);
  }, [allMenuItems, displayLimit, hasMore]);

  return {
    allMenuItems,
    displayedMenu,
    hasMore,
    loading,
    loadingMore,
    error,
    fetchMenu,
    loadMoreItems,
  };
}

