import { ShoppingBag } from 'lucide-react';
import styles from '../ProductModal.module.css';

interface ProductModalImageProps {
  image?: string;
  name: string;
}

export default function ProductModalImage({ image, name }: ProductModalImageProps) {
  return (
    <div className={styles['modal-image']}>
      {image ? (
        <img src={image} alt={name} />
      ) : (
        <div className={styles['modal-image-placeholder']}>
          <ShoppingBag size={80} />
        </div>
      )}
    </div>
  );
}

