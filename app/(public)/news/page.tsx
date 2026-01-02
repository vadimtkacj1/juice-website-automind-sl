'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

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

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
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
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading news..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="news-page-container">
      {/* Hero Section */}
      <section className="news-hero">
        <div className="container">
          <h1 className="news-hero-title">Latest News & Updates</h1>
          <p className="news-hero-subtitle">
            Stay updated with our latest juice blends, health tips, and company news
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="news-content-section">
        <div className="container">
          {newsItems.length === 0 ? (
            <div className="news-empty">
              <h2>No news available</h2>
              <p>Check back soon for exciting updates!</p>
            </div>
          ) : (
            <div className="news-grid">
              {newsItems.map((item) => (
                <article key={item.id} className="news-card">
                  <Link href={`/news/${item.id}`} className="news-card-link">
                    {item.image && (
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
                      <div className="news-card-date">
                        <Calendar size={14} />
                        <span>{new Date(item.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <h2 className="news-card-title">{item.title}</h2>
                      <p className="news-card-excerpt">
                        {item.content.length > 150 
                          ? `${item.content.substring(0, 150)}...` 
                          : item.content}
                      </p>
                      <div className="news-card-footer">
                        <span className="news-read-more">
                          Read More <ArrowRight size={16} />
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

      <style jsx>{`
        .news-page-container {
          min-height: 100vh;
          background: var(--white);
        }

        .news-hero {
          background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
          padding: 120px 20px 80px;
          text-align: center;
          color: var(--white);
          margin: 16px;
          border-radius: 40px;
        }

        .news-hero-title {
          font-family: 'Heebo', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 900;
          margin-bottom: 24px;
          line-height: 1.1;
        }

        .news-hero-subtitle {
          font-size: clamp(18px, 3vw, 24px);
          opacity: 0.95;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .news-content-section {
          padding: 80px 20px;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .news-card {
          background: var(--white);
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(29, 26, 64, 0.08);
          transition: all 0.4s var(--spring-ease);
          border: 1px solid rgba(29, 26, 64, 0.05);
        }

        .news-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 60px rgba(29, 26, 64, 0.15);
        }

        .news-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .news-card-image {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: var(--gray-bg);
        }

        .news-card-content {
          padding: 32px;
        }

        .news-card-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-gray);
          margin-bottom: 16px;
          font-weight: 500;
        }

        .news-card-title {
          font-family: 'Heebo', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: var(--dark);
          margin: 0 0 16px 0;
          line-height: 1.3;
        }

        .news-card-excerpt {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-gray);
          margin: 0 0 24px 0;
        }

        .news-card-footer {
          display: flex;
          align-items: center;
        }

        .news-read-more {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-weight: 700;
          font-size: 16px;
          transition: gap 0.3s ease;
        }

        .news-card:hover .news-read-more {
          gap: 12px;
        }

        .news-empty {
          text-align: center;
          padding: 100px 20px;
        }

        .news-empty h2 {
          font-family: 'Heebo', sans-serif;
          font-size: 48px;
          color: var(--dark);
          margin-bottom: 16px;
        }

        .news-empty p {
          font-size: 18px;
          color: var(--text-gray);
        }

        @media (max-width: 980px) {
          .news-hero {
            padding: 80px 20px 60px;
            margin: 12px;
            border-radius: 32px;
          }

          .news-content-section {
            padding: 60px 16px;
          }

          .news-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .news-card-image {
            height: 240px;
          }

          .news-card-content {
            padding: 24px;
          }
        }

        @media (max-width: 640px) {
          .news-hero {
            padding: 60px 16px 40px;
          }

          .news-card-image {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

