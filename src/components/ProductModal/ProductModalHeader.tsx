'use client';

import styles from './styles/ProductModalHeader.module.css';
import { translateToHebrew } from '@/lib/translations';

interface ProductModalHeaderProps {
  name: string;
  selectedVolume?: string | null;
  basePrice: number;
  discountedPrice: number;
  discountPercent: number;
}

export default function ProductModalHeader({
  name,
  selectedVolume,
  basePrice,
  discountedPrice,
  discountPercent,
}: ProductModalHeaderProps) {
  // Форматуємо ціну один раз
  const formatPrice = (val: number) => `₪${(val || 0).toFixed(0)}`;

  return (
    <div className={styles['modal-header']}>
      <h2 className={styles['modal-title']}>{translateToHebrew(name)}</h2>
      
      {selectedVolume && (
        <p className={styles['modal-subtitle']}>
          <span className={styles['status-dot']} />
          {translateToHebrew(selectedVolume)}
        </p>
      )}

      <div className={styles['modal-price']}>
        {discountPercent > 0 && (
          <span className={styles['price-old']}>{formatPrice(basePrice)}</span>
        )}
        <span className={styles['price-main']}>{formatPrice(discountedPrice)}</span>
        
        {discountPercent > 0 && (
          <span className={styles['discount-tag']}>
            {'שמור'} {discountPercent}%
          </span>
        )}
      </div>
    </div>
  );
}