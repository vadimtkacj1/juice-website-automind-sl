import type { Metadata, Viewport } from 'next';
import './globals.css';
import PageLoader from '@/components/PageLoader';
import GlobalLoader from '@/components/GlobalLoader';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import CookieConsent from '@/components/CookieConsent';
import StructuredData from '@/components/StructuredData';
import { TextModeProvider } from '@/lib/text-mode-context';
import { LoadingProvider } from '@/lib/loading-context';
import CartProviderWrapper from '@/components/CartProviderWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a365d',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: {
    default: 'נטורליי מרענן | מיצים טבעיים טריים ומשקאות פרימיום',
    template: '%s | נטורליי מרענן'
  },
  description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות. מוצרים טריים מדי יום מפירות וירקות איכותיים ללא חומרים משמרים. הזמינו אונליין או בקרו בסניפים שלנו.',
  keywords: [
    'מיצים טבעיים',
    'מיצים טריים',
    'מיצי פירות',
    'מיצי ירקות',
    'סמוזי',
    'סלטי פירות',
    'צלחות בריאות',
    'משקאות בריאות',
    'מיצים אורגניים',
    'מיצים סחוטים טרי',
    'בית מיצים',
    'מיצים בישראל',
    'מיצים אונליין',
    'מזון בריא',
    'תפוזים טריים',
    'מיץ תפוזים'
  ],
  authors: [{ name: 'נטורליי מרענן' }],
  creator: 'נטורליי מרענן',
  publisher: 'נטורליי מרענן',
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    title: 'נטורליי מרענן | מיצים טבעיים טריים ומשקאות פרימיום',
    description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות. מוצרים טריים מדי יום ללא חומרים משמרים.',
    siteName: 'נטורליי מרענן',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'נטורליי מרענן - מיצים טבעיים טריים',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'נטורליי מרענן | מיצים טבעיים טריים ומשקאות פרימיום',
    description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'he-IL': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'food & drink',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'נטורליי מרענן',
  },
  verification: {
    google: 'google-site-verification-code-here',
    yandex: 'yandex-verification-code-here',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* DNS prefetch for critical resources */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Preload critical local fonts */}
        <link 
          rel="preload"
          href="/fonts/Heebo-VariableFont_wght.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        
        {/* Mobile support script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function ensureMobileSupport() {
                  document.addEventListener('touchstart', function(){}, {passive: true});
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', ensureMobileSupport);
                } else {
                  ensureMobileSupport();
                }
              })();
            `
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'נטורליי מרענן',
              alternateName: 'Naturalay Refreshing',
              description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
              logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/images/logo.png`,
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Hebrew', 'English'],
              },
            }),
          }}
        />
        
        {/* LocalBusiness Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
              name: 'נטורליי מרענן',
              image: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/og-image.jpg`,
              priceRange: '$$',
              servesCuisine: ['מיצים טבעיים', 'סמוזי', 'מזון בריא'],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IL',
              },
            }),
          }}
        />
        
        {/* WebSite Schema for search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'נטורליי מרענן',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/menu?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body style={{ fontFamily: 'Heebo, sans-serif' }}>
        <TextModeProvider>
          <LoadingProvider>
            <CartProviderWrapper>
              <GlobalLoader />
              <KeyboardShortcuts />
              <CookieConsent />
              <div id="main-content">
                {children}
              </div>
            </CartProviderWrapper>
          </LoadingProvider>
        </TextModeProvider>
      </body>
    </html>
  );
}
