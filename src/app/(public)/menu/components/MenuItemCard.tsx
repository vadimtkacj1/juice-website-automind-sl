'use client';

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { ShoppingBag, Plus } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import { prefetchModalData } from '@/components/ProductModal/useProductModalData';
import styles from '../menu.module.css';

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number | string;
  volume?: string;
  image?: string;
  discount_percent: number | string;
  is_available: boolean;
  categoryVolumes?: Array<{ volume: string; is_default: boolean; sort_order: number }>;
}

interface MenuItemCardProps {
  item: MenuItem;
  categoryId: number;
  itemIndex: number;
  onItemClick: (item: MenuItem) => void;
  getDiscountedPrice: (price: number | string, discountPercent: number | string) => number;
}

const MenuItemCard = memo(function MenuItemCard({
  item,
  categoryId,
  itemIndex,
  onItemClick,
  getDiscountedPrice,
}: MenuItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Parse price and discount
  const price = Number(item.price) || 0;
  const discount = Number(item.discount_percent) || 0;
  const discountedPrice = getDiscountedPrice(price, discount);
  const hasDiscount = discount > 0;

  // Handle clicks for the modal
  const handleClick = useCallback(() => {
    onItemClick({ ...item, category_id: item.category_id || categoryId });
  }, [item, categoryId, onItemClick]);

  // Performance: Prefetch modal data when user hovers
  const handleMouseEnter = useCallback(() => {
    prefetchModalData(item.id);
  }, [item.id]);

  const hasValidImage = item.image?.trim() && !imageError;

  return (
    <div
      className={`${styles.productCard} reveal`}
      style={{ ['--delay' as string]: `${0.05 * (itemIndex + 1)}s` }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Discount Badge - Purple Style */}
      {hasDiscount && (
        <div className={styles.discountBadge}>
          {'שמור'} {discount}%
        </div>
      )}

      {/* Image Container with Fixed Aspect Ratio */}
      <div className={styles.productImageWrapper}>
        {hasValidImage ? (
          <Image
            src={item.image as string}
            alt={translateToHebrew(item.name)}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`${styles.image} ${imageLoaded ? styles.imageLoaded : ''}`}
            loading="lazy"
            quality={85}
          />
        ) : (
          <div className={styles.productImagePlaceholder}>
            <ShoppingBag size={42} strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className={styles.productInfo}>
        <div className={styles.productText}>
          <h3 className={styles.productName}>{translateToHebrew(item.name)}</h3>
          {item.description && (
            <p className={styles.productDesc}>{translateToHebrew(item.description)}</p>
          )}
        </div>

        {/* Footer: Prices and Add Button */}
        <div className={styles.productFooter}>
          <div className={styles.priceSection}>
            {hasDiscount && (
              <span className={styles.priceOld}>₪{price.toFixed(0)}</span>
            )}
            <span className={styles.priceCurrent}>₪{discountedPrice.toFixed(0)}</span>
          </div>

          <button
            className={styles.addBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label="הוסף לעגלה"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.discount_percent === nextProps.item.discount_percent &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.itemIndex === nextProps.itemIndex
  );
});

export default MenuItemCard;