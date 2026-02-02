'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import ProductModal from '@/components/ProductModal';
import HeroSection from '@/components/HeroSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import Breadcrumbs from '@/components/Breadcrumbs';
import FloatingFruits from '@/components/FloatingFruits';
import { translateToHebrew } from '@/lib/translations';
import { fetchMenuWithCache, preloadImages } from '@/lib/client-cache';
import MenuItemCard, { MenuItem } from '../../components/MenuItemCard';
import styles from '../../menu.module.css';
import categoryStyles from './category.module.css';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  items: MenuItem[];
}

const calculateFinalPrice = (price: number | string, discountPercent: number | string): number => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
  const numDiscount = typeof discountPercent === 'string' ? parseFloat(discountPercent) : (discountPercent || 0);
  return numDiscount > 0 ? numPrice * (1 - numDiscount / 100) : numPrice;
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [imagesLoading, setImagesLoading] = useState(true);
  const { addToCart } = useCart();

  const loadedImagesCount = useRef(0);
  const totalImagesCount = useRef(0);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        // Use cached data if available
        const data = await fetchMenuWithCache();
        const found = data.menu.find((cat: Category) => cat.id === parseInt(categoryId));
        setCategory(found || null);

        // Preload images in the background for faster loading
        if (found) {
          const heroImage = found.image || "https://images.unsplash.com/photo-1628178652615-3974c5d63f03";
          const imageUrls = [
            heroImage,
            ...found.items?.filter((item: MenuItem) => item.image?.trim()).map((item: MenuItem) => item.image) || []
          ];
          preloadImages(imageUrls);

          // Count total images to load (hero image + menu item images)
          const itemImagesWithUrl = found.items?.filter((item: MenuItem) => item.image?.trim()).length || 0;
          totalImagesCount.current = itemImagesWithUrl + 1; // +1 for hero image

          // If no images to load, hide spinner immediately
          if (totalImagesCount.current === 1) { // Only hero image
            setImagesLoading(false);
          }
        } else {
          setImagesLoading(false);
        }
      } catch (err) {
        console.error("Error loading items:", err);
        setImagesLoading(false);
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) fetchCategory();
  }, [categoryId]);

  const handleImageLoad = () => {
    loadedImagesCount.current += 1;
    if (loadedImagesCount.current >= totalImagesCount.current) {
      setImagesLoading(false);
    }
  };

  const handleAddToCart = useCallback((item: any) => {
    const numericId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
    const finalPrice = calculateFinalPrice(item.price, item.discount_percent || 0);
    addToCart({
      id: numericId,
      name: item.name,
      price: finalPrice,
      image: item.image,
      volume: item.volume,
      customIngredients: item.customIngredients,
    });
    setSelectedItem(null);
  }, [addToCart]);

  if (loading) return (
    <div className={categoryStyles.loaderWrapper}>
      <LoadingSpinner size="lg" text={'loading category'} />
    </div>
  );

  const breadcrumbItems = [
    { label: translateToHebrew('home'), href: '/' },
    { label: translateToHebrew(category?.name || ''), href: `/menu/category/${categoryId}` }
  ];

  const heroImage = category?.image || "https://images.unsplash.com/photo-1628178652615-3974c5d63f03";

  return (
    <>
      {/* Full-screen spinner while images are loading */}
      {imagesLoading && <LoadingSpinner fullPage size="lg" text="טוען תמונות..." />}

      <div className={styles.menuPage} style={{ visibility: imagesLoading ? 'hidden' : 'visible' }}>
        <HeroSection
          backgroundImage={heroImage}
          showFloatingOranges={false}
          showOverlay={false}
        >
          <div className={categoryStyles.heroInner}>
            <h1 className={categoryStyles.mainTitle}>{translateToHebrew(category?.name || '')}</h1>
            {category?.description && (
              <p className={categoryStyles.mainSubtitle}>{translateToHebrew(category.description)}</p>
            )}
          </div>
        </HeroSection>

        {/* Hidden hero image to track loading */}
        <img
          src={heroImage}
          alt="Hero"
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={handleImageLoad}
        />

        <div className={styles.menuContent}>
          <Breadcrumbs items={breadcrumbItems} />
          <FloatingFruits />
          <div className={styles.categorySection}>
            {category?.items && category.items.length > 0 ? (
              <div className={categoryStyles.strictGrid}>
                {category.items.map((item, idx) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    categoryId={category.id}
                    itemIndex={idx}
                    onItemClick={setSelectedItem}
                    getDiscountedPrice={(p, d) => calculateFinalPrice(p, d)}
                    onImageLoad={handleImageLoad}
                  />
                ))}
              </div>
            ) : (
              <div className={categoryStyles.noData}>
                <h3>אין פריטים זמינים</h3>
              </div>
            )}
          </div>
        </div>

        <ProductModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      </div>
    </>
  );
}