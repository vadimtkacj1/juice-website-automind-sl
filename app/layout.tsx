import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7322ff',
};

export const metadata: Metadata = {
  title: 'Reviva | Fresh Coffee & Premium Beverages',
  description: 'Fresh roasted coffee, bold design, and a playful shopping experience. Order premium coffee, juices, and beverages online or visit our locations.',
  keywords: ['coffee', 'fresh coffee', 'roasted coffee', 'coffee shop', 'beverages', 'juice', 'drinks', 'cafe', 'coffee online'],
  authors: [{ name: 'Reviva' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Reviva | Fresh Coffee & Premium Beverages',
    description: 'Fresh roasted coffee, bold design, and a playful shopping experience.',
    siteName: 'Reviva',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reviva | Fresh Coffee & Premium Beverages',
    description: 'Fresh roasted coffee, bold design, and a playful shopping experience.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Change to 'ar' or 'he' for RTL languages
  const lang = 'en' as 'en' | 'ar' | 'he';
  const dir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://framerusercontent.com" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

