import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-dark mb-4">404</h1>
      <h2 className="text-3xl font-bold text-dark mb-4">
        הדף המבוקש לא נמצא
      </h2>
      <p className="text-lg text-text-gray mb-8 max-w-md">
        ייתכן שהקישור שגוי או שהדף הוסר. נסו לחזור לדף הבית או לתפריט.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft size={18} />
          חזרה לדף הבית
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-bg text-dark rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          לתפריט
        </Link>
      </div>
    </div>
  );
}

