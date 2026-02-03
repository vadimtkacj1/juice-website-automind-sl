'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchMenuWithCache, preloadImages } from '@/lib/client-cache';
import HomeCategoryCard from './components/HomeCategoryCard';
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

        // Use cached data if available, otherwise fetch from API
        const data = await fetchMenuWithCache();
        const menuData: Category[] = data.menu || [];
        setCategories(menuData);

        // --- ИСПРАВЛЕННЫЙ БЛОК ТИПИЗАЦИИ ---
        const categoryImages = menuData
          .map((cat) => cat.image)
          .filter((img): img is string => !!img?.trim());

        const imageUrls: string[] = ['/images/hero.jpg', ...categoryImages];
        preloadImages(imageUrls);
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
    <>
      <div className={styles.homePage}>
        <HeroSection
          backgroundImage="/images/hero.jpg"
          showFloatingOranges={false}
          showOverlay={false}
        >
          <></>
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
              <HomeCategoryCard
                key={category.id}
                category={category}
                styles={styles}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}