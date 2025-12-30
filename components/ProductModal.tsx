'use client';

import { X, Truck, Award, Leaf, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import styles from './ProductModal.module.css';

interface ProductModalItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  volume?: string;
  image?: string;
  discount_percent: number;
  [key: string]: any;
}

interface ProductModalProps {
  item: ProductModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ProductModalItem) => void;
}

export default function ProductModal({ item, isOpen, onClose, onAddToCart }: ProductModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const discountedPrice = item.discount_percent > 0 
    ? item.price * (1 - item.discount_percent / 100) 
    : item.price;

  return (
    <>
      {/* Backdrop */}
      <div className={styles['modal-backdrop']} onClick={onClose} />

      {/* Modal */}
      <div className={styles['product-modal']}>
        <div className={styles['modal-container']}>
          {/* Close Button */}
          <button className={styles['modal-close']} onClick={onClose}>
            <X size={24} />
          </button>

          {/* Image */}
          <div className={styles['modal-image']}>
            {item.image ? (
              <img src={item.image} alt={item.name} />
            ) : (
              <div className={styles['modal-image-placeholder']}>
                <ShoppingBag size={80} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className={styles['modal-content']}>
            {/* Header */}
            <div className={styles['modal-header']}>
              <h2 className={styles['modal-title']}>{item.name}</h2>
              {item.volume && (
                <p className={styles['modal-subtitle']}>{item.volume}</p>
              )}
              <div className={styles['modal-price']}>
                {item.discount_percent > 0 && (
                  <span className={styles['price-old']}>₪{item.price.toFixed(0)}</span>
                )}
                <span className={styles['price-main']}>₪{discountedPrice.toFixed(0)}</span>
                {item.discount_percent > 0 && (
                  <span className={styles['discount-tag']}>-{item.discount_percent}%</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className={styles['modal-description']}>
              <p>
                {item.description || 
                  'Experience the perfect blend of quality and taste. Made with care using only the finest natural ingredients to bring you an exceptional experience.'}
              </p>
            </div>

            {/* Features */}
            <div className={styles['modal-features']}>
              <div className={styles['feature-item']}>
                <Truck size={20} />
                <span>Same day delivery</span>
              </div>
              <div className={styles['feature-item']}>
                <Award size={20} />
                <span>Quality checked</span>
              </div>
              <div className={styles['feature-item']}>
                <Leaf size={20} />
                <span>100% Natural</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              className={styles['modal-add-btn']}
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
        </div>
        </>
        )}