import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'מגשי פירות מעוצבים וקינוחי פירות לאירועים | טבעי שזה מרענן',
  description: 'עסק משפחתי שמתמחה בעיצוב מגשי פירות מרהיבים, קינוחי פירות טריים ומיצים טבעיים לכל סוגי האירועים - מסיבות, בר/בת מצווה, חתונות, אירועי חברה. משלוחים לכל אזור המרכז.',
  keywords: [
    'מגשי פירות',
    'מגשי פירות מעוצבים',
    'קינוחי פירות',
    'פירות לאירועים',
    'מגשי פירות לאירועים',
    'קינוחים לאירועים',
    'מיצים טבעיים',
    'מגשי פירות לחתונה',
    'מגשי פירות לבר מצווה',
    'מגשי פירות לבת מצווה',
    'עיצוב פירות',
    'מגשי פירות אישיים',
    'שיפודי פירות',
    'כוסות פירות',
    'עסק משפחתי',
    'משלוחי פירות',
    'פירות טריים',
    'מגשי פירות באזור המרכז',
    'קינוחים בריאים',
    'מגשי פירות למסיבה',
  ],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: '/landing',
    title: 'מגשי פירות מעוצבים וקינוחי פירות לאירועים | טבעי שזה מרענן',
    description: 'עסק משפחתי שמתמחה בעיצוב מגשי פירות מרהיבים, קינוחי פירות טריים ומיצים טבעיים לכל סוגי האירועים. משלוחים לכל אזור המרכז.',
    siteName: 'טבעי שזה מרענן',
    images: [
      {
        url: '/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'מגשי פירות מעוצבים - טבעי שזה מרענן',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'מגשי פירות מעוצבים וקינוחי פירות לאירועים | טבעי שזה מרענן',
    description: 'עסק משפחתי שמתמחה בעיצוב מגשי פירות מרהיבים וקינוחי פירות טריים לכל סוגי האירועים.',
    images: ['/images/hero.jpg'],
  },
  alternates: {
    canonical: '/landing',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Local Business Schema for Local SEO */}
      <StructuredData
        type="localBusiness"
        data={{
          '@type': 'FoodEstablishment',
          name: 'טבעי שזה מרענן',
          image: '/images/hero.jpg',
          description: 'עסק משפחתי שמתמחה בעיצוב מגשי פירות מרהיבים, קינוחי פירות טריים ומיצים טבעיים לכל סוגי האירועים',
          telephone: '052-678-0739',
          url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
          priceRange: '$$',
          servesCuisine: 'Healthy Food, Fresh Fruits, Natural Juices',
          menu: '/menu',
          acceptsReservations: true,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'אזור המרכז',
            addressCountry: 'IL',
          },
          geo: {
            '@type': 'GeoCoordinates',
            // Add your actual coordinates here
            // latitude: 32.0853,
            // longitude: 34.7818,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
              ],
              opens: '09:00',
              closes: '20:00',
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Friday',
              opens: '09:00',
              closes: '15:00',
            },
          ],
        }}
      />

      {/* BreadcrumbList Schema for better navigation */}
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            {
              name: 'דף הבית',
              url: '/',
            },
            {
              name: 'מגשי פירות לאירועים',
              url: '/landing',
            },
          ],
        }}
      />

      {children}
    </>
  );
}
