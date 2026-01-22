import type { Metadata } from 'next';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: 'תפריט | מיצים טבעיים, סמוזי וסלטי פירות',
  description: 'גלו את מגוון המיצים הטבעיים, הסמוזי הבריאים וסלטי הפירות הטריים שלנו. מוצרים טריים מדי יום מפירות וירקות איכותיים. הזמינו אונליין עכשיו!',
  keywords: ['תפריט מיצים', 'מיצים טבעיים', 'סמוזי', 'סלטי פירות', 'משקאות בריאות', 'הזמנה אונליין'],
  openGraph: {
    title: 'תפריט המיצים שלנו | נטורליי מרענן',
    description: 'גלו את מגוון המיצים הטבעיים, הסמוזי הבריאים וסלטי הפירות הטריים שלנו',
    type: 'website',
    images: ['/og-menu.jpg'],
  },
  alternates: {
    canonical: '/menu',
  },
};

export default function MenuPage() {
  return <MenuClient />;
}