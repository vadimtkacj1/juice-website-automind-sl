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
    console.error(`${requestId} [Frontend] ===== processAndSetMenu called =====`);
    console.error(`${requestId} [Frontend] Input data: ${data.length} categories`);
    
    // Volumes are now included in the API response, so we just need to process the data
    // No additional API calls needed!
    const newMenu: MenuCategory[] = data.filter(cat => cat.items && cat.items.length > 0);

    console.error(`${requestId} [Frontend] Final menu: ${newMenu.length} categories`);
    console.error(`${requestId} [Frontend] Total items across all categories: ${newMenu.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}`);
    
    setAllMenuItems(newMenu);
    // Показываем все элементы сразу, без ограничения
    setDisplayedMenu(newMenu);
    setHasMore(false);
    console.error(`${requestId} [Frontend] ===== processAndSetMenu completed =====`);
  }, []);

  const fetchMenu = useCallback(async () => {
    const requestId = `[${Date.now()}]`;
    console.error(`${requestId} [Frontend] ===== fetchMenu called =====`);
    
    setLoading(true);
    setGlobalLoading(true);
    try {
      console.error(`${requestId} [Frontend] Fetching from /api/menu...`);
      const response = await fetch('/api/menu');
      console.error(`${requestId} [Frontend] Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.error(`${requestId} [Frontend] Response data:`, JSON.stringify({
        hasError: !!data.error,
        hasMenu: !!data.menu,
        menuLength: data.menu?.length || 0,
        debug: data.debug || null
      }));

      if (data.error) {
        console.error(`${requestId} [Frontend] API returned error:`, data.error);
        if (data.debug) {
          console.error(`${requestId} [Frontend] Debug info:`, JSON.stringify(data.debug));
        }
        setError(data.error);
      } else {
        console.error(`${requestId} [Frontend] Processing menu with ${data.menu?.length || 0} categories`);
        if (data.menu && data.menu.length > 0) {
          console.error(`${requestId} [Frontend] Category breakdown:`, JSON.stringify(data.menu.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            itemCount: cat.items?.length || 0
          }))));
        } else {
          console.error(`${requestId} [Frontend] WARNING: Menu array is empty!`);
          if (data.debug) {
            console.error(`${requestId} [Frontend] Debug info:`, JSON.stringify(data.debug));
          }
        }
        await processAndSetMenu(data.menu || []);
        console.error(`${requestId} [Frontend] Menu processed successfully`);
      }
    } catch (err: any) {
      console.error(`${requestId} [Frontend] Fetch error:`, err);
      console.error(`${requestId} [Frontend] Error message:`, err.message);
      console.error(`${requestId} [Frontend] Error stack:`, err.stack);
      setError(translateToHebrew('Failed to load menu'));
    } finally {
      setLoading(false);
      setGlobalLoading(false);
      console.error(`${requestId} [Frontend] ===== fetchMenu completed =====`);
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

