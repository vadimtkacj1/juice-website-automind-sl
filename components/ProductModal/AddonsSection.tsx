'use client';

import { Plus, Minus, Sparkles } from 'lucide-react';
import styles from '../ProductModal.module.css';
import { translateToHebrew } from '@/lib/translations';

interface Addon {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

interface AddonsSectionProps {
  addons: Addon[];
  selectedAddons: Map<number, number>;
  onQuantityChange: (addonId: number, delta: number) => void;
}

export default function AddonsSection({
  addons,
  selectedAddons,
  onQuantityChange,
}: AddonsSectionProps) {
  if (addons.length === 0) {
    return null;
  }

  return (
    <div className={styles['modal-section']}>
      <h3 className={styles['section-title']}>
        <Sparkles size={18} style={{ color: '#7322ff' }} />
        {translateToHebrew('Boost Your Drink')}
      </h3>
      <div className={styles['addons-list']}>
        {addons.map(addon => {
          const quantity = selectedAddons.get(addon.id) || 0;
          const isActive = quantity > 0;
          
          return (
            <div 
              key={addon.id} 
              className={styles['addon-item']}
              style={{
                borderColor: isActive ? 'rgba(115, 34, 255, 0.3)' : undefined,
                background: isActive ? 'linear-gradient(135deg, rgba(115, 34, 255, 0.04) 0%, rgba(147, 243, 170, 0.03) 100%)' : undefined
              }}
            >
              <div className={styles['addon-info']}>
                {addon.image ? (
                  <img 
                    src={addon.image} 
                    alt={addon.name} 
                    className={styles['addon-image']}
                  />
                ) : (
                  <div 
                    className={styles['addon-image']}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf2 100%)'
                    }}
                  >
                    <Sparkles size={20} style={{ color: '#7322ff', opacity: 0.5 }} />
                  </div>
                )}
                <div className={styles['addon-details']}>
                  <span className={styles['addon-name']}>
                    {translateToHebrew(addon.name)}
                  </span>
                  <span className={styles['addon-price']}>
                    +₪{addon.price.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className={styles['addon-controls']}>
                <button
                  className={styles['qty-btn']}
                  onClick={() => onQuantityChange(addon.id, -1)}
                  disabled={quantity === 0}
                  aria-label={translateToHebrew('Decrease quantity')}
                >
                  <Minus size={16} />
                </button>
                <span 
                  className={styles['qty-value']}
                  style={{ 
                    color: isActive ? '#7322ff' : undefined,
                    fontWeight: isActive ? 900 : undefined
                  }}
                >
                  {quantity}
                </span>
                <button
                  className={styles['qty-btn']}
                  onClick={() => onQuantityChange(addon.id, 1)}
                  aria-label={translateToHebrew('Increase quantity')}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
