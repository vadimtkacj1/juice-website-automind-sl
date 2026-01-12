'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import styles from '../menu.module.css';

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number | string; // Can be string from MySQL DECIMAL
  volume?: string;
  image?: string;
  discount_percent: number | string; // Can be string from MySQL DECIMAL
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

export default function MenuItemCard({
  item,
  categoryId,
  itemIndex,
  onItemClick,
  getDiscountedPrice,
}: MenuItemCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    onItemClick({ ...item, category_id: item.category_id || categoryId });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const hasValidImage = item.image && item.image.trim() !== '' && !imageError;

  return (
    <div
      className={`${styles.productCard} reveal`}
      style={{ ['--delay' as string]: `${0.05 * (itemIndex + 1)}s` }}
      onClick={handleClick}
    >
      {/* Discount Badge */}
      {(typeof item.discount_percent === 'number' ? item.discount_percent : parseFloat(String(item.discount_percent)) || 0) > 0 && (
        <div className={styles.discountBadge}>-{typeof item.discount_percent === 'number' ? item.discount_percent : parseFloat(String(item.discount_percent)) || 0}%</div>
      )}

      {/* Image */}
      <div className={styles.productImage}>
        {hasValidImage ? (
          // Используем обычный img для всех изображений (внешних и локальных)
          // Локальные изображения уже оптимизированы через sharp
          <img
            src={item.image}
            alt={translateToHebrew(item.name)}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={imageLoaded ? styles.imageLoaded : ''}
          />
        ) : (
          <div className={styles.productImagePlaceholder}>
            <ShoppingBag size={40} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.productInfo}>
        <div className={styles.productText}>
          <h3 className={styles.productName}>{translateToHebrew(item.name)}</h3>
          {item.description && (
            <p className={styles.productDesc}>{translateToHebrew(item.description)}</p>
          )}
        </div>

        <div className={styles.productFooter}>
          {item.categoryVolumes && item.categoryVolumes.length > 0 ? (
            <div className={styles.volumesList}>
              {item.categoryVolumes.map((vol, volIdx) => {
                const volPrice = getDiscountedPrice(item.price, item.discount_percent);
                const numPrice = typeof volPrice === 'number' ? volPrice : parseFloat(String(volPrice)) || 0;
                return (
                  <div key={volIdx} className={styles.volumeBadge}>
                    <span className={styles.volumeLabel}>{translateToHebrew(vol.volume)}</span>
                    <span className={styles.volumeSeparator}>•</span>
                    <span className={styles.volumePrice}>₪{numPrice.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.priceBadge}>
              {(typeof item.discount_percent === 'number' ? item.discount_percent : parseFloat(String(item.discount_percent)) || 0) > 0 && (
                <span className={styles.priceOld}>₪{
                  (typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0).toFixed(0)
                }</span>
              )}
              <span className={styles.priceCurrent}>
                ₪{getDiscountedPrice(item.price, item.discount_percent).toFixed(0)}
              </span>
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
}

