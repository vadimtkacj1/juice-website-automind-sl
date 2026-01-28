import { MetadataRoute } from 'next';

async function getNewsItems() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return [];
    }

    return new Promise<any[]>((resolve) => {
      db.all(
        'SELECT id, created_at FROM news WHERE is_active = 1 ORDER BY created_at DESC',
        [],
        (err: Error | null, rows: any[]) => {
          if (err) {
            console.error('Error fetching news for sitemap:', err);
            resolve([]);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  } catch (error) {
    console.error('Error in getNewsItems:', error);
    return [];
  }
}

async function getMenuItems() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return [];
    }

    return new Promise<any[]>((resolve) => {
      db.all(
        'SELECT id FROM menu_items WHERE is_active = 1 ORDER BY display_order ASC',
        [],
        (err: Error | null, rows: any[]) => {
          if (err) {
            console.error('Error fetching menu items for sitemap:', err);
            resolve([]);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    return [];
  }
}

async function getLocations() {
  try {
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return [];
    }

    return new Promise<any[]>((resolve) => {
      db.all(
        'SELECT id FROM locations WHERE is_active = 1',
        [],
        (err: Error | null, rows: any[]) => {
          if (err) {
            console.error('Error fetching locations for sitemap:', err);
            resolve([]);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  } catch (error) {
    console.error('Error in getLocations:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  const [newsItems, menuItems, locations] = await Promise.all([
    getNewsItems(),
    getMenuItems(),
    getLocations(),
  ]);
  
  const newsUrls: MetadataRoute.Sitemap = newsItems.map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const menuUrls: MetadataRoute.Sitemap = menuItems.map((item) => ({
    url: `${baseUrl}/#item-${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...newsUrls,
    ...menuUrls,
  ];
}
