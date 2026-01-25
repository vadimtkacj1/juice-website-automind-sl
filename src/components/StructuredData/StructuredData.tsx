import Script from 'next/script';

interface OrganizationData {
  name: string;
  description: string;
  url: string;
  logo: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

interface LocalBusinessData {
  name: string;
  description: string;
  image: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHours?: string[];
  priceRange?: string;
}

interface ProductData {
  name: string;
  description: string;
  image: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ArticleData {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
}

interface MenuData {
  name: string;
  description: string;
  hasMenuSection: Array<{
    name: string;
    hasMenuItem: Array<{
      name: string;
      description?: string;
      offers: {
        price: number;
        priceCurrency: string;
      };
      image?: string;
    }>;
  }>;
}

interface WebSiteData {
  name: string;
  description: string;
  url: string;
}

interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'product' | 'article' | 'menu' | 'breadcrumb' | 'website';
  data: OrganizationData | LocalBusinessData | ProductData | ArticleData | MenuData | WebSiteData | any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';

    switch (type) {
      case 'organization':
        const orgData = data as OrganizationData;
        return {
          '@context': 'https://schema.org',
          '@type': ['Organization', 'FoodEstablishment'],
          '@id': `${baseUrl}/#organization`,
          name: orgData.name,
          description: orgData.description,
          url: orgData.url || baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}${orgData.logo}`,
            width: 512,
            height: 512,
          },
          image: {
            '@type': 'ImageObject',
            url: `${baseUrl}/og-image.jpg`,
            width: 1200,
            height: 630,
          },
          telephone: orgData.telephone,
          email: orgData.email,
          address: orgData.address ? {
            '@type': 'PostalAddress',
            ...orgData.address,
          } : undefined,
          sameAs: orgData.sameAs || [],
          servesCuisine: ['Juice Bar', 'Healthy Food', 'Smoothies', 'Fresh Juices'],
          priceRange: '₪₪',
          paymentAccepted: ['Cash', 'Credit Card', 'Online Payment'],
          currenciesAccepted: 'ILS',
        };

      case 'localBusiness':
        const businessData = data as LocalBusinessData;
        return {
          '@context': 'https://schema.org',
          '@type': 'FoodEstablishment',
          '@id': `${baseUrl}/locations/#${businessData.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: businessData.name,
          description: businessData.description,
          image: [businessData.image, `${baseUrl}/og-image.jpg`],
          address: {
            '@type': 'PostalAddress',
            ...businessData.address,
          },
          geo: businessData.geo ? {
            '@type': 'GeoCoordinates',
            latitude: businessData.geo.latitude,
            longitude: businessData.geo.longitude,
          } : undefined,
          telephone: businessData.telephone,
          url: `${baseUrl}/locations`,
          openingHoursSpecification: businessData.openingHours?.map(hours => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: hours.split(':')[0],
            opens: hours.split(':')[1]?.split('-')[0],
            closes: hours.split(':')[1]?.split('-')[1],
          })),
          priceRange: businessData.priceRange || '₪₪',
          servesCuisine: ['Juice Bar', 'Healthy Food', 'Smoothies', 'Fresh Juices'],
          acceptsReservations: 'False',
          paymentAccepted: ['Cash', 'Credit Card', 'Online Payment'],
          currenciesAccepted: 'ILS',
          hasMenu: `${baseUrl}/menu`,
        };

      case 'product':
        const productData = data as ProductData;
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${productData.offers.url}#product`,
          name: productData.name,
          description: productData.description,
          image: productData.image,
          category: 'Food & Beverages',
          brand: {
            '@type': 'Brand',
            name: 'טבעי שזה מרענן',
          },
          offers: {
            '@type': 'Offer',
            price: productData.offers.price,
            priceCurrency: productData.offers.priceCurrency,
            availability: `https://schema.org/${productData.offers.availability}`,
            url: productData.offers.url,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            seller: {
              '@type': 'Organization',
              '@id': `${baseUrl}/#organization`,
              name: 'טבעי שזה מרענן',
            },
          },
          aggregateRating: productData.aggregateRating ? {
            '@type': 'AggregateRating',
            ratingValue: productData.aggregateRating.ratingValue,
            reviewCount: productData.aggregateRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          } : undefined,
        };

      case 'article':
        const articleData = data as ArticleData;
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: articleData.headline,
          description: articleData.description,
          image: articleData.image,
          datePublished: articleData.datePublished,
          dateModified: articleData.dateModified || articleData.datePublished,
          author: {
            '@type': 'Person',
            name: articleData.author.name,
          },
          publisher: {
            '@type': 'Organization',
            name: articleData.publisher.name,
            logo: {
              '@type': 'ImageObject',
              url: articleData.publisher.logo,
            },
          },
        };

      case 'menu':
        const menuData = data as MenuData;
        return {
          '@context': 'https://schema.org',
          '@type': 'Menu',
          name: menuData.name,
          description: menuData.description,
          hasMenuSection: menuData.hasMenuSection.map(section => ({
            '@type': 'MenuSection',
            name: section.name,
            hasMenuItem: section.hasMenuItem.map(item => ({
              '@type': 'MenuItem',
              name: item.name,
              description: item.description,
              offers: {
                '@type': 'Offer',
                price: item.offers.price,
                priceCurrency: item.offers.priceCurrency,
              },
              image: item.image,
            })),
          })),
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
          })),
        };

      case 'website':
        const websiteData = data as WebSiteData;
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: websiteData.name,
          description: websiteData.description,
          url: websiteData.url || baseUrl,
          potentialAction: [
            {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/menu?search={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
            {
              '@type': 'OrderAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/menu`,
                actionPlatform: [
                  'http://schema.org/DesktopWebPlatform',
                  'http://schema.org/MobileWebPlatform',
                ],
              },
            },
          ],
          publisher: {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            name: websiteData.name,
          },
          inLanguage: 'he',
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="afterInteractive"
    />
  );
}
