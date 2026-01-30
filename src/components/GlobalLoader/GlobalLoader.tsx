'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/lib/loading-context';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GlobalLoader() {
  const { isLoading } = useLoading();
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

  // Show loader only when explicitly requested or during initial page load
  const showLoader = isLoading || isInitialLoad;

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
        backgroundColor: '#dcbca0',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        transition: 'opacity 0.2s ease-out, visibility 0.2s ease-out',
        pointerEvents: 'all',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <LoadingSpinner size="lg" />
        <div style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#374151',
          textAlign: 'center',
          fontFamily: 'Heebo, sans-serif'
        }}>
          טוען...
        </div>
      </div>
    </div>
  );
}

