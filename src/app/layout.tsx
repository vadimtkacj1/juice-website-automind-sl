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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'),
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/images/logo.svg',
        color: '#FF8C00',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: '/',
    title: 'נטורליי מרענן | מיצים טבעיים טריים ומשקאות פרימיום',
    description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות. מוצרים טריים מדי יום ללא חומרים משמרים.',
    siteName: 'נטורליי מרענן',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'נטורליי מרענן - מיצים טבעיים טריים',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'נטורליי מרענן | מיצים טבעיים טריים ומשקאות פרימיום',
    description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות.',
    images: ['/og-image.jpg'],
    creator: '@naturallyrefreshing',
    site: '@naturallyrefreshing',
  },
  alternates: {
    canonical: '/',
    languages: {
      'he-IL': '/',
      'en': '/en',
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
    startupImage: [
      {
        url: '/apple-touch-icon.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
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
        
        {/* Structured Data for SEO */}
        <StructuredData
          type="organization"
          data={{
            name: 'נטורליי מרענן',
            description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות. מוצרים טריים מדי יום מפירות וירקות איכותיים ללא חומרים משמרים.',
            url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
            logo: '/icon-512x512.png',
            sameAs: [
              // Add your social media links here
              // 'https://www.facebook.com/yourpage',
              // 'https://www.instagram.com/yourpage',
            ],
          }}
        />
        
        <StructuredData
          type="website"
          data={{
            name: 'נטורליי מרענן',
            description: 'חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות',
            url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
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
