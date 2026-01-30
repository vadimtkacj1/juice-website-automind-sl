import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/menu',
          '/menu/*',
          '/news',
          '/news/*',
          '/locations',
          '/contact',
          '/checkout',
          '/privacy',
          '/terms',
          '/images/',
          '/uploads/',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/api/*',
          '/checkout/success',
          '/*.json',
          '/_next/*',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/landing',
          '/menu',
          '/menu/*',
          '/news',
          '/news/*',
          '/locations',
          '/contact',
          '/checkout',
          '/privacy',
          '/terms',
          '/images/',
          '/uploads/',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/api/*',
          '/checkout/success',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/',
          '/uploads/',
        ],
        disallow: ['/admin/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
