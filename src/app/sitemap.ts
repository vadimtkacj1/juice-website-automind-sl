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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  const newsItems = await getNewsItems();
  
  const newsUrls: MetadataRoute.Sitemap = newsItems.map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
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
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...newsUrls,
  ];
}
