import styles from '../ProductModal.module.css';
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
        <p className={styles['modal-subtitle']}>{translateToHebrew(selectedVolume)}</p>
      )}
      <div className={styles['modal-price']}>
        {discountPercent > 0 && (
          <span className={styles['price-old']}>₪{basePrice.toFixed(0)}</span>
        )}
        <span className={styles['price-main']}>₪{discountedPrice.toFixed(0)}</span>
        {discountPercent > 0 && (
          <span className={styles['discount-tag']}>-{discountPercent}%</span>
        )}
      </div>
    </div>
  );
}

