\'use client\';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const { id } = params;
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNewsItem(Number(id));
    }
  }, [id]);

  async function fetchNewsItem(newsId: number) {
    try {
      const response = await fetch(`/api/news/${newsId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('News item not found.');
        } else {
          setError('Failed to fetch news item.');
        }
        setNewsItem(null);
        return;
      }
      const data = await response.json();
      setNewsItem(data.newsItem);
    } catch (err) {
      console.error('Error fetching news item:', err);
      setError('An unexpected error occurred.');
      setNewsItem(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading news item..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700">{error}</p>
        <Link href="/" className="mt-8 inline-flex items-center text-purple-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">News Item Not Found</h1>
        <p className="text-lg text-gray-700">The news item you are looking for does not exist or is not active.</p>
        <Link href="/" className="mt-8 inline-flex items-center text-purple-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:underline mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <article className="bg-white p-6 md:p-10 rounded-lg shadow-lg">
        {newsItem.image && (
          <div className="relative w-full h-80 md:h-96 rounded-md overflow-hidden mb-8">
            <Image src={newsItem.image} alt={newsItem.title} fill style={{ objectFit: 'cover' }} />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          {newsItem.title}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Published on {new Date(newsItem.created_at).toLocaleDateString()}
        </p>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <p>{newsItem.content}</p>
          {/* You might want to parse markdown or rich text here if content supports it */}
        </div>
      </article>
    </div>
  );
}
