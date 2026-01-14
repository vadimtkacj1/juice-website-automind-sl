'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import HeroSection from '@/components/HeroSection';
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
      <HeroSection
        backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080"
      >
        <h1 className="hero-title">{translateToHebrew('OUR MENU')}</h1>
      </HeroSection>
      <div className={styles.menuEmpty}>
        <h2>{translateToHebrew('Menu is empty')}</h2>
        <p>{translateToHebrew('Delicious items coming soon!')}</p>
      </div>
    </div>
  );
}

