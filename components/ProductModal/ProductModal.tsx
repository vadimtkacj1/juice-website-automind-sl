'use client';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from '../ProductModal.module.css';
import { CartCustomIngredient } from '@/lib/cart-context';
import ProductModalHeader from './ProductModalHeader';
import ProductModalImage from './ProductModalImage';
import ProductModalFeatures from './ProductModalFeatures';
import VolumeSelector from './VolumeSelector';
import IngredientsSection from './IngredientsSection';
import AdditionalItemsSection from './AdditionalItemsSection';
import ProductModalFooter from './ProductModalFooter';
import { useProductModalLogic } from './useProductModalLogic';
import { useScrollLock } from '../../hooks/useScrollLock';
import { translateToHebrew } from '@/lib/translations';
import { ProductModalItem } from './types';
import { useEffect } from 'react';

interface ProductModalProps {
  item: ProductModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ProductModalItem & { volume?: string, customIngredients?: CartCustomIngredient[] }) => void;
}

export default function ProductModal({ item, isOpen, onClose, onAddToCart }: ProductModalProps) {
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
    discountPercent
  } = useProductModalLogic(item, isOpen, onAddToCart, onClose);

  // Prevent body scroll when modal is open
  useScrollLock(isOpen);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !item) {
    return null;
  }

  // Render modal content
  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className={styles['modal-backdrop']} 
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className={styles['product-modal']}>
        <div className={styles['modal-container']} onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button 
            className={styles['modal-close']} 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          {/* Image - Right Side */}
          <ProductModalImage image={item.image} name={item.name} />

          {/* Content - Left Side */}
          <div className={styles['modal-content']}>
            {/* Header */}
            <ProductModalHeader
              name={item.name}
              selectedVolume={selectedVolume}
              basePrice={currentBasePrice}
              discountedPrice={currentDiscountedPrice}
              discountPercent={discountPercent}
            />

            {/* Description */}
            <div className={styles['modal-description']}>
              <p>
                {translateToHebrew(item.description) || 
                  translateToHebrew('Experience the perfect blend of quality and taste. Made with care using only the finest natural ingredients to bring you an exceptional experience.')}
              </p>
            </div>

            {/* Features */}
            <ProductModalFeatures />

            {/* Volume Selection */}
            <VolumeSelector
              volumeOptions={volumeOptions}
              selectedVolume={selectedVolume}
              onVolumeChange={setSelectedVolume}
              discountPercent={discountPercent}
            />

            {/* Custom Ingredients */}
            <IngredientsSection
              ingredients={customIngredients}
              selectedIngredients={selectedIngredients}
              onIngredientToggle={handleIngredientToggle}
            />

            {/* Additional Items */}
            <AdditionalItemsSection
              additionalItems={additionalItems}
              selectedItems={selectedAdditionalItems}
              onToggle={handleAdditionalItemToggle}
            />

            {/* Footer */}
            <ProductModalFooter
              totalPrice={totalPrice}
              onAddToCart={handleAddToCartClick}
            />
          </div>
        </div>
      </div>
    </>
  );

  // Use Portal to render modal directly in body, bypassing any parent containers
  if (typeof window !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  // Fallback for SSR
  return null;
}
