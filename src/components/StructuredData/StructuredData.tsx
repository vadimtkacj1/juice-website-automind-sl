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

interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'product' | 'article' | 'menu' | 'breadcrumb';
  data: OrganizationData | LocalBusinessData | ProductData | ArticleData | MenuData | any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';

    switch (type) {
      case 'organization':
        const orgData = data as OrganizationData;
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: orgData.name,
          description: orgData.description,
          url: orgData.url || baseUrl,
          logo: `${baseUrl}${orgData.logo}`,
          telephone: orgData.telephone,
          email: orgData.email,
          address: orgData.address ? {
            '@type': 'PostalAddress',
            ...orgData.address,
          } : undefined,
          sameAs: orgData.sameAs || [],
        };

      case 'localBusiness':
        const businessData = data as LocalBusinessData;
        return {
          '@context': 'https://schema.org',
          '@type': 'FoodEstablishment',
          '@id': `${baseUrl}/#local-business`,
          name: businessData.name,
          description: businessData.description,
          image: businessData.image,
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
          openingHoursSpecification: businessData.openingHours?.map(hours => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: hours.split(':')[0],
            opens: hours.split(':')[1]?.split('-')[0],
            closes: hours.split(':')[1]?.split('-')[1],
          })),
          priceRange: businessData.priceRange || '₪₪',
          servesCuisine: 'Healthy Juice Bar',
          acceptsReservations: 'False',
        };

      case 'product':
        const productData = data as ProductData;
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: productData.name,
          description: productData.description,
          image: productData.image,
          offers: {
            '@type': 'Offer',
            price: productData.offers.price,
            priceCurrency: productData.offers.priceCurrency,
            availability: `https://schema.org/${productData.offers.availability}`,
            url: productData.offers.url,
          },
          aggregateRating: productData.aggregateRating ? {
            '@type': 'AggregateRating',
            ratingValue: productData.aggregateRating.ratingValue,
            reviewCount: productData.aggregateRating.reviewCount,
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
