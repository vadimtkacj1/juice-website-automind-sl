'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useCart } from '@/lib/cart-context';
import ProductModal from '@/components/ProductModal';
import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import { useMenuData } from './hooks/useMenuData';
import { useRevealAnimation } from './hooks/useRevealAnimation';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import MenuCategorySection from './components/MenuCategorySection';
import { MenuItem } from './components/MenuItemCard';
import {
  MenuLoadingState,
  MenuErrorState,
  MenuEmptyState,
} from './components/MenuStates';
import LoadingSpinner from '@/components/LoadingSpinner'; 
import styles from './menu.module.css';

const calculateFinalPrice = (price: number | string, discountPercent: number | string): number => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
  const numDiscount = typeof discountPercent === 'string' ? parseFloat(discountPercent) : (discountPercent || 0);
  
  return numDiscount > 0 ? numPrice * (1 - numDiscount / 100) : numPrice;
};

type AddToCartArgs = {
  id: number | string;
  name: string;
  price: number | string;
  image?: string;
  discount_percent?: number | string;
  volume?: string;
  customIngredients?: any[];
};

export default function MenuClient() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();

  // Debug: log when selected item changes
  useEffect(() => {
    console.log('Selected item changed:', selectedItem ? selectedItem.name : 'null');
  }, [selectedItem]);

  const {
    allMenuItems,
    displayedMenu,
    hasMore,
    loading,
    loadingMore,
    error,
    fetchMenu,
    loadMoreItems,
  } = useMenuData();

  const observerTarget = useInfiniteScroll({
    hasMore,
    loadingMore,
    onLoadMore: loadMoreItems,
  });

  useRevealAnimation(!loading && allMenuItems.length > 0);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

const handleAddToCart = useCallback((item: AddToCartArgs) => {
  const numericId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
  
  const finalPrice = calculateFinalPrice(item.price, item.discount_percent || 0);

  if (isNaN(numericId)) {
    console.error("Invalid product ID:", item.id);
    return;
  }

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

  const getDiscountedPrice = useCallback((price: number | string, discount: number | string) => {
    return calculateFinalPrice(price, discount);
  }, []);

  if (loading && allMenuItems.length === 0) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw'
      }}>
        <LoadingSpinner size="lg" text={translateToHebrew('loading delicious menu')} />
      </div>
    );
  }

  if (error) {
    return <MenuErrorState error={error} onRetry={fetchMenu} />;
  }

  if (allMenuItems.length === 0 && !loading) {
    return <MenuEmptyState />;
  }

  return (
    <div className={styles.menuPage}>
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?..."
        showFloatingOranges={true}
      >
        <h1 className="hero-title">{translateToHebrew('OUR MENU')}</h1>
      </HeroSection>

      <div className={styles.menuContent}>
        {displayedMenu.map((category, categoryIdx) => (
          <MenuCategorySection
            key={category.id}
            category={category}
            categoryIndex={categoryIdx}
            onItemClick={setSelectedItem}
            getDiscountedPrice={getDiscountedPrice}
          />
        ))}
      </div>

      <div ref={observerTarget} style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 20px',
        width: '100%'
      }}>
        {loadingMore && (
          <LoadingSpinner size="md" text={translateToHebrew('loading more items')} />
        )}
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
