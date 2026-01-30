'use client';

import React from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import LandingHeader from '@/components/LandingHeader';
import { Phone } from 'lucide-react';
import styles from './HeroLandingSection.module.css';

export default function HeroLandingSection() {
  return (
    <section id="hero" className={styles.heroSection}>
      <LandingHeader />
      <HeroSection
        backgroundImage="/images/hero.jpg"
        showFloatingOranges={false}
        showOverlay={true}
        showNavbar={false}
        backgroundColor="#1d1a40"
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>טבעי שזה מרענן</h1>
          <h2 className={styles.heroSubtitle}>
            מגשי פירות מעוצבים וקינוחי פירות לאירועים שלא שוכחים
          </h2>
          <p className={styles.heroDescription}>
            עסק משפחתי שמתמחה בעיצוב מגשי פירות מרהיבים, קינוחי פירות טריים ומיצים טבעיים – לכל סוגי האירועים
          </p>
          <p className={styles.heroTagline}>
            טעם מדויק, עיצוב מרשים ושירות חם – כי אצלנו כל אירוע מקבל יחס אישי
          </p>

          <div className={styles.heroFeatures}>
            <div className={styles.featureItem}>
              מסיבות | בת ובר מצווה | חתונות | אירועי חברה | ימי הולדת
            </div>
            <div className={styles.featureItem}>
              משלוחים לכל אזור המרכז
            </div>
          </div>

          <div className={styles.heroCta}>
            <Link href="/menu" className={styles.ctaButton}>
              להזמנה מהירה באתר
            </Link>
            <a href="tel:052-678-0739" className={styles.ctaButtonSecondary}>
              <Phone size={20} />
              052-678-0739
            </a>
          </div>
        </div>
      </HeroSection>
    </section>
  );
}
