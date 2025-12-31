import styles from '../ProductModal.module.css';

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
      <h3 className={styles['section-title']}>Select Volume</h3>
      <div className={styles['ingredients-list']}>
        {volumeOptions.map((vol) => {
          const isSelected = selectedVolume === vol.volume;
          const volPrice = discountPercent > 0
            ? vol.price * (1 - discountPercent / 100)
            : vol.price;
          return (
            <label key={vol.volume} className={styles['ingredient-item']}>
              <input
                type="radio"
                name="volume-selection"
                checked={isSelected}
                onChange={() => onVolumeChange(vol.volume)}
                className={styles['ingredient-checkbox']}
              />
              <div className={styles['ingredient-info']}>
                <span className={styles['ingredient-name']}>{vol.volume}</span>
                <span className={styles['ingredient-price']}>₪{volPrice.toFixed(0)}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

