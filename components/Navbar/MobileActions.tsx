'use client';

import { Menu, X } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import navbarStyles from '../Navbar.module.css';

interface MobileActionsProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileActions({ mobileMenuOpen, setMobileMenuOpen }: MobileActionsProps) {
  return (
    <div className={navbarStyles['mobile-actions']}>
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
  );
}
