'use client';

import styles from './MobileMenu.module.css';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/locations', label: 'Locations' },
  { href: '/contact', label: 'Contact' },
];

const logoSrc = 'https://framerusercontent.com/images/K2ZYusAMck7jg9gN9jfI2FAslA.svg';

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
        <Link href="/" className="logo" aria-label="Reviva">
          <img src={logoSrc} alt="Reviva logo" width={compact ? 40 : 50} height={compact ? 40 : 50} />
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
            className="menu-item cart-button"
            aria-label="Shopping cart"
          >
            <div className="roll-inner">
              <span className="cart-icon-wrapper">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </span>
              <span className="hvr cart-icon-wrapper">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="mobile-actions">
          <button
            onClick={openCart}
            className="mobile-cart-btn"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="mobile-cart-badge">{itemCount}</span>
            )}
          </button>
          <button
            onClick={() => {
              console.log('Burger menu button clicked');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="mobile-menu-btn"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      <style jsx>{`
        .cart-button {
          background: none;
          border: none;
          cursor: pointer;
        }
        .cart-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--pink);
          color: var(--primary);
          font-size: 11px;
          font-weight: 900;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        .mobile-actions {
          display: none;
          align-items: center;
          gap: 8px;
        }
        .mobile-cart-btn,
        .mobile-menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark);
          transition: background 0.2s ease;
        }
        .mobile-cart-btn:hover,
        .mobile-menu-btn:hover {
          background: rgba(29, 26, 64, 0.1);
        }
        .mobile-cart-btn {
          position: relative;
        }
        .mobile-cart-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--pink);
          color: var(--primary);
          font-size: 10px;
          font-weight: 900;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 980px) {
          .mobile-actions {
            display: flex;
          }
        }
      `}</style>
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
        className={`${styles['mobile-menu-overlay']} ${!isOpen ? styles['closing'] : ''}`} 
        onClick={onClose} 
      />
      <div className={`${styles['mobile-menu']} ${!isOpen ? styles['closing'] : ''}`}>
        <button
          onClick={onClose}
          className={styles['mobile-menu-close']}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>
        <div className={styles['mobile-menu-content']}>
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles['mobile-menu-link']} ${pathname === link.href ? styles['active'] : ''}`}
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
            className={styles['mobile-menu-cart']}
            style={{ animationDelay: `${navLinks.length * 0.05}s` }}
          >
            <ShoppingBag size={24} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className={styles['mobile-menu-cart-count']}>{itemCount}</span>
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
    const handleScroll = () => setSticky(window.scrollY > 100);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
        className={`nav-sticky ${sticky ? 'is-active' : ''}`} 
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
