
'use client';

import { translateToHebrew } from '@/lib/translations';
import styles from '../ProductModal.module.css';

interface AdditionalItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

interface AdditionalItemsSectionProps {
  additionalItems: AdditionalItem[];
  selectedItems: Set<number>;
  onToggle: (id: number) => void;
}

export default function AdditionalItemsSection({
  additionalItems,
  selectedItems,
  onToggle,
}: AdditionalItemsSectionProps) {
  if (additionalItems.length === 0) {
    return null;
  }

  return (
    <div className={styles['modal-section']}>
      <h3 className={styles['section-title']}>
        {translateToHebrew('Additional Options')}
      </h3>
      <div className={styles['options-grid']}>
        {additionalItems.map((item) => (
          <label
            key={item.id}
            className={`${styles['option-item']} ${selectedItems.has(item.id) ? styles['option-item-selected'] : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedItems.has(item.id)}
              onChange={() => onToggle(item.id)}
              className={styles['option-checkbox']}
            />
            <div className={styles['option-content']}>
              <div className={styles['option-header']}>
                <span className={styles['option-name']}>
                  {translateToHebrew(item.name)}
                </span>
                <span className={styles['option-price']}>
                  +₪{item.price.toFixed(0)}
                </span>
              </div>
              {item.description && (
                <p className={styles['option-description']}>
                  {translateToHebrew(item.description)}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

