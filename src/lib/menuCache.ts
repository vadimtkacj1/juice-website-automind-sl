// In-memory cache for menu data (30 seconds TTL for faster updates)
let menuCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds - reduced from 5 minutes for faster admin updates

export function getMenuCache() {
  if (menuCache && (Date.now() - menuCache.timestamp) < CACHE_TTL) {
    return menuCache.data;
  }
  return null;
}

export function setMenuCache(data: any) {
  menuCache = {
    data,
    timestamp: Date.now()
  };
}

export function invalidateMenuCache() {
  menuCache = null;
  console.log('[Menu Cache] Cache invalidated');
}

// Get cache version/timestamp for cache busting
let cacheVersion = Date.now();

export function getCacheVersion(): number {
  return cacheVersion;
}

export function updateCacheVersion(): void {
  cacheVersion = Date.now();
  console.log('[Menu Cache] Cache version updated:', cacheVersion);
}

// Default export to support both import styles
export default {
  getMenuCache,
  setMenuCache,
  invalidateMenuCache,
  getCacheVersion,
  updateCacheVersion
};
