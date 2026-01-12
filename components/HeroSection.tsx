'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import NavBarShell from './Navbar/NavbarShell';
import MobileMenu from './Navbar/MobileMenu';

interface HeroSectionProps {
  children: React.ReactNode;
  backgroundImage?: string;
  showFloatingOranges?: boolean;
}

// Floating orange configuration
const floatingOranges = [
  {
    id: 1,
    src: '/oranges/orange-wedge.png',
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
    src: '/images/rasberry.png',
    alt: 'פלח תפוז עסיסי',
    className: 'floating-orange-3'
  },
  {
    id: 4,
    src: '/oranges/orange-slice-2.png',
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
    src: '/images/apple.png',
    alt: 'פלח תפוז טבעי',
    className: 'floating-orange-6'
  },
  {
    id: 7,
    src: '/images/pomegranede.png',
    alt: 'פרוסת תפוז עסיסית',
    className: 'floating-orange-7'
  },
  {
    id: 8,
    src: '/images/strawberry.png',
    alt: 'פלח תפוז מתוק',
    className: 'floating-orange-8'
  },
  {
    id: 9,
    src: '/oranges/orange-slice-2.png',
    alt: 'תפוז טרי וטעים',
    className: 'floating-orange-9'
  },
  {
    id: 10,
    src: '/oranges/orange-slice-1.png',
    alt: 'פרוסת תפוז ויטמין C',
    className: 'floating-orange-10'
  },
];

export default function HeroSection({ children, backgroundImage, showFloatingOranges = false }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Memoize the close function to prevent unnecessary re-renders
  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <section 
      ref={heroRef}
      className={`hero ${isVisible ? 'active' : ''}`}
      id="hero"
      style={{
        backgroundColor: '#7322ff',
        ...(backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'overlay'
        } : {})
      }}
      aria-label="אזור ראשי - נטורליי מרענן"
    >
      {/* Main Navigation */}
      <NavBarShell 
        className="nav-main" 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Animated background gradient overlay */}
      <div className="hero-gradient-overlay" aria-hidden="true"></div>
      
      {/* Floating Oranges Container - Only on home page */}
      {showFloatingOranges && (
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
      )}
      
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
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={handleCloseMenu}
      />
    </section>
  );
}
