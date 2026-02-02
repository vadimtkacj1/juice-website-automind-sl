'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import { translateToHebrew } from '@/lib/translations';
import { fetchMenuWithCache, preloadImages } from '@/lib/client-cache';
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
  const [imagesLoading, setImagesLoading] = useState(true);
  const loadedImagesCount = useRef(0);
  const totalImagesCount = useRef(0);

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
        // ------------------------------------

        // Count total images to load (categories with images + hero image)
        totalImagesCount.current = categoryImages.length + 1; // +1 for hero image

        // If no images to load, hide spinner immediately
        if (totalImagesCount.current <= 1 && !categoryImages.length) {
          setImagesLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageLoad = () => {
    loadedImagesCount.current += 1;
    if (loadedImagesCount.current >= totalImagesCount.current) {
      setImagesLoading(false);
    }
  };

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
      {/* Full-screen spinner while images are loading */}
      {imagesLoading && <LoadingSpinner fullPage size="lg" text="טוען תמונות..." />}

      <div className={styles.homePage} style={{ visibility: imagesLoading ? 'hidden' : 'visible' }}>
        <HeroSection
          backgroundImage="/images/hero.jpg"
          showFloatingOranges={false}
          showOverlay={false}
        >
          <></>
        </HeroSection>

        {/* Hidden hero image to track loading */}
        <img
          src="/images/hero.jpg"
          alt="Hero"
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
        />

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
                {/* Image Container */}
                <div className={styles.categoryImageWrapper}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={translateToHebrew(category.name)}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className={styles.categoryImage}
                      loading="eager"
                      quality={90}
                      onLoad={handleImageLoad}
                      onError={handleImageLoad}
                      priority
                    />
                  ) : (
                    <div className={styles.categoryImagePlaceholder}>
                      <ShoppingBag size={48} strokeWidth={1.2} />
                    </div>
                  )}
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
    </>
  );
}