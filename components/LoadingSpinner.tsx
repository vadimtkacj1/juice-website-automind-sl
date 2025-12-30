'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullPage = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className={styles['loading-spinner-wrapper']}>
      <div className={`${styles['loading-spinner']} ${sizeClasses[size]}`}>
        <div className={styles['spinner-ring']}></div>
        <div className={styles['spinner-ring']}></div>
        <div className={styles['spinner-ring']}></div>
        <div className={styles['spinner-dot']}></div>
      </div>
      {text && <p className={styles['loading-text']}>{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles['full-page-loader']}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Simple inline spinner for buttons and small areas
export function InlineSpinner({ className = '' }: { className?: string }) {
  return (
    <span className={`${styles['inline-spinner']} ${className}`}>
    </span>
  );
}

