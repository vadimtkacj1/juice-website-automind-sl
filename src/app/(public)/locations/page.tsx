import type { Metadata } from 'next';
import LocationsClient from './LocationsClient';

export const metadata: Metadata = {
  title: 'סניפים ומיקומים | מצאו אותנו ליד הבית',
  description: 'מצאו את סניפי נטורליי מרענן הקרובים אליכם. סניפים בכל הארץ עם מיצים טבעיים טריים, שעות פתיחה ופרטי התקשרות.',
  keywords: ['סניפים', 'מיקומים', 'בית מיצים', 'כתובת', 'שעות פתיחה', 'מיצים קרוב אליי'],
  openGraph: {
    title: 'הסניפים שלנו | נטורליי מרענן',
    description: 'מצאו את סניפי נטורליי מרענן הקרובים אליכם',
    type: 'website',
  },
  alternates: {
    canonical: '/locations',
  },
};

export default function LocationsPage() {
  return <LocationsClient />;
}
