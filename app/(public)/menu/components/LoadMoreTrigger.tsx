'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { translateToHebrew } from '@/lib/translations';
import styles from '../menu.module.css';
import { RefObject } from 'react';

interface LoadMoreTriggerProps {
  observerTarget: RefObject<HTMLDivElement>;
  hasMore: boolean;
}

export default function LoadMoreTrigger({ observerTarget, hasMore }: LoadMoreTriggerProps) {
  if (!hasMore) return null;

  return (
    <div ref={observerTarget} className={styles.loadMoreTrigger}>
      <LoadingSpinner size="md" text={translateToHebrew('Loading more items...')} />
    </div>
  );
}

