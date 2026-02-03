'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import ImageSpinner from '@/components/LoadingSpinner/ImageSpinner';

interface Category {
  id: number;
  name: string;
  image?: string;
}

interface HomeCategoryCardProps {
  category: Category;
  styles: any;
}

export default function HomeCategoryCard({ category, styles }: HomeCategoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/menu/category/${category.id}`}
      className={styles.categoryCard}
    >
      {/* Image Container */}
      <div className={styles.categoryImageWrapper}>
        {category.image ? (
          <>
            <Image
              src={category.image}
              alt={translateToHebrew(category.name)}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={styles.categoryImage}
              loading="lazy"
              quality={90}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && !imageError && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(248, 249, 252, 0.9)',
                zIndex: 10
              }}>
                <ImageSpinner size="sm" overlay={false} />
              </div>
            )}
          </>
        ) : (
          <div className={styles.categoryImagePlaceholder}>
            <ShoppingBag size={48} strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Category Name Below Image */}
      <div className={styles.categoryContent}>
        <h3 className={styles.categoryName}>
          {translateToHebrew(category.name)}
        </h3>
      </div>
    </Link>
  );
}
