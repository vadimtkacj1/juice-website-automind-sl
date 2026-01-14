'use client';

import { ShoppingCart, Check } from 'lucide-react';
import styles from '../ProductModal.module.css';
import { translateToHebrew } from '@/lib/translations';

interface ProductModalFooterProps {
  totalPrice: number;
  onAddToCart: () => void;
}

export default function ProductModalFooter({
  totalPrice,
  onAddToCart,
}: ProductModalFooterProps) {
  return (
    <>
      {/* Total Price */}
      <div className={styles['modal-total']}>
        <span className={styles['total-label']}>
          {translateToHebrew('Total')}:
        </span>
        <span className={styles['total-price']}>₪{Number(totalPrice)}</span>
      </div>

      {/* Add to Cart Button */}
      <button 
        className={styles['modal-add-btn']}
        onClick={onAddToCart}
      >
        <ShoppingCart size={22} />
        <span>{translateToHebrew('Add to Cart')}</span>
      </button>
    </>
  );
}
