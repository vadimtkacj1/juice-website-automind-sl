'use client';

import React from 'react';
import LandingFooter from '@/components/LandingFooter';
import HeroLandingSection from './sections/HeroLandingSection';
import OfferSection from './sections/OfferSection';
import WhySection from './sections/WhySection';
import OrderSection from './sections/OrderSection';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <>
      <div className={styles.landingPage}>
        <HeroLandingSection />
        <OfferSection />
        <WhySection />
        <OrderSection />
      </div>
      <LandingFooter />
    </>
  );
}
