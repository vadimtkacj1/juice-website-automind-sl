'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import ProductModal from '@/components/ProductModal';
import HeroSection from '@/components/HeroSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { translateToHebrew } from '@/lib/translations';
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
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const found = data.menu.find((cat: Category) => cat.id === parseInt(categoryId));
        setCategory(found || null);
      } catch (err) {
        console.error("Error loading items:", err);
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) fetchCategory();
  }, [categoryId]);

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

  return (
    <div className={styles.menuPage}>
      <HeroSection
        backgroundImage={category?.image || "https://images.unsplash.com/photo-1628178652615-3974c5d63f03"}
        showFloatingOranges={true}
      >
        <div className={categoryStyles.heroInner}>
          <h1 className={categoryStyles.mainTitle}>{translateToHebrew(category?.name || '')}</h1>
          {category?.description && (
            <p className={categoryStyles.mainSubtitle}>{translateToHebrew(category.description)}</p>
          )}
        </div>
      </HeroSection>

      <Breadcrumbs items={breadcrumbItems} />

      <div className={styles.menuContent}>
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
  );
}