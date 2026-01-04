'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import BrandLogo from './BrandLogo';
import DesktopNavigation from './DesktopNavigation';
import CartButton from './CartButton';
import MobileActions from './MobileActions';
import navbarStyles from '../Navbar.module.css';

interface NavBarShellProps {
  className: string;
  compact?: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const NavBarShell = React.forwardRef<HTMLDivElement, NavBarShellProps>((
  { className, compact, mobileMenuOpen, setMobileMenuOpen }, ref
) => {
  return (
    <div ref={ref} className={className}>
      <nav className="nav-content">
        <Link href="/" className="logo" aria-label="נטורליי מרענן">
          <BrandLogo compact={compact} />
        </Link>
        
        <DesktopNavigation />
        
        <CartButton />

        <MobileActions 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </nav>
    </div>
  );
});

NavBarShell.displayName = 'NavBarShell';

export default NavBarShell;
