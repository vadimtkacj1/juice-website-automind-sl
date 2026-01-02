'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { translateToHebrew } from '@/lib/translations';
import styles from '../menu.module.css';

interface MenuLoadingStateProps {
  text?: string;
}

export function MenuLoadingState({ text }: MenuLoadingStateProps) {
  return (
    <div className={styles.menuPage}>
      <div className={styles.menuLoading}>
        <LoadingSpinner
          size="lg"
          text={text || translateToHebrew('Loading delicious menu...')}
          fullPage
        />
      </div>
    </div>
  );
}

interface MenuErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function MenuErrorState({ error, onRetry }: MenuErrorStateProps) {
  return (
    <div className={styles.menuPage}>
      <div className={styles.menuError}>
        <p>{translateToHebrew(error || '')}</p>
        <button onClick={onRetry} className={styles.retryBtn}>
          {translateToHebrew('Try again')}
        </button>
      </div>
    </div>
  );
}

export function MenuEmptyState() {
  return (
    <div className={styles.menuPage}>
      <div className={styles.menuEmpty}>
        <h2>{translateToHebrew('Menu is empty')}</h2>
        <p>{translateToHebrew('Delicious items coming soon!')}</p>
      </div>
    </div>
  );
}

