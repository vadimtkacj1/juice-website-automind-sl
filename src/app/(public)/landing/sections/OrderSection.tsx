'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ArrowLeft } from 'lucide-react';
import styles from './OrderSection.module.css';

export default function OrderSection() {
  return (
    <section id="order" className={styles.orderSection}>
      <div className={styles.container}>
        <div className={styles.orderContent}>
          <h2 className={styles.orderTitle}>הזמנה פשוטה ומהירה</h2>
          <p className={styles.orderDescription}>
            בחרו את המגש שמתאים לכם, הוסיפו מיצים או קינוחים משלימים – ואנחנו כבר נדאג לשאר
          </p>
          <p className={styles.orderSubDescription}>
            משלוחים לכל אזור המרכז, בזמינות גבוהה ובהקפדה מלאה על איכות
          </p>

          <div className={styles.orderCta}>
            <Link href="/menu" className={styles.orderButton}>
              להזמנה דרך החנות האינטרנטית
              <ArrowLeft size={20} />
            </Link>
            <div className={styles.orderDivider}>או</div>
            <a href="tel:052-678-0739" className={styles.orderButtonPhone}>
              <Phone size={24} />
              התקשרו עכשיו: 052-678-0739
            </a>
          </div>
        </div>

        {/* Decorative Fruit Images */}
        <div className={styles.orderDecoration}>
          <div className={styles.decorationFruit1}>
            <Image
              src="/images/apple.webp"
              alt="תפוח"
              width={150}
              height={150}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className={styles.decorationFruit2}>
            <Image
              src="/images/pomegranede.webp"
              alt="רימון"
              width={150}
              height={150}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
