'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ScrollReveal from '@/components/ScrollReveal';
import Cart from '@/components/Cart';
import CookieConsent from '@/components/CookieConsent';
import { CartProvider } from '@/lib/cart-context';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <ScrollReveal />
      <main>{children}</main>
      <Footer />
      <Cart />
      <CookieConsent />
    </CartProvider>
  );
}

