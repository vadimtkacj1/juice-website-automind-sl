'use client';

import { Truck, Award, Leaf, Zap } from 'lucide-react';
import styles from './styles/ProductModalFeatures.module.css';
export default function ProductModalFeatures() {
  const features = [
    { icon: Truck, label: 'משלוח מהיר' },
    { icon: Award, label: 'איכות פרמיום' },
    { icon: Leaf, label: '100% טבעי' },
    { icon: Zap, label: 'מוכן טרי' },
  ];

  return (
    <div className={styles['modal-features']}>
      {features.map((feature, index) => (
        <div 
          key={index} 
          className={styles['feature-item']}
          style={{ animationDelay: `${0.1 + index * 0.05}s` }}
        >
          <feature.icon size={18} />
          <span>{feature.label}</span>
        </div>
      ))}
    </div>
  );
}
