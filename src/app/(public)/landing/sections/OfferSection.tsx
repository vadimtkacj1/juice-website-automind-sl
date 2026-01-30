'use client';

import React from 'react';
import Image from 'next/image';
import styles from './OfferSection.module.css';

export default function OfferSection() {
  const offers = [
    {
      image: '/images/10.jpg',
      title: 'מגשי פירות מעוצבים',
      description: 'מגשים מרשימים בקומפוזיציות ייחודיות – מושלם למרכז שולחן או להגשה אישית',
      alt: 'מגשי פירות מעוצבים'
    },
    {
      image: '/images/11.jpg',
      title: 'קינוחי פירות אישיים',
      description: 'כוסות פירות, שיפודים, מארזים אישיים – נוח, יפה וטעים',
      alt: 'קינוחי פירות אישיים'
    },
    {
      image: '/images/9.jpg',
      title: 'מיצים טבעיים בבקבוקים',
      description: 'מיצים סחוטים במקום, ללא תוספות, אידיאלי לאירועים ולחברות',
      alt: 'מיצים טבעיים בבקבוקים'
    }
  ];

  return (
    <section id="offer" className={styles.offerSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>מה תמצאו אצלנו?</h2>
        </div>

        <div className={styles.offerGrid}>
          {offers.map((offer, index) => (
            <div key={index} className={styles.offerCard}>
              <div className={styles.offerImageWrapper}>
                <Image
                  src={offer.image}
                  alt={offer.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className={styles.offerCardImage}
                  loading="lazy"
                  quality={85}
                />
                <div className={styles.offerImageOverlay}></div>
              </div>
              <div className={styles.offerCardContent}>
                <h3 className={styles.offerCardTitle}>{offer.title}</h3>
                <p className={styles.offerCardDescription}>{offer.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
