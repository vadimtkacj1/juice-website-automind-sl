'use client';

import styles from './ProductModal.module.css';
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
  return (
    <div className={styles['modal-header']}>
      <h2 className={styles['modal-title']}>{translateToHebrew(name)}</h2>
      {selectedVolume && (
        <p className={styles['modal-subtitle']}>
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #7322ff 0%, #93f3aa 100%)',
            display: 'inline-block'
          }} />
          {translateToHebrew(selectedVolume)}
        </p>
      )}
      <div className={styles['modal-price']}>
        {discountPercent > 0 && (
          <span className={styles['price-old']}>₪{(typeof basePrice === 'number' && !isNaN(basePrice) ? basePrice : 0).toFixed(0)}</span>
        )}
        <span className={styles['price-main']}>₪{(typeof discountedPrice === 'number' && !isNaN(discountedPrice) ? discountedPrice : 0).toFixed(0)}</span>
        {discountPercent > 0 && (
          <span className={styles['discount-tag']}>
            {translateToHebrew('Save')} {discountPercent}%
          </span>
        )}
      </div>
    </div>
  );
}
