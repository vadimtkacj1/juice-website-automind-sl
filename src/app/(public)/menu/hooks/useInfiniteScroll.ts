import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({ hasMore, loadingMore, onLoadMore }: UseInfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Setting up IntersectionObserver for load more', { loadingMore, hasMore });
    if (loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('Load more trigger intersected');
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadingMore, hasMore, onLoadMore]);

  return observerTarget;
}

