'use client';

import { ShoppingBag, Droplets } from 'lucide-react';
import styles from './styles/ProductModalImage.module.css';

interface ProductModalImageProps {
  image?: string;
  name: string;
}

export default function ProductModalImage({ image, name }: ProductModalImageProps) {
  return (
    <div className={styles['modal-image']}>
      {image ? (
        <>
          <img 
            src={image} 
            alt={name}
            loading="eager"
          />
          <div className={styles['image-disclaimer']}>
            <p>התמונה להמחשה בלבד. ייתכנו הבדלים בצבע, צורה או מראה בין המוצר בפועל לבין המוצר המוצג בתמונה.</p>
          </div>
        </>
      ) : (
        <div className={styles['modal-image-placeholder']}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(115, 34, 255, 0.1) 0%, rgba(147, 243, 170, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplets size={60} style={{ opacity: 0.5 }} />
            </div>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#70758c',
              opacity: 0.7 
            }}>
              {name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
