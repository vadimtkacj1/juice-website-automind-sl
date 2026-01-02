'use client';

import { Package } from 'lucide-react';
import styles from '../ProductModal.module.css';
import { translateToHebrew } from '@/lib/translations';

interface VolumeOption {
  id?: number;
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

interface VolumeSelectorProps {
  volumeOptions: VolumeOption[];
  selectedVolume: string | null;
  onVolumeChange: (volume: string) => void;
  discountPercent: number;
}

export default function VolumeSelector({
  volumeOptions,
  selectedVolume,
  onVolumeChange,
  discountPercent,
}: VolumeSelectorProps) {
  // Only show volume selector if there are multiple options
  if (volumeOptions.length <= 1) {
    return null;
  }

  return (
    <div className={styles['modal-section']}>
      <h3 className={styles['section-title']}>
        {translateToHebrew('Select Size')}
      </h3>
      <div className={styles['volume-grid']}>
        {volumeOptions.map((vol, index) => {
          const isSelected = selectedVolume === vol.volume;
          const volPrice = discountPercent > 0
            ? vol.price * (1 - discountPercent / 100)
            : vol.price;
          
          return (
            <div key={vol.volume} className={styles['volume-option']}>
              <input
                type="radio"
                id={`volume-${index}`}
                name="volume-selection"
                checked={isSelected}
                onChange={() => onVolumeChange(vol.volume)}
              />
              <div className={styles['volume-card']}>
                {vol.is_default && (
                  <span className={styles['volume-badge']}>
                    {translateToHebrew('Popular')}
                  </span>
                )}
                <span className={styles['volume-label']}>
                  {translateToHebrew(vol.volume)}
                </span>
                <span className={styles['volume-price']}>
                  ₪{volPrice.toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
