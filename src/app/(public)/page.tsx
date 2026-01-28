'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { translateToHebrew } from '@/lib/translations';
import styles from './page.module.css';

interface MenuItem {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  items: MenuItem[];
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu');
        
        if (!response.ok) {
          throw new Error('Failed to fetch menu');
        }
        
        const data = await response.json();
        setCategories(data.menu || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Show spinner while data is loading
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" text="טוען תפריט" />
      </div>
    );
  }

  // Error feedback state
  if (error) {
    return (
      <div className={styles.emptyState}>
        <h2>שגיאה בטעינת התפריט</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?..."
        showFloatingOranges={true}
      >
        <h1 className="hero-title">מיצים טבעיים טריים</h1>
        <p className="hero-subtitle">בחר את הקטגוריה האהובה עליך</p>
      </HeroSection>

      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{'התפריט שלנו'}</h2>
          <p className={styles.sectionDescription}>
            גלה את הקטגוריות הטעימות שלנו
          </p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu/category/${category.id}`}
              className={styles.categoryCard}
            >
              {/* Image Container with Hover Hint */}
              <div className={styles.categoryImageWrapper}>
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={translateToHebrew(category.name)}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={styles.categoryImage}
                    loading="lazy"
                    quality={90}
                  />
                ) : (
                  <div className={styles.categoryImagePlaceholder}>
                    <ShoppingBag size={48} strokeWidth={1.2} />
                  </div>
                )}

                {/* Purple Hover CTA Badge */}
                <div className={styles.hoverHint}>
                  <div className={styles.hintBadge}>
                    <Eye size={18} />
                    <span>צפייה בתפריט</span>
                  </div>
                </div>
              </div>

              {/* Category Name Below Image */}
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryName}>
                  {translateToHebrew(category.name)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}