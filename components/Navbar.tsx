'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { translateToHebrew } from '@/lib/translations';
import navbarStyles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: translateToHebrew('Home') },
  { href: '/menu', label: translateToHebrew('Menu') },
  { href: '/locations', label: translateToHebrew('Locations') },
  { href: '/contact', label: translateToHebrew('Contact') },
];

// Custom Logo Component - Natural Refreshing theme
function BrandLogo({ compact = false }: { compact?: boolean }) {
  const size = compact ? 38 : 48;
  
  return (
    <div className="brand-logo" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        aria-hidden="true"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
        </defs>
        
        {/* Orange circle (representing orange/citrus) */}
        <circle cx="30" cy="32" r="24" fill="url(#logoGradient)" />
        
        {/* Orange segments pattern */}
        <path
          d="M30 32 L30 8 A24 24 0 0 1 54 32 Z"
          fill="rgba(255,255,255,0.15)"
        />
        <path
          d="M30 32 L54 32 A24 24 0 0 1 30 56 Z"
          fill="rgba(255,255,255,0.1)"
        />
        <path
          d="M30 32 L30 56 A24 24 0 0 1 6 32 Z"
          fill="rgba(255,255,255,0.05)"
        />
        
        {/* Center highlight */}
        <circle cx="30" cy="32" r="6" fill="rgba(255,255,255,0.3)" />
        
        {/* Leaf on top */}
        <path
          d="M30 8 Q35 2 42 4 Q38 8 35 12 Q32 8 30 8 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M36 6 Q38 4 40 5"
          stroke="#2E7D32"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Hebrew letter נ (Nun) stylized in center */}
        <text
          x="30"
          y="38"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="900"
          fontFamily="'Heebo', sans-serif"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
        >
          נמ
        </text>
      </svg>
      
    </div>
  );
}

function NavBarShell({ 
  className, 
  compact, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: { 
  className: string; 
  compact?: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const { getTotalItems, openCart } = useCart();
  const itemCount = getTotalItems();

  return (
    <div className={className}>
      <nav className="nav-content">
        <Link href="/" className="logo" aria-label="נטורליי מרענן">
          <BrandLogo compact={compact} />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="menu-item">
              <div className="roll-inner">
                <span>{link.label}</span>
                <span className="hvr">{link.label}</span>
              </div>
            </Link>
          ))}
          <button
            onClick={openCart}
            className={`menu-item ${navbarStyles['cart-button']}`}
            aria-label={translateToHebrew('Shopping cart')}
          >
            <div className="roll-inner">
              <span className={navbarStyles['cart-icon-wrapper']}>
                <ShoppingBag size={24} />
                {itemCount > 0 && (
                  <span className={navbarStyles['cart-badge']}></span>
                )}
              </span>
              <span className={`hvr ${navbarStyles['cart-icon-wrapper']}`}>
                <ShoppingBag size={24} />
                {itemCount > 0 && (
                  <span className={navbarStyles['cart-badge']}></span>
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Mobile Actions */}
        <div className={navbarStyles['mobile-actions']}>
          <button
            onClick={openCart}
            className={navbarStyles['mobile-cart-btn']}
            aria-label={translateToHebrew('Shopping cart')}
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className={navbarStyles['mobile-cart-badge']}></span>
            )}
          </button>
          <button
            onClick={() => {
              console.log('Burger menu button clicked');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className={navbarStyles['mobile-menu-btn']}
            aria-label={mobileMenuOpen ? translateToHebrew('Close menu') : translateToHebrew('Open menu')}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
    </div>
  );
}

function MobileMenu({ 
  isOpen,
  onClose
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { openCart, getTotalItems } = useCart();
  const itemCount = getTotalItems();
  const [isVisible, setIsVisible] = useState(false);
  const prevPathnameRef = useRef(pathname);

  // Close menu when route changes (but not on initial mount)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname && isOpen) {
      onClose();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isOpen, onClose]);

  // Handle visibility for animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow closing animation
      const timer = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      <div 
        className={`mobile-menu-overlay ${!isOpen ? 'closing' : ''}`} 
        onClick={onClose} 
      />
      <div className={`mobile-menu ${!isOpen ? 'closing' : ''}`}>
        <button
          onClick={onClose}
          className="mobile-menu-close"
          aria-label={translateToHebrew('Close menu')}
        >
          <X size={28} />
        </button>
        <div className="mobile-menu-content">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-menu-link ${pathname === link.href ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              onClose();
              openCart();
            }}
            className="mobile-menu-cart"
            style={{ animationDelay: `${navLinks.length * 0.05}s` }}
          >
            <ShoppingBag size={24} />
            <span>{translateToHebrew('Cart')}</span>
            {itemCount > 0 && (
              <span className="mobile-menu-cart-count">{itemCount}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          const shouldBeSticky = scrollY > 50;
          setSticky(shouldBeSticky);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Check initial scroll position
    handleScroll();
    
    // Add scroll listener to both window and document
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Memoize the close function to prevent unnecessary re-renders
  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <NavBarShell 
        className="nav-main" 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <NavBarShell 
        className={`nav-sticky${sticky ? ' is-active' : ''}`}
        compact 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={handleCloseMenu}
      />
    </>
  );
}
