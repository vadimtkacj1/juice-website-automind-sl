'use client';

import { memo } from 'react';
import { translateToHebrew } from '@/lib/translations';
import MenuItemCard, { MenuItem } from './MenuItemCard';
import styles from '../menu.module.css';

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuCategorySectionProps {
  category: MenuCategory;
  categoryIndex: number;
  onItemClick: (item: MenuItem) => void;
  getDiscountedPrice: (price: number | string, discountPercent: number | string) => number;
}

const MenuCategorySection = memo(function MenuCategorySection({
  category,
  categoryIndex,
  onItemClick,
  getDiscountedPrice,
}: MenuCategorySectionProps) {
  return (
    <section
      key={category.id}
      className={`${styles.categorySection} reveal`}
      style={{ ['--delay' as string]: `${0.1 * categoryIndex}s` }}
    >
      <div className={styles.categoryHeader}>
        <h2 className={styles.categoryTitle}>{translateToHebrew(category.name)}</h2>
        {category.description && (
          <p className={styles.categoryDesc}>{translateToHebrew(category.description)}</p>
        )}
      </div>

      <div className={styles.productsGrid}>
        {category.items.map((item, itemIdx) => (
          <MenuItemCard
            key={item.id}
            item={item}
            categoryId={category.id}
            itemIndex={itemIdx}
            onItemClick={onItemClick}
            getDiscountedPrice={getDiscountedPrice}
          />
        ))}
      </div>
    </section>
  );
}, (prevProps, nextProps) => {
  // Only re-render if category data actually changed
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.items.length === nextProps.category.items.length &&
    prevProps.categoryIndex === nextProps.categoryIndex
  );
});

export default MenuCategorySection;

