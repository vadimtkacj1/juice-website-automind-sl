import type { Metadata } from 'next';
import NewsClient from './NewsClient';

export const metadata: Metadata = {
  title: 'חדשות ועדכונים | טיפים לבריאות ומתכונים חדשים',
  description: 'קראו על חידושי המיצים החדשים שלנו, טיפים לבריאות, מתכונים מומלצים וחדשות מעולם טבעי שזה מרענן.',
  keywords: ['חדשות', 'מתכונים', 'טיפים לבריאות', 'מיצים חדשים', 'עדכונים', 'בלוג מיצים'],
  openGraph: {
    title: 'חדשות ועדכונים | טבעי שזה מרענן',
    description: 'קראו על חידושי המיצים החדשים שלנו וטיפים לבריאות',
    type: 'website',
  },
  alternates: {
    canonical: '/news',
  },
};

export default function NewsPage() {
  return <NewsClient />;
}

