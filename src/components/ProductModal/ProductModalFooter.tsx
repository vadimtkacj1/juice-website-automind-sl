'use client';

import { ShoppingCart, AlertCircle } from 'lucide-react';
import styles from './styles/ProductModalFooter.module.css';
import { translateToHebrew } from '@/lib/translations';
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
    <>
      {/* Total Price Display Section */}
      <div className={styles['modal-total']}>
        <span className={styles['total-label']}>
          {translateToHebrew('Total')}:
        </span>
        <span className={styles['total-price']}>₪{Number(totalPrice)}</span>
      </div>

      {/* Validation Warning: 
          Displays only if the item cannot be added to cart AND there are missing selections.
          Uses a red background and slide-in animation for visibility.
      */}
      {!canAddToCart && missingRequiredGroups.length > 0 && (
        <div
          className="flex items-center gap-2 p-3 mb-3 bg-red-50 border-2 border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300"
          dir="rtl"
        >
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">
            {translateToHebrew('Must select')}: {missingRequiredGroups.map(g => translateToHebrew(g)).join(', ')}
          </p>
        </div>
      )}

      {/* Main Action Button:
          Applies 'opacity-50' and disables interaction if 'canAddToCart' is false.
          Triggers 'onDisabledClick' (usually a shake effect or toast) when clicked while disabled.
      */}
      <button
        className={cn(
          styles['modal-add-btn'],
          !canAddToCart && 'opacity-50 cursor-not-allowed'
        )}
        onClick={canAddToCart ? onAddToCart : onDisabledClick}
        disabled={!canAddToCart}
      >
        <ShoppingCart size={22} />
        <span>{translateToHebrew('Add to Cart')}</span>
      </button>
    </>
  );
}