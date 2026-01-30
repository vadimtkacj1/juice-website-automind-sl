'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: string;
  onLoad?: () => void;
  quality?: number;
  sizes?: string;
  showSpinner?: boolean;
}

/**
 * Оптимизированный компонент изображения с:
 * - Автоматическим lazy loading
 * - Поддержкой WebP
 * - Blur placeholder
 * - SEO оптимизацией
 * - Intersection Observer для производительности
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
  placeholder,
  onLoad,
  quality = 75,
  sizes,
  showSpinner = true,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Начинаем загрузку за 100px до появления в viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Определяем, является ли изображение внешним
  const isExternal = src.startsWith('http://') || src.startsWith('https://');
  
  // Для внутренних изображений используем Next.js Image
  const isInternalUpload = src.startsWith('/uploads');

  // Генерируем srcset для responsive images
  const generateSrcSet = () => {
    if (!isInternalUpload) return undefined;
    
    const basePath = src.replace(/\.[^/.]+$/, '');
    const ext = src.split('.').pop();
    
    // Если есть WebP версия, используем её
    const webpPath = basePath + '.webp';
    
    return `${webpPath} 1x, ${webpPath} 2x`;
  };

  // Fallback для ошибок загрузки
  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Placeholder пока изображение не в viewport
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-100 animate-pulse ${className}`}
        style={{ 
          width: width || '100%', 
          height: height || '100%',
          backgroundImage: placeholder ? `url(${placeholder})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: placeholder ? 'blur(10px)' : undefined,
        }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Для изображений из /uploads используем обычный img (уже оптимизированы через sharp)
  // Для внешних изображений используем Next.js Image для оптимизации
  const useNativeImg = isInternalUpload;

  // Используем Next.js Image для внешних изображений, обычный img для /uploads
  if (fill) {
    return (
      <div ref={imgRef} className={`relative ${className}`}>
        {useNativeImg ? (
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectFit }}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            quality={quality}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes || '100vw'}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectFit }}
          />
        )}
        {!isLoaded && showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {placeholder && !isLoaded && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${placeholder})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(10px)',
            }}
          />
        )}
      </div>
    );
  }

  // Для изображений с фиксированными размерами
  if (width && height) {
    return (
      <div ref={imgRef} className="relative" style={{ width, height }}>
        {useNativeImg ? (
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${className} ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectFit, width, height }}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
            className={`transition-opacity duration-300 ${className} ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectFit }}
          />
        )}
        {!isLoaded && showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {placeholder && !isLoaded && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${placeholder})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(10px)',
            }}
          />
        )}
      </div>
    );
  }

  // Fallback для обычных изображений
  return (
    <div ref={imgRef} className="relative">
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${className} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit }}
      />
      {!isLoaded && showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {placeholder && !isLoaded && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
        />
      )}
    </div>
  );
}

/**
 * Компонент для фоновых изображений с оптимизацией
 */
export function OptimizedBackgroundImage({
  src,
  alt,
  className = '',
  children,
  overlay = false,
  overlayOpacity = 0.5,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        priority={false}
        className="z-0"
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black z-10"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children && <div className="relative z-20">{children}</div>}
    </div>
  );
}

