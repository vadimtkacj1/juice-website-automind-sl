import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-dark mb-4">404</h1>
      <h2 className="text-3xl font-bold text-dark mb-4">News Article Not Found</h2>
      <p className="text-lg text-text-gray mb-8 max-w-md">
        The news article you are looking for does not exist or has been removed.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/news" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft size={18} />
          Back to News
        </Link>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-bg text-dark rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

