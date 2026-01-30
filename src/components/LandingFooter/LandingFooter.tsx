'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import styles from './LandingFooter.module.css';

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Brand */}
          <div className={styles.brandSection}>
            <h3 className={styles.brandName}>טבעי שזה מרענן</h3>
            <p className={styles.brandTagline}>
              מגשי פירות מעוצבים וקינוחי פירות לאירועים שלא שוכחים
            </p>
          </div>

          {/* Contact Info */}
          <div className={styles.contactSection}>
            <h4 className={styles.sectionTitle}>צור קשר</h4>
            <div className={styles.contactList}>
              <a href="tel:052-678-0739" className={styles.contactItem}>
                <Phone size={18} />
                <span>052-678-0739</span>
              </a>
              <a href="mailto:info@example.com" className={styles.contactItem}>
                <Mail size={18} />
                <span>info@example.com</span>
              </a>
              <div className={styles.contactItem}>
                <MapPin size={18} />
                <span>אזור המרכז, ישראל</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>קישורים מהירים</h4>
            <nav className={styles.linksList}>
              <Link href="/menu" className={styles.link}>
                תפריט
              </Link>
              <Link href="/locations" className={styles.link}>
                סניפים
              </Link>
              <Link href="/contact" className={styles.link}>
                צור קשר
              </Link>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} טבעי שזה מרענן. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
