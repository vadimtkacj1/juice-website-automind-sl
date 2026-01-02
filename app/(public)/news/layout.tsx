import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest News & Updates | naturalay refreshing',
  description: 'Stay updated with our latest juice blends, health tips, company news, and exciting updates. Discover fresh insights about nutrition, wellness, and premium beverages.',
  keywords: [
    'juice news',
    'health tips',
    'nutrition updates',
    'fresh juice',
    'beverage news',
    'wellness articles',
    'naturalay refreshing news',
    'juice blog',
    'health blog',
  ],
  openGraph: {
    type: 'website',
    title: 'Latest News & Updates | naturalay refreshing',
    description: 'Stay updated with our latest juice blends, health tips, and company news.',
    siteName: 'naturalay refreshing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest News & Updates | naturalay refreshing',
    description: 'Stay updated with our latest juice blends, health tips, and company news.',
  },
  alternates: {
    canonical: '/news',
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

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

