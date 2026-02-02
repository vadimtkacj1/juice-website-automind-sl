'use client';

/**
 * Client-side cache utility for menu data
 * Uses localStorage to cache API responses
 */

const CACHE_KEY = 'juice_menu_cache';
const CACHE_VERSION_KEY = 'juice_menu_cache_version';
const CACHE_TIMESTAMP_KEY = 'juice_menu_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface MenuCacheData {
  menu: any[];
  cacheVersion: string;
  timestamp: number;
}

/**
 * Get cached menu data from localStorage
 * Returns null if cache is invalid, expired, or doesn't exist
 */
export function getCachedMenuData(): MenuCacheData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cachedData || !cachedTimestamp) {
      return null;
    }

    const timestamp = parseInt(cachedTimestamp, 10);
    const now = Date.now();

    // Check if cache is expired
    if (now - timestamp > CACHE_DURATION) {
      clearMenuCache();
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    return {
      ...parsedData,
      timestamp,
    };
  } catch (error) {
    console.error('Error reading menu cache:', error);
    clearMenuCache();
    return null;
  }
}

/**
 * Save menu data to localStorage
 */
export function setCachedMenuData(data: { menu: any[]; cacheVersion: string }): void {
  if (typeof window === 'undefined') return;

  try {
    const timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_VERSION_KEY, data.cacheVersion);
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving menu cache:', error);
    // If localStorage is full, clear cache and try again
    clearMenuCache();
  }
}

/**
 * Clear menu cache from localStorage
 */
export function clearMenuCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing menu cache:', error);
  }
}

/**
 * Check if cache version matches server version
 */
export function isCacheVersionValid(serverVersion: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    return cachedVersion === serverVersion;
  } catch (error) {
    return false;
  }
}

/**
 * Fetch menu data with caching
 * Checks localStorage first, then fetches from API if needed
 */
export async function fetchMenuWithCache(): Promise<{ menu: any[]; cacheVersion: string }> {
  // Try to get cached data first
  const cachedData = getCachedMenuData();
  if (cachedData) {
    console.log('[Cache] Using cached menu data');
    return cachedData;
  }

  // Fetch from API
  console.log('[Cache] Fetching fresh menu data from API');
  const response = await fetch('/api/menu');

  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }

  const data = await response.json();

  // Save to cache
  setCachedMenuData(data);

  return data;
}

/**
 * Preload images in the background
 * This helps browser cache images before they're actually displayed
 */
export function preloadImages(imageUrls: string[]): void {
  if (typeof window === 'undefined') return;

  imageUrls.forEach((url) => {
    if (!url) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}
