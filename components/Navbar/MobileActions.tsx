'use client';

import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { translateToHebrew } from '@/lib/translations';
import navbarStyles from '../Navbar.module.css';

interface MobileActionsProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileActions({ mobileMenuOpen, setMobileMenuOpen }: MobileActionsProps) {
  const { getTotalItems, openCart } = useCart();
  const itemCount = getTotalItems();

  return (
    <div className={navbarStyles['mobile-actions']}>
      <button
        onClick={openCart}
        className={navbarStyles['mobile-cart-btn']}
        aria-label={translateToHebrew('Shopping cart')}
      >
        <ShoppingBag size={22} />
        {itemCount > 0 && (
          <span className={navbarStyles['mobile-cart-badge']}>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
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
  );
}
