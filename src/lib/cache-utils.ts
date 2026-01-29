/**
 * Cache busting utilities for images and dynamic content
 */

/**
 * Add cache-busting query parameter to image URL
 * This forces browsers to fetch new images when they're updated
 */
export function addCacheBuster(url: string | undefined | null): string {
  if (!url) return '';
  
  // Don't add cache buster to external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add timestamp query parameter
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  return `${url}${separator}v=${timestamp}`;
}

/**
 * Get cache version from server
 */
export async function getCacheVersion(): Promise<number> {
  try {
    const response = await fetch('/api/menu-cache-version', {
      cache: 'no-store'
    });
    const data = await response.json();
    return data.version || Date.now();
  } catch (error) {
    console.error('Failed to get cache version:', error);
    return Date.now();
  }
}

/**
 * Add cache version to image URL (for server-side rendering)
 */
export function addCacheVersion(url: string | undefined | null, version?: number): string {
  if (!url) return '';
  
  // Don't add cache buster to external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const v = version || Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${v}`;
}
