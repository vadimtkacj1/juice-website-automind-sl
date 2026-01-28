'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import '@/app/styles/mobile-menu.css'; // Assuming mobile menu styles are global or in a dedicated file

const navLinks = [
  { href: '/', label: 'תפריט' },
  { href: '/locations', label: 'מיקומים' },
  { href: '/contact', label: 'צור קשר' },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose
}: MobileMenuProps) {
  const pathname = usePathname();
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
          aria-label={'סגור תפריט'}
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
        </div>
      </div>
    </>
  );
}
