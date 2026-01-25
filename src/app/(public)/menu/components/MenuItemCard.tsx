'use client';

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
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

  // Parse values once during render
  const price = Number(item.price) || 0;
  const discount = Number(item.discount_percent) || 0;
  const discountedPrice = getDiscountedPrice(price, discount);
  const hasDiscount = discount > 0;

  const handleClick = useCallback(() => {
    onItemClick({ ...item, category_id: item.category_id || categoryId });
  }, [item, categoryId, onItemClick]);

  // Prefetch modal data on hover for faster loading
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
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className={styles.discountBadge}>-{discount}%</div>
      )}

      {/* Image Container */}
      <div className={styles.productImage}>
        {hasValidImage ? (
          <Image
            src={item.image as string}
            alt={translateToHebrew(item.name)}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={imageLoaded ? styles.imageLoaded : ''}
            style={{ objectFit: 'cover' }}
            loading="lazy"
            quality={75}
          />
        ) : (
          <div className={styles.productImagePlaceholder}>
            <ShoppingBag size={40} />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={styles.productInfo}>
        <div className={styles.productText}>
          <h3 className={styles.productName}>{translateToHebrew(item.name)}</h3>
          {item.description && (
            <p className={styles.productDesc}>{translateToHebrew(item.description)}</p>
          )}
        </div>

        <div className={styles.productFooter}>
          {item.categoryVolumes?.length ? (
            <div className={styles.volumesList}>
              {item.categoryVolumes.map((vol, idx) => (
                <div key={idx} className={styles.volumeBadge}>
                  <span className={styles.volumeLabel}>{translateToHebrew(vol.volume)}</span>
                  <span className={styles.volumeSeparator}>•</span>
                  <span className={styles.volumePrice}>₪{discountedPrice.toFixed(0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.priceBadge}>
              {hasDiscount && (
                <span className={styles.priceOld}>₪{price.toFixed(0)}</span>
              )}
              <span className={styles.priceCurrent}>₪{discountedPrice.toFixed(0)}</span>
            </div>
          )}

          <button
            className={styles.addBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label={`Add ${item.name} to cart`}
          >
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.discount_percent === nextProps.item.discount_percent &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.itemIndex === nextProps.itemIndex
  );
});

export default MenuItemCard;