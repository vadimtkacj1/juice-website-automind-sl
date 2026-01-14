'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const response = await fetch('/api/news');
      if (!response.ok) return;
      const data = await response.json();
      // Get only active news items, limit to 3 for homepage
      const activeNews = (data.news || [])
        .filter((item: NewsItem) => item.is_active)
        .slice(0, 3);
      setNewsItems(activeNews);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }

  // Don't render the section if there are no news items (after loading)
  if (!loading && newsItems.length === 0) {
    return null;
  }

  return (
    <section className="news-section" aria-labelledby="news-title">
      <div className="news-container">
        <header className="news-header-section">
          <h2 id="news-title" className="news-title-top">חדשות</h2>
          <span className="news-title-bottom">אחרונות</span>
          {newsItems.length > 0 && (
            <Link 
              href="/news" 
              className="news-view-all"
              aria-label="צפה בכל החדשות"
            >
              צפה בכל <ArrowLeft size={20} aria-hidden="true" />
            </Link>
          )}
        </header>
        
        {loading ? (
          <div className="news-loading" role="status" aria-label="טוען חדשות">
            <LoadingSpinner size="lg" text="טוען חדשות..." />
          </div>
        ) : (
          <div className="news-grid" role="list">
            {newsItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/news/${item.id}`}
                className="news-card"
                role="listitem"
              >
                {item.image && !item.image.includes('framerusercontent.com') && (
                  <div className="news-card-image">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="news-card-content">
                  <time className="news-card-date" dateTime={item.created_at}>
                    <Calendar size={14} aria-hidden="true" />
                    <span>{new Date(item.created_at).toLocaleDateString('he-IL', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </time>
                  <h3 className="news-card-title">
                    {item.title}
                  </h3>
                  <p className="news-card-excerpt">
                    {item.content.length > 120 
                      ? `${item.content.substring(0, 120)}...` 
                      : item.content}
                  </p>
                  <span className="news-card-link" aria-hidden="true">
                    <span>קרא עוד</span>
                    <ArrowLeft size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {newsItems.length > 0 && (
          <div className="news-view-all-mobile">
            <Link href="/news" aria-label="צפה בכל החדשות">
              צפה בכל החדשות <ArrowLeft size={20} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;

