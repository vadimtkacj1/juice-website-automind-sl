'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Folder } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './CategoryCard.module.css';

export interface Category {
  id: number;
  name: string;
  image?: string;
}

interface CategoryCardProps {
  category: Category;
  index: number;
}

const CategoryCard = memo(function CategoryCard({
  category,
  index,
}: CategoryCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasValidImage = category.image?.trim() && !imageError;

  const handleClick = () => {
    router.push(`/menu/category/${category.id}`);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleClick();
  };

  return (
    <div
      className={`${styles.categoryCard} reveal`}
      style={{ ['--delay' as string]: `${0.1 * (index + 1)}s` }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Контейнер изображения */}
      <div className={styles.imageWrapper}>
        {hasValidImage ? (
          <>
            <Image
              src={category.image as string}
              alt={translateToHebrew(category.name)}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`${styles.image} ${imageLoaded ? styles.imageLoaded : ''}`}
              loading="lazy"
              quality={90}
            />
            {!imageLoaded && (
              <div className={styles.imageSpinner}>
                <LoadingSpinner size="sm" />
              </div>
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            <Folder size={40} strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Заголовок под картинкой */}
      <div className={styles.info}>
        <h3 className={styles.name}>
          {translateToHebrew(category.name)}
        </h3>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.image === nextProps.category.image &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.index === nextProps.index
  );
});

export default CategoryCard;