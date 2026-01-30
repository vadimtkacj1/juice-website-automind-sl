'use client';

import React from 'react';
import styles from './WhySection.module.css';

export default function WhySection() {
  const reasons = [
    {
      number: '01',
      title: 'עסק משפחתי',
      description: 'יחס אישי וחם לכל לקוח ואירוע'
    },
    {
      number: '02',
      title: 'פירות טריים',
      description: 'פירות נבחרים ואיכותיים מדי יום'
    },
    {
      number: '03',
      title: 'עיצוב מרשים',
      description: 'קומפוזיציות ייחודיות ומושלמות לכל אירוע'
    },
    {
      number: '04',
      title: 'משלוחים מהירים',
      description: 'משלוחים לכל אזור המרכז בזמן'
    }
  ];

  return (
    <section id="why" className={styles.whySection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>למה לבחור בנו?</h2>
        </div>

        <div className={styles.whyGrid}>
          {reasons.map((reason, index) => (
            <div key={index} className={styles.whyCard}>
              <div className={styles.whyNumber}>{reason.number}</div>
              <h3 className={styles.whyCardTitle}>{reason.title}</h3>
              <p className={styles.whyCardDescription}>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
