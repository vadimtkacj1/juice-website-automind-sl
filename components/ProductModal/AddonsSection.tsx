import { Plus, Minus } from 'lucide-react';
import styles from '../ProductModal.module.css';

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
      <h3 className={styles['section-title']}>Add-ons</h3>
      <div className={styles['addons-list']}>
        {addons.map(addon => {
          const quantity = selectedAddons.get(addon.id) || 0;
          return (
            <div key={addon.id} className={styles['addon-item']}>
              <div className={styles['addon-info']}>
                <span className={styles['addon-name']}>{addon.name}</span>
                <span className={styles['addon-price']}>+₪{addon.price.toFixed(0)}</span>
              </div>
              <div className={styles['addon-controls']}>
                <button
                  className={styles['qty-btn']}
                  onClick={() => onQuantityChange(addon.id, -1)}
                  disabled={quantity === 0}
                >
                  <Minus size={16} />
                </button>
                <span className={styles['qty-value']}>{quantity}</span>
                <button
                  className={styles['qty-btn']}
                  onClick={() => onQuantityChange(addon.id, 1)}
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

