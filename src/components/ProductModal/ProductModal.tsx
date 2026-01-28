'use client';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import styles from './styles/ProductModalBase.module.css';
import { CartCustomIngredient } from '@/lib/cart-context';
import { translateToHebrew } from '@/lib/translations';
import { ProductModalItem } from './types';
import { useProductModalLogic } from './useProductModalLogic';
import { useScrollLock } from '../../hooks/useScrollLock';

// Sub-components
import ProductModalHeader from './ProductModalHeader';
import ProductModalImage from './ProductModalImage';
import ProductModalFeatures from './ProductModalFeatures';
import VolumeSelector from './VolumeSelector';
import IngredientsSection from './IngredientsSection';
import AdditionalItemsSection from './AdditionalItemsSection';
import ProductModalFooter from './ProductModalFooter';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProductModalProps {
  item: ProductModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ProductModalItem & { volume?: string, customIngredients?: CartCustomIngredient[] }) => void;
}

export default function ProductModal({ item, isOpen, onClose, onAddToCart }: ProductModalProps) {
  // SSR compatibility: Ensure portal only renders on client
  const [mounted, setMounted] = useState(false);
  const [shouldHighlightMissing, setShouldHighlightMissing] = useState(false);
  const ingredientsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Removed debug logs for performance

  const {
    customIngredients,
    volumeOptions,
    additionalItems,
    selectedVolume,
    setSelectedVolume,
    selectedIngredients,
    selectedAdditionalItems,
    handleIngredientToggle,
    handleAdditionalItemToggle,
    totalPrice,
    handleAddToCartClick,
    currentBasePrice,
    currentDiscountedPrice,
    discountPercent,
    isLoading,
    missingRequiredGroups,
    canAddToCart
  } = useProductModalLogic(item, isOpen, onAddToCart, onClose);

  // Prevent scroll when open
  useScrollLock(isOpen);

  // Handle disabled button click - scroll to first missing group
  const handleDisabledButtonClick = () => {
    if (!canAddToCart && ingredientsSectionRef.current) {
      // Enable highlight animation
      setShouldHighlightMissing(true);

      // Scroll to ingredients section
      ingredientsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Disable highlight after animation
      setTimeout(() => {
        setShouldHighlightMissing(false);
      }, 3000);
    }
  };

  // Keyboard accessibility: Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Don't render if not open, no item, or not mounted (SSR)
  if (!isOpen || !item || !mounted) {
    return null;
  }

  const modalContent = (
    <div className={styles['modal-wrapper']} role="dialog" aria-modal="true">
      {/* Backdrop with fade-in animation potential */}
      <div 
        className={styles['modal-backdrop']} 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={styles['product-modal']}>
        <div className={styles['modal-container']} onClick={(e) => e.stopPropagation()}>
          {/* Close Action */}
          <button 
            className={styles['modal-close']} 
            onClick={onClose}
            aria-label={'סגור'}
          >
            <X size={20} />
          </button>
          
          {/* Main Layout */}
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              height: '400px', 
              width: '100%', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
               <LoadingSpinner size="lg" text={'טוען פרטים...'} />
            </div>
          ) : (
            <>
              <ProductModalImage image={item.image} name={item.name} />

              <div className={styles['modal-content']}>
                <ProductModalHeader
                  name={item.name}
                  selectedVolume={selectedVolume}
                  basePrice={currentBasePrice}
                  discountedPrice={currentDiscountedPrice}
                  discountPercent={discountPercent}
                />

                <div className={styles['modal-description']}>
                  <p>{translateToHebrew(item.description) || 'חוויה של מרכיבים טבעיים.'}</p>
                </div>

                <ProductModalFeatures />

                <VolumeSelector
                  volumeOptions={volumeOptions}
                  selectedVolume={selectedVolume}
                  onVolumeChange={setSelectedVolume}
                  discountPercent={discountPercent}
                />

                <div ref={ingredientsSectionRef}>
                  <IngredientsSection
                    ingredients={customIngredients}
                    selectedIngredients={selectedIngredients}
                    onIngredientToggle={handleIngredientToggle}
                    missingRequiredGroups={missingRequiredGroups}
                    shouldHighlightMissing={shouldHighlightMissing}
                  />
                </div>

                <AdditionalItemsSection
                  additionalItems={additionalItems}
                  selectedItems={selectedAdditionalItems}
                  onToggle={handleAdditionalItemToggle}
                />

                <ProductModalFooter
                  totalPrice={totalPrice}
                  onAddToCart={handleAddToCartClick}
                  canAddToCart={canAddToCart}
                  missingRequiredGroups={missingRequiredGroups}
                  onDisabledClick={handleDisabledButtonClick}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}