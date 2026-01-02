'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';

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

  return (
    <section className="news-section">
      <div className="news-container">
        <div className="news-header-section">
          <h2 className="news-title-top">חדשות</h2>
          {newsItems.length > 0 && (
            <Link 
              href="/news" 
              className="news-view-all"
            >
              צפה בכל <ArrowRight size={20} />
            </Link>
          )}
          <h3 className="news-title-bottom">אחרונות</h3>
        </div>
        
        {loading ? (
          <div className="news-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="news-empty">
            <p>אין חדשות זמינות כרגע.</p>
          </div>
        ) : (
          <div className="news-grid">
            {newsItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/news/${item.id}`}
                className="news-card"
              >
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
                    <span>{new Date(item.created_at).toLocaleDateString('he-IL', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <h3 className="news-card-title">
                    {item.title}
                  </h3>
                  <p className="news-card-excerpt">
                    {item.content.length > 120 
                      ? `${item.content.substring(0, 120)}...` 
                      : item.content}
                  </p>
                  <div className="news-card-link">
                    <span>קרא עוד</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {newsItems.length > 0 && (
          <div className="news-view-all-mobile">
            <Link href="/news">
              צפה בכל החדשות <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .news-section {
          background-color: var(--gray-bg);
          border-radius: 40px;
          margin: 20px 16px;
          padding: 100px 40px;
        }

        .news-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .news-header-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
          margin-bottom: 80px;
        }

        .news-title-top {
          font-family: 'Heebo', sans-serif;
          font-size: clamp(60px, 12vw, 175px);
          font-weight: 900;
          color: var(--dark);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .news-view-all {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          transition: all 0.3s var(--spring-ease);
          margin: 10px 0;
        }

        .news-view-all:hover {
          gap: 12px;
          color: var(--dark);
        }

        .news-title-bottom {
          font-family: 'Heebo', sans-serif;
          font-size: clamp(60px, 12vw, 175px);
          font-weight: 900;
          color: var(--dark);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .news-card {
          background: var(--white);
          border-radius: 30px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          box-shadow: 0 12px 40px rgba(29, 26, 64, 0.08);
        }

        .news-card:hover {
          box-shadow: 0 20px 60px rgba(29, 26, 64, 0.15);
        }

        .news-card-image {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
        }


        .news-card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .news-card-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-gray);
        }

        .news-card-title {
          font-family: 'Heebo', sans-serif;
          font-size: 24px;
          font-weight: 900;
          color: var(--dark);
          margin: 0;
          line-height: 1.3;
          transition: color 0.3s ease;
        }

        .news-card:hover .news-card-title {
          color: var(--primary);
        }

        .news-card-excerpt {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-gray);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-card-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 700;
          color: var(--primary);
          margin-top: auto;
        }

        .news-loading,
        .news-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 20px;
          text-align: center;
        }

        .news-empty p {
          font-size: 20px;
          color: var(--text-gray);
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--gray-bg);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .news-view-all-mobile {
          text-align: center;
          margin-top: 40px;
        }

        .news-view-all-mobile a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          transition: all 0.3s var(--spring-ease);
        }

        .news-view-all-mobile a:hover {
          gap: 12px;
          color: var(--dark);
        }

        @media (max-width: 980px) {
          .news-section {
            margin: 16px;
            padding: 60px 24px;
          }

          .news-header-section {
            margin-bottom: 60px;
          }

          .news-title-top,
          .news-title-bottom {
            font-size: clamp(48px, 10vw, 120px);
          }

          .news-view-all {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .news-section {
            margin: 12px;
            padding: 40px 16px;
          }

          .news-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .news-title-top,
          .news-title-bottom {
            font-size: clamp(42px, 9vw, 80px);
          }

          .news-card-image {
            height: 200px;
          }
        }
      `}</style>
    </section>
  );
};

export default NewsSection;
