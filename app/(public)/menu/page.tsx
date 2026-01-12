'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import ProductModal from '@/components/ProductModal';
import HeroSection from '@/components/HeroSection';
import { translateToHebrew } from '@/lib/translations';
import { useMenuData } from './hooks/useMenuData';
import { useRevealAnimation } from './hooks/useRevealAnimation';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import MenuCategorySection, { MenuCategory } from './components/MenuCategorySection';
import { MenuItem } from './components/MenuItemCard';
import {
  MenuLoadingState,
  MenuErrorState,
  MenuEmptyState,
} from './components/MenuStates';
import LoadMoreTrigger from './components/LoadMoreTrigger';
import styles from './menu.module.css';

export default function MenuPage() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();

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

  function handleAddToCart(
    item: MenuItem & { volume?: string; customIngredients?: any[] }
  ) {
    // Ensure we have numbers (MySQL DECIMAL often returns as strings)
    const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    const numDiscount = typeof item.discount_percent === 'string' 
      ? parseFloat(item.discount_percent) 
      : (item.discount_percent || 0);
    
    const finalPrice =
      numDiscount > 0
        ? numPrice * (1 - numDiscount / 100)
        : numPrice;

    console.log('handleAddToCart in menu page - item:', item);
    console.log('handleAddToCart in menu page - customIngredients:', item.customIngredients);

    addToCart({
      id: item.id,
      name: item.name,
      price: finalPrice,
      image: item.image,
      volume: item.volume,
      customIngredients: item.customIngredients,
    });
    
    // Cart will open automatically via cart context (setIsCartOpen(true) in addToCart)
    // Close the product modal
    setSelectedItem(null);
  }

  function getDiscountedPrice(price: number | string, discountPercent: number | string): number {
    // Ensure we have numbers (MySQL DECIMAL often returns as strings)
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
    const numDiscount = typeof discountPercent === 'string' ? parseFloat(discountPercent) : (discountPercent || 0);
    
    if (numDiscount > 0) {
      return numPrice * (1 - numDiscount / 100);
    }
    return numPrice;
  }

  if (loading && allMenuItems.length === 0) {
    return <MenuLoadingState />;
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
        backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080"
        showFloatingOranges={true}
      >
        <h1 className="hero-title">{translateToHebrew('OUR MENU')}</h1>
      </HeroSection>

      {/* Categories */}
      {displayedMenu.map((category, categoryIdx) => (
        <MenuCategorySection
          key={category.id}
          category={category}
          categoryIndex={categoryIdx}
          onItemClick={setSelectedItem}
          getDiscountedPrice={getDiscountedPrice}
        />
      ))}

      <LoadMoreTrigger observerTarget={observerTarget} hasMore={hasMore} />

      {/* Product Modal */}
      <ProductModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(item) => handleAddToCart(item as MenuItem)}
      />
    </div>
  );
}
