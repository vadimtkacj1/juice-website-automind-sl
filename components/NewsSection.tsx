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
    <section className="news-section bg-gray-bg rounded-[40px] m-4 md:m-16 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-16">
          <h2 className="section-title text-dark">{translateToHebrew('Latest News')}</h2>
          {newsItems.length > 0 && (
            <Link 
              href="/news" 
              className="news-view-all hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              {translateToHebrew('View All')} <ArrowRight size={20} />
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-gray text-lg">{translateToHebrew('No news available at the moment.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/news/${item.id}`}
                className="news-card bg-white rounded-[30px] shadow-md overflow-hidden relative transition-all duration-300 ease-in-out hover:translate-y-[-10px] hover:shadow-lg group"
              >
                {item.image && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-text-gray text-sm mb-3">
                    <Calendar size={14} />
                    <span>{new Date(item.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-dark group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-text-gray text-base line-clamp-2">
                    {item.content.length > 120 
                      ? `${item.content.substring(0, 120)}...` 
                      : item.content}
                  </p>
                  <div className="mt-4 flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                    <span>{translateToHebrew('Read More')}</span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {newsItems.length > 0 && (
          <div className="text-center mt-12 md:hidden">
            <Link 
              href="/news" 
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              {translateToHebrew('View All News')} <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default NewsSection;
