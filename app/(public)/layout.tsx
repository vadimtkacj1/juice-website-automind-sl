'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ScrollReveal from '@/components/ScrollReveal';
import Cart from '@/components/Cart';
import CookieConsent from '@/components/CookieConsent';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main>{children}</main>
      <Footer />
      <Cart />
      <CookieConsent />
    </>
  );
}

