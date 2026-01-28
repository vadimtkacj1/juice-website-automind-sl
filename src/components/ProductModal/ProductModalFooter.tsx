'use client';

import { ShoppingCart, AlertCircle } from 'lucide-react';
import styles from './styles/ProductModalFooter.module.css';
import { cn } from '@/lib/utils';

interface ProductModalFooterProps {
  totalPrice: number;
  onAddToCart: () => void;
  canAddToCart: boolean;
  missingRequiredGroups: string[];
  onDisabledClick?: () => void;
}

export default function ProductModalFooter({
  totalPrice,
  onAddToCart,
  canAddToCart,
  missingRequiredGroups,
  onDisabledClick,
}: ProductModalFooterProps) {
  return (
    <footer className={styles['footer-container']}>
      <div className={styles['modal-total']}>
        <span className={styles['total-label']}>{'סה'}:</span>
        <span className={styles['total-price']}>₪{totalPrice}</span>
      </div>

      {!canAddToCart && missingRequiredGroups.length > 0 && (
        <div className={styles['warning-box']} dir="rtl">
          <AlertCircle size={18} className="text-red-600" />
          <p>
            חובה לבחור: {missingRequiredGroups.join(', ')}
          </p>
        </div>
      )}

      <button
        className={cn(styles['modal-add-btn'], !canAddToCart && styles['is-disabled'])}
        onClick={canAddToCart ? onAddToCart : onDisabledClick}
        aria-disabled={!canAddToCart}
      >
        <ShoppingCart size={22} />
        <span>{'הוסף לעגלה'}</span>
      </button>
    </footer>
  );
}