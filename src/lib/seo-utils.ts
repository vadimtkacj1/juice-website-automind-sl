/**
 * SEO Utility Functions
 * Helper functions for generating SEO-friendly content
 */

/**
 * Generate page title with proper formatting
 */
export function generatePageTitle(title: string, includeSiteName: boolean = true): string {
  const siteName = 'טבעי שזה מרענן';
  return includeSiteName ? `${title} | ${siteName}` : title;
}

/**
 * Truncate description to optimal length for meta tags
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOgImageUrl(imagePath?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const defaultImage = '/og-image.jpg';
  const image = imagePath || defaultImage;
  
  return image.startsWith('http') ? image : `${baseUrl}${image}`;
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  // Remove common Hebrew stop words
  const stopWords = ['של', 'את', 'על', 'עם', 'אל', 'זה', 'היא', 'הוא', 'כל', 'או', 'גם', 'אם'];
  
  const words = text
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-zA-Z\s]/g, '') // Keep Hebrew and English letters
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Count word frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Generate breadcrumb schema data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate FAQ schema data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article schema data
 */
export function generateArticleSchema(article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: generateOgImageUrl(article.image),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'טבעי שזה מרענן',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
  };
}

/**
 * Generate Product schema data
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: generateOgImageUrl(product.image),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'ILS',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: baseUrl,
    },
    ...(product.ratingValue && product.reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingValue,
        reviewCount: product.reviewCount,
      },
    } : {}),
  };
}

/**
 * Sanitize HTML for meta descriptions
 */
export function sanitizeForMeta(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(url: string, options?: {
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}) {
  return {
    url: generateCanonicalUrl(url),
    lastModified: options?.lastModified || new Date(),
    changeFrequency: options?.changeFrequency || 'weekly',
    priority: options?.priority !== undefined ? options.priority : 0.5,
  };
}

/**
 * Check if URL should be indexed
 */
export function shouldIndexUrl(url: string): boolean {
  const noIndexPatterns = [
    '/admin',
    '/api',
    '/checkout/success',
    '/_next',
    '/static',
  ];
  
  return !noIndexPatterns.some(pattern => url.startsWith(pattern));
}
