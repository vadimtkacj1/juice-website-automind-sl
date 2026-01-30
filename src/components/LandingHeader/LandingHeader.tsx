'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Menu, X } from 'lucide-react';
import BrandLogo from '@/components/Navbar/components/BrandLogo/BrandLogo';
import styles from './LandingHeader.module.css';

export default function LandingHeader() {
  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const stickyNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

          if (scrollY !== lastScrollY) {
            lastScrollY = scrollY;
            const shouldBeSticky = scrollY > 20;

            setSticky(shouldBeSticky);

            const stickyElement = stickyNavRef.current;
            if (stickyElement) {
              if (scrollY > 20) {
                stickyElement.classList.add(styles.active);
              } else {
                stickyElement.classList.remove(styles.active);
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    const timeoutId = setTimeout(handleScroll, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <div ref={stickyNavRef} className={styles.navSticky}>
        <nav className={styles.navContent}>
          {/* Logo - Desktop uses BrandLogo, Mobile uses logo.svg */}
          <Link href="/landing" className={styles.logo} aria-label="טבעי שזה מרענן">
            <span className={styles.desktopLogo}>
              <BrandLogo compact={sticky} />
            </span>
            <span className={styles.mobileLogo}>
              <Image
                src="/images/logo.svg"
                alt="טבעי שזה מרענן"
                width={45}
                height={45}
                priority
              />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.navLinks}>
            <button onClick={() => scrollToSection('hero')} className={styles.menuItem}>
              <div className={styles.rollInner}>
                <span>ראשי</span>
                <span className={styles.hvr}>ראשי</span>
              </div>
            </button>

            <button onClick={() => scrollToSection('offer')} className={styles.menuItem}>
              <div className={styles.rollInner}>
                <span>מוצרים</span>
                <span className={styles.hvr}>מוצרים</span>
              </div>
            </button>

            <button onClick={() => scrollToSection('why')} className={styles.menuItem}>
              <div className={styles.rollInner}>
                <span>למה אנחנו</span>
                <span className={styles.hvr}>למה אנחנו</span>
              </div>
            </button>

            <button onClick={() => scrollToSection('order')} className={styles.menuItem}>
              <div className={styles.rollInner}>
                <span>הזמנה</span>
                <span className={styles.hvr}>הזמנה</span>
              </div>
            </button>
          </div>

          {/* Phone Button (Desktop) */}
          <a href="tel:052-678-0739" className={styles.phoneButton}>
            <Phone size={20} />
          </a>

          {/* Mobile Actions */}
          <div className={styles.mobileActions}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a href="tel:052-678-0739" className={styles.mobilePhoneButton}>
              <Phone size={20} />
            </a>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            <button onClick={() => scrollToSection('hero')} className={styles.mobileMenuItem}>
              ראשי
            </button>
            <button onClick={() => scrollToSection('offer')} className={styles.mobileMenuItem}>
              מוצרים
            </button>
            <button onClick={() => scrollToSection('why')} className={styles.mobileMenuItem}>
              למה אנחנו
            </button>
            <button onClick={() => scrollToSection('order')} className={styles.mobileMenuItem}>
              הזמנה
            </button>

            {/* Centered Phone Button in Mobile Menu */}
            <a href="tel:052-678-0739" className={styles.mobileMenuPhone}>
              <Phone size={20} />
              052-678-0739
            </a>
          </div>
        </div>
      )}
    </>
  );
}
