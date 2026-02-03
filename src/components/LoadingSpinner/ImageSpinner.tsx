'use client';

import styles from './ImageSpinner.module.css';

interface ImageSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

/**
 * Компактный спиннер специально для изображений
 * Занимает минимум места и показывается только на картинке
 */
export default function ImageSpinner({
  size = 'sm',
  overlay = true
}: ImageSpinnerProps) {
  const sizeClasses = {
    xs: styles.xs,
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  const spinner = (
    <div className={`${styles.spinner} ${sizeClasses[size]}`}>
      <div className={styles.ring}></div>
      <div className={styles.ring}></div>
      <div className={styles.ring}></div>
      <div className={styles.dot}></div>
    </div>
  );

  if (overlay) {
    return (
      <div className={styles.overlay}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
