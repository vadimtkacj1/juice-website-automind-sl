'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import { useLoading } from '@/lib/loading-context';
import styles from './news.module.css';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setLoading: setGlobalLoading } = useLoading();

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      setGlobalLoading(true);
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      // Filter only active news items
      const activeNews = (data.news || []).filter((item: NewsItem) => item.is_active);
      setNewsItems(activeNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(translateToHebrew('Failed to load news. Please try again later.'));
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text={translateToHebrew('Loading news...')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{translateToHebrew('Error')}</h1>
        <p className="text-lg text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className={styles['news-page-container']}>
      <HeroSection showFloatingOranges={true}>
        <h1 className="hero-title">{translateToHebrew('Latest News & Updates')}</h1>
        <p className="hero-subtitle">
          {translateToHebrew('Stay updated with our latest juice blends, health tips, and company news')}
        </p>
      </HeroSection>

      {/* News Grid */}
      <section className={styles['news-content-section']}>
        <div className={styles.container}>
          {newsItems.length === 0 ? (
            <div className={styles['news-empty']}>
              <h2>{translateToHebrew('No news available')}</h2>
              <p>{translateToHebrew('Check back soon for exciting updates!')}</p>
            </div>
          ) : (
            <div className={styles['news-grid']}>
              {newsItems.map((item) => (
                <article key={item.id} className={styles['news-card']}>
                  <Link href={`/news/${item.id}`} className={styles['news-card-link']}>
                    {item.image && !item.image.includes('framerusercontent.com') && (
                      <div className={styles['news-card-image']}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className={styles['news-card-content']}>
                      <div className={styles['news-card-date']}>
                        <Calendar size={14} />
                        <span>{new Date(item.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <h2 className={styles['news-card-title']}>{item.title}</h2>
                      <p className={styles['news-card-excerpt']}>
                        {item.content.length > 150 
                          ? `${item.content.substring(0, 150)}...` 
                          : item.content}
                      </p>
                      <div className={styles['news-card-footer']}>
                        <span className={styles['news-read-more']}>
                          {translateToHebrew('Read More')} <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

