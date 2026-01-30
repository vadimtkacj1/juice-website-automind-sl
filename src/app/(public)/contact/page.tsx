'use client';

import { Phone, Mail, MessageSquare, Clock, MapPin, ArrowLeft } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import styles from './contact.module.css';

export default function ContactPage() {
  return (
    <div className={styles['contact-page']} dir="rtl">
      <HeroSection showFloatingOranges={false} showOverlay={false} backgroundColor="#1a365d">
        <h1 className="hero-title">צור קשר</h1>
      </HeroSection>

      <div className={styles['contact-content']}>
        
        {/* Main Contacts: Phone & Address */}
        <div className={styles['top-grid']}>
          <section className={styles['info-section']}>
            <div className={styles['section-header']}>
              <Phone size={36} strokeWidth={3} />
              <span>התקשרו אלינו</span>
            </div>
            <a href="tel:031234567" className={styles['section-value']}>03-1234567</a>
            <p className={styles['section-desc']}>שירות לקוחות פעיל בימים א-ה, 9:00-18:00</p>
          </section>

          <section className={styles['info-section']}>
            <div className={styles['section-header']}>
              <MapPin size={36} strokeWidth={3} />
              <span>בואו לבקר</span>
            </div>
            <div className={styles['section-value']}>דב הוז 63, חולון</div>
            <p className={styles['section-desc']}>המיקום המרכזי שלנו - מחכים לכם עם מיץ טרי!</p>
          </section>
        </div>

        {/* Secondary Action Links */}
        <div className={styles['links-row']}>
          <a href="https://wa.me/972501234567" className={styles['action-link']}>
            <MessageSquare size={40} color="#ed810e" strokeWidth={2.5} />
            <div className={styles['link-text-wrapper']}>
              <div className={styles['link-title']}>וואטסאפ</div>
              <div className={styles['link-sub']} dir="ltr">+972 50 123 4567</div>
            </div>
            <ArrowLeft className={styles['arrow-icon']} size={28} />
          </a>

          <a href="mailto:info@reviva.co.il" className={styles['action-link']}>
            <Mail size={40} color="#ed810e" strokeWidth={2.5} />
            <div className={styles['link-text-wrapper']}>
              <div className={styles['link-title']}>שלחו לנו מייל</div>
              <div className={styles['link-sub']}>info@reviva.co.il</div>
            </div>
            <ArrowLeft className={styles['arrow-icon']} size={28} />
          </a>
        </div>

        {/* Business Hours & Footer Section */}
        <div className={styles['top-grid']} style={{borderBottom: 'none'}}>
          <section className={styles['info-section']}>
            <div className={styles['section-header']}>
              <Clock size={36} strokeWidth={3} />
              <span>שעות פעילות</span>
            </div>
            <div className={styles['hours-table']}>
              <div className={styles['hours-row']}>
                <span className={styles['day-name']}>יום ראשון</span>
                <span>08:00 - 20:00</span>
              </div>
              <div className={styles['hours-row']}>
                <span className={styles['day-name']}>יום שני</span>
                <span>08:00 - 20:00</span>
              </div>
              <div className={styles['hours-row']}>
                <span className={styles['day-name']}>יום שלישי</span>
                <span>08:00 - 20:00</span>
              </div>
            </div>
          </section>

          <section className={styles['info-section']} style={{justifyContent: 'center'}}>
            <div className={styles['section-header']}>
              <MapPin size={36} strokeWidth={3} />
              <span>הסניפים שלנו</span>
            </div>
            <p className={styles['section-desc']}>
              אנחנו פרוסים במספר מוקדים. מצאו את הסניף הקרוב אליכם ביותר.
            </p>
            <a href="/locations" className={`${styles['action-link']} ${styles['full-width-btn']}`}>
              <span className={styles['link-title']} style={{fontSize: '22px', marginBottom: 0}}>צפה בכל המיקומים</span>
              <ArrowLeft className={styles['arrow-icon']} size={24} />
            </a>
          </section>
        </div>

      </div>
    </div>
  );
}