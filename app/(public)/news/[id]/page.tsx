import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import styles from './page.module.css';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

async function getNewsItem(id: number): Promise<NewsItem | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // For server-side, we need to use absolute URL or fetch directly from database
    const getDatabase = require('@/lib/database');
    const db = getDatabase();
    
    if (!db) {
      return null;
    }

    return new Promise((resolve) => {
      db.get('SELECT * FROM news WHERE id = ? AND is_active = 1', [id], (err: Error | null, row: any) => {
        if (err || !row) {
          resolve(null);
          return;
        }
        resolve(row);
      });
    });
  } catch (error) {
    console.error('Error fetching news item:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const newsItem = await getNewsItem(Number(params.id));

  if (!newsItem) {
    return {
      title: 'News Not Found | naturalay refreshing',
      description: 'The news article you are looking for could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const url = `${baseUrl}/news/${params.id}`;
  // Filter out framerusercontent.com URLs and invalid images
  const isValidImage = newsItem.image && 
    !newsItem.image.includes('framerusercontent.com') &&
    newsItem.image.trim() !== '';
  const imageUrl = isValidImage
    ? (newsItem.image!.startsWith('http') ? newsItem.image! : `${baseUrl}${newsItem.image}`)
    : `${baseUrl}/images/default-news.jpg`;
  
  const excerpt = newsItem.content.length > 160 
    ? `${newsItem.content.substring(0, 160)}...` 
    : newsItem.content;

  return {
    title: `${newsItem.title} | naturalay refreshing News`,
    description: excerpt,
    keywords: [
      'juice',
      'fresh juice',
      'health',
      'nutrition',
      'beverages',
      'naturalay refreshing',
      'news',
      'updates',
      ...newsItem.title.toLowerCase().split(' '),
    ],
    authors: [{ name: 'naturalay refreshing' }],
    openGraph: {
      type: 'article',
      title: newsItem.title,
      description: excerpt,
      url: url,
      siteName: 'naturalay refreshing',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: newsItem.title,
        },
      ],
      publishedTime: newsItem.created_at,
      modifiedTime: newsItem.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: newsItem.title,
      description: excerpt,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsItem = await getNewsItem(Number(params.id));

  if (!newsItem) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const publishedDate = new Date(newsItem.created_at);
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const readingTime = Math.ceil(newsItem.content.split(' ').length / 200); // Average reading speed: 200 words per minute

  // Format content with proper paragraphs
  // Handle both newline-separated and single paragraph content
  const formattedContent = newsItem.content
    .split(/\n\s*\n|\n/)
    .map(para => para.trim())
    .filter(para => para.length > 0);
  
  // If no paragraphs found, treat entire content as one paragraph
  const displayContent = formattedContent.length > 0 ? formattedContent : [newsItem.content];

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: newsItem.title,
    description: newsItem.content.length > 160 
      ? `${newsItem.content.substring(0, 160)}...` 
      : newsItem.content,
    image: newsItem.image 
      ? (newsItem.image.startsWith('http') ? newsItem.image : `${baseUrl}${newsItem.image}`)
      : undefined,
    datePublished: newsItem.created_at,
    dateModified: newsItem.created_at,
    author: {
      '@type': 'Organization',
      name: 'naturalay refreshing',
    },
    publisher: {
      '@type': 'Organization',
      name: 'naturalay refreshing',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/news/${params.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className={styles.newsArticlePage}>
        <div className={styles.newsArticleContainer}>
          <Link href="/news" className={styles.newsArticleBackLink}>
            <ArrowLeft size={18} />
            <span>Back to News</span>
          </Link>

          <article className={styles.newsArticle} itemScope itemType="https://schema.org/NewsArticle">
            {/* Article Header */}
            <header className={styles.newsArticleHeader}>
              <div className={styles.newsArticleMeta}>
                <time 
                  dateTime={newsItem.created_at} 
                  itemProp="datePublished"
                  className={styles.newsArticleDate}
                >
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </time>
                <div className={styles.newsArticleReadingTime}>
                  <Clock size={16} />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              <h1 className={styles.newsArticleTitle} itemProp="headline">
                {newsItem.title}
              </h1>

              {newsItem.image && !newsItem.image.includes('framerusercontent.com') && (
                <div className={styles.newsArticleFeaturedImage}>
                  <Image
                    src={newsItem.image}
                    alt={newsItem.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    priority
                    itemProp="image"
                  />
                </div>
              )}
            </header>

            {/* Article Body */}
            <div className={styles.newsArticleBody} itemProp="articleBody">
              {displayContent.map((paragraph, index) => (
                <p key={index} className={styles.newsArticleParagraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Article Footer */}
            <footer className={styles.newsArticleFooter}>
              <div className={styles.newsArticleShare}>
                <span className={styles.newsArticleShareLabel}>Share this article:</span>
                <div className={styles.newsArticleShareButtons}>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(newsItem.title)}&url=${encodeURIComponent(`${baseUrl}/news/${params.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.newsArticleShareButton}
                    aria-label="Share on Twitter"
                  >
                    Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/news/${params.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.newsArticleShareButton}
                    aria-label="Share on Facebook"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/news/${params.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.newsArticleShareButton}
                    aria-label="Share on LinkedIn"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}
