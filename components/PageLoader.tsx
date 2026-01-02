'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle initial page load
    const handleLoad = () => {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (!isLoading) return null;

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

