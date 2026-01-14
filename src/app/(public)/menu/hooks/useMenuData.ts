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
    const newMenu: MenuCategory[] = (data || []).filter(
      (cat) => cat.items && cat.items.length > 0
    );

    const initialMenu = newMenu.map((category) => ({
      ...category,
      items: category.items.slice(0, ITEMS_PER_LOAD),
    }));

    setAllMenuItems(newMenu);
    setDisplayedMenu(initialMenu);
    setDisplayLimit(ITEMS_PER_LOAD);
    setHasMore(newMenu.some((cat) => cat.items.length > ITEMS_PER_LOAD));
    setError(null);
  }, []);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setGlobalLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/menu', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        await processAndSetMenu(data.menu || []);
      }
    } catch (err: any) {
      setError(translateToHebrew('Failed to load menu'));
      console.error('Failed to fetch menu', err);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [processAndSetMenu, setGlobalLoading]);

  const loadMoreItems = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const newLimit = displayLimit + ITEMS_PER_LOAD;

    const newDisplayedMenu = allMenuItems.map((category) => ({
      ...category,
      items: category.items.slice(0, newLimit),
    }));

    setDisplayedMenu(newDisplayedMenu);
    setDisplayLimit(newLimit);
    setHasMore(allMenuItems.some((cat) => cat.items.length > newLimit));
    setLoadingMore(false);
  }, [allMenuItems, displayLimit, hasMore, loadingMore]);

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

