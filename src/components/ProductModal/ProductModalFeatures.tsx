'use client';

import { Truck, Award, Leaf, Zap } from 'lucide-react';
import styles from './styles/ProductModalFeatures.module.css';
import { translateToHebrew } from '@/lib/translations';

export default function ProductModalFeatures() {
  const features = [
    { icon: Truck, label: translateToHebrew('Fast Delivery') },
    { icon: Award, label: translateToHebrew('Premium Quality') },
    { icon: Leaf, label: translateToHebrew('100% Natural') },
    { icon: Zap, label: translateToHebrew('Fresh Made') },
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
