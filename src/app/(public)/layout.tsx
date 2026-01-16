'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar/Navbar';
import ScrollReveal from '@/components/ScrollReveal';
import Cart from '@/components/Cart';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCheckoutPage = pathname === '/checkout';

  return (
    <>
      {!isCheckoutPage && <Navbar />}
      <ScrollReveal />
      <main>{children}</main>
      {mounted && !isCheckoutPage && <Footer />}
      <Cart />
    </>
  );
}

