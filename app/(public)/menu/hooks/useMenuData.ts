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
    const newMenu: MenuCategory[] = [];

    // Process each category and fetch volumes
    for (const category of data) {
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

    setAllMenuItems(newMenu);
    setDisplayedMenu(
      newMenu.map((cat) => ({ ...cat, items: cat.items.slice(0, ITEMS_PER_LOAD) }))
    );
    setHasMore(newMenu.some((cat) => cat.items.length > ITEMS_PER_LOAD));
  }, []);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        await processAndSetMenu(data.menu || []);
      }
    } catch (err) {
      setError(translateToHebrew('Failed to load menu'));
    } finally {
      // Small delay to prevent flash
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
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

