'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Importing Next.js Image component
import DesktopNavigation from '../DesktopNavigation/DesktopNavigation';
import CartButton from '../CartButton/CartButton';
import MobileActions from '../MovileActions/MobileActions';

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
        {/* Logo Section: Using the image path /images/some.svg */}
        <Link href="/" className="logo" aria-label="טבעי שזה מרענן">
          <Image 
            src="/images/logo.svg" 
            alt="Brand Logo"
            /* Adjust dimensions based on compact state */
            width={compact ? 120 : 150} 
            height={40} 
            priority // Ensures the logo loads immediately without lag
            style={{ objectFit: 'contain' }}
          />
        </Link>
        
        {/* Desktop Navigation Links */}
        <DesktopNavigation />
        
        {/* Shopping Cart Trigger */}
        <CartButton />

        {/* Mobile Menu Toggle and Actions */}
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