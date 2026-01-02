import type { Metadata, Viewport } from 'next';
import './globals.css';
import PageLoader from '@/components/PageLoader';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { TextModeProvider } from '@/lib/text-mode-context';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7322ff',
};

export const metadata: Metadata = {
  title: 'naturalay refreshing | מיצים טבעיים טריים ומשקאות פרימיום',
  description: 'מיצים טבעיים מפירות וירקות טריים, עיצוב בולט וחוויית קנייה מהנה. הזמינו מיצים טריים, קפה ומשקאות פרימיום אונליין או ביקרו בסניפים שלנו.',
  keywords: ['מיצים טבעיים', 'מיצים טריים', 'מיצי פירות', 'מיצי ירקות', 'משקאות בריאות', 'מיצים אורגניים', 'מיצים סחוטים טרי', 'בית מיצים', 'מיצים בישראל', 'מיצים אונליין'],
  authors: [{ name: 'naturalay refreshing' }],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    title: 'naturalay refreshing | מיצים טבעיים טריים ומשקאות פרימיום',
    description: 'מיצים טבעיים מפירות וירקות טריים, עיצוב בולט וחוויית קנייה מהנה.',
    siteName: 'naturalay refreshing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'naturalay refreshing | מיצים טבעיים טריים ומשקאות פרימיום',
    description: 'מיצים טבעיים מפירות וירקות טריים, עיצוב בולט וחוויית קנייה מהנה.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use Hebrew and RTL for all pages
  const lang = 'he' as 'en' | 'ar' | 'he';
  const dir = 'rtl';

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@700;900&subset=hebrew&display=swap" rel="stylesheet" />
        <link rel="dns-prefetch" href="https://framerusercontent.com" />
        <script src="https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Ensure Sienna works on mobile devices
                function ensureMobileSupport() {
                  // Add viewport meta tag if not present
                  if (!document.querySelector('meta[name="viewport"]')) {
                    var meta = document.createElement('meta');
                    meta.name = 'viewport';
                    meta.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
                    document.getElementsByTagName('head')[0].appendChild(meta);
                  }
                  
                  // Ensure touch events work
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'naturalay refreshing',
              description: 'מיצים טבעיים מפירות וירקות טריים',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
              logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/images/logo.png`,
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Hebrew'],
              },
            }),
          }}
        />
      </head>
      <body>
        <TextModeProvider>
          <PageLoader />
          <KeyboardShortcuts />
          {children}
        </TextModeProvider>
      </body>
    </html>
  );
}

