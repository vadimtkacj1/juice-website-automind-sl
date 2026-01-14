'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import NavBarShell from '@/components/Navbar/components/NavbarShell';
import MobileMenu from '@/components/Navbar/components/MobileMenu';

export default function Navbar() {
  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const stickyNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Get scroll position
          const scrollY = window.scrollY || 
                         window.pageYOffset || 
                         document.documentElement.scrollTop || 
                         0;
          
          // Only update if scroll position actually changed
          if (scrollY !== lastScrollY) {
            lastScrollY = scrollY;
            
            // Threshold set to 20px - once sticky, stay sticky until scroll back to top
            const shouldBeSticky = scrollY > 20;
            
            setSticky(prevSticky => {
              // Once sticky is true, keep it true unless we scroll back to top
              if (prevSticky && scrollY > 20) {
                return true;
              }
              return shouldBeSticky;
            });
            
            // Directly update the DOM element class
            const stickyElement = stickyNavRef.current;
            if (stickyElement) {
              if (scrollY > 20) {
                stickyElement.classList.add('is-active');
              } else {
                stickyElement.classList.remove('is-active');
              }
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Immediate check
    handleScroll();
    
    // Check after a delay to ensure DOM is ready
    const timeoutId = setTimeout(handleScroll, 100);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Listen to resize
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
  
  // Toggle main nav visibility based on sticky state (fallback for :has() selector)
  // This works with nav-main that's now inside hero sections
  useEffect(() => {
    const mainNavs = document.querySelectorAll('.nav-main') as NodeListOf<HTMLElement>;
    mainNavs.forEach((mainNav) => {
      if (sticky) {
        mainNav.style.opacity = '0';
        mainNav.style.visibility = 'hidden';
        mainNav.style.pointerEvents = 'none';
      } else {
        mainNav.style.opacity = '1';
        mainNav.style.visibility = 'visible';
        mainNav.style.pointerEvents = 'auto';
      }
    });
  }, [sticky]);

  // Memoize the close function to prevent unnecessary re-renders
  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <NavBarShell 
        className={sticky ? 'nav-sticky is-active' : 'nav-sticky'}
        compact 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        ref={stickyNavRef}
      />
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={handleCloseMenu}
      />
    </>
  );
}