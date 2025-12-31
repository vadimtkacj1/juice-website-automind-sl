import { Truck, Award, Leaf } from 'lucide-react';
import styles from '../ProductModal.module.css';

export default function ProductModalFeatures() {
  return (
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
  );
}

