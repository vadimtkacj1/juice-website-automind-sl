'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

// Floating orange configuration
const floatingOranges = [
  { 
    id: 1, 
    src: '/oranges/orange-slice-1.png', 
    alt: 'פרוסת תפוז טרייה', 
    className: 'floating-orange-1' 
  },
  { 
    id: 2, 
    src: '/oranges/orange-slice-2.png', 
    alt: 'תפוז חתוך טרי למיץ', 
    className: 'floating-orange-2' 
  },
  { 
    id: 3, 
    src: '/oranges/orange-wedge.png', 
    alt: 'פלח תפוז עסיסי', 
    className: 'floating-orange-3' 
  },
  { 
    id: 4, 
    src: '/oranges/orange-slice-3.jpg', 
    alt: 'תפוז טרי מהטבע', 
    className: 'floating-orange-4' 
  },
  { 
    id: 5, 
    src: '/oranges/orange-slice-1.png', 
    alt: 'פרוסת תפוז למשקאות', 
    className: 'floating-orange-5' 
  },
  { 
    id: 6, 
    src: '/oranges/orange-wedge.png', 
    alt: 'פלח תפוז טבעי', 
    className: 'floating-orange-6' 
  },
];

export default function HeroSection({ children, backgroundImage }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={heroRef}
      className={`hero ${isVisible ? 'active' : ''}`}
      id="hero"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
      aria-label="אזור ראשי - נטורליי מרענן"
    >
      {/* Animated background gradient overlay */}
      <div className="hero-gradient-overlay" aria-hidden="true"></div>
      
      {/* Floating Oranges Container */}
      <div className="floating-oranges-container" aria-hidden="true">
        {floatingOranges.map((orange, index) => {
          // Calculate parallax offset based on index for varied speeds
          const parallaxSpeed = 0.1 + (index * 0.05);
          const parallaxOffset = scrollY * parallaxSpeed;
          
          return (
            <div
              key={orange.id}
              className={`floating-orange ${orange.className}`}
              style={{
                transform: `translateY(${parallaxOffset}px)`,
              }}
            >
              <Image
                src={orange.src}
                alt={orange.alt}
                width={200}
                height={200}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  objectFit: 'contain'
                }}
                priority={index < 2}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}
      </div>
      
      {/* Main Content */}
      <div className="title-container">
        {children}
      </div>
      
      {/* Decorative animated elements */}
      <div 
        className="hero-decoration hero-decoration-1" 
        aria-hidden="true"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      ></div>
      <div 
        className="hero-decoration hero-decoration-2" 
        aria-hidden="true"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      ></div>
    </section>
  );
}
