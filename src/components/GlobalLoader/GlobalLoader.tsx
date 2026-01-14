'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/lib/loading-context';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GlobalLoader() {
  const { isLoading } = useLoading();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial page load
  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 200);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Handle route changes
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Show loader if any loading state is active
  const showLoader = isLoading || isNavigating || isInitialLoad;

  if (!showLoader) return null;

  return (
    <div 
      className="global-loader-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out',
        pointerEvents: 'all',
      }}
    >
      <LoadingSpinner size="lg" />
    </div>
  );
}

