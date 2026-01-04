'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { translateToHebrew } from '@/lib/translations';
import navbarStyles from '../Navbar.module.css';

export default function CartButton() {
  const { getTotalItems, openCart } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={openCart}
      className={navbarStyles['cart-button']}
      aria-label={translateToHebrew('Shopping cart')}
    >
      <span className={navbarStyles['cart-icon-wrapper']}>
        <ShoppingBag size={24} />
        {itemCount > 0 && (
          <span className={navbarStyles['cart-badge']}>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </span>
    </button>
  );
}
