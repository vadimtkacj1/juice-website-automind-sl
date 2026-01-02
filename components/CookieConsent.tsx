'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    // Check if user has already accepted cookies
    // For testing: always show after a delay (remove localStorage check temporarily)
    const consent = localStorage.getItem('cookie-consent');
    // Show after a short delay
    const timer = setTimeout(() => {
      setIsVisible(!consent); // Only hide if consent already exists
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: true,
        marketing: true,
      },
    }));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
      },
    }));
    setIsVisible(false);
  };

  const customizePreferences = () => {
    setIsExpanded(true);
  };

  const saveCustomPreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: analyticsEnabled,
        marketing: marketingEnabled,
      },
    }));
    setIsVisible(false);
  };

  // Always render the component structure, but control visibility with CSS
  // This ensures the component is in the DOM

  if (!isVisible) return null;

  return (
    <>
      <div className={styles.cookieConsentOverlay} aria-hidden="true" />
      <div className={styles.cookieConsent} role="dialog" aria-labelledby="cookie-title" aria-modal="true">
        <div className={styles.cookieConsentHeader}>
          <div className={styles.cookieConsentIcon}>
            <Cookie size={24} />
          </div>
          <h2 id="cookie-title" className={styles.cookieConsentTitle}>
            עוגיות באתר
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className={styles.cookieConsentClose}
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.cookieConsentContent}>
          {!isExpanded ? (
            <>
              <p className={styles.cookieConsentText}>
                אנו משתמשים בעוגיות כדי לשפר את החוויה שלך באתר, לנתח את השימוש באתר ולעזור לנו בשיווק.
                על ידי המשך השימוש באתר, אתה מסכים לשימוש בעוגיות בהתאם למדיניות הפרטיות שלנו.
              </p>
              <div className={styles.cookieConsentActions}>
                <button
                  onClick={acceptAll}
                  className={`${styles.cookieConsentBtn} ${styles.cookieConsentBtnPrimary}`}
                >
                  קבל הכל
                </button>
                <button
                  onClick={acceptNecessary}
                  className={`${styles.cookieConsentBtn} ${styles.cookieConsentBtnSecondary}`}
                >
                  רק הכרחיות
                </button>
                <button
                  onClick={customizePreferences}
                  className={`${styles.cookieConsentBtn} ${styles.cookieConsentBtnLink}`}
                >
                  התאם העדפות
                </button>
              </div>
            </>
          ) : (
            <>
              <p className={styles.cookieConsentText}>
                בחר את סוגי העוגיות שאתה מאפשר:
              </p>
              <div className={styles.cookieConsentPreferences}>
                <div className={styles.cookiePreferenceItem}>
                  <div className={styles.cookiePreferenceInfo}>
                    <h3>עוגיות הכרחיות</h3>
                    <p>עוגיות אלה נחוצות לפעולת האתר ואי אפשר לבטל אותן.</p>
                  </div>
                  <div className={`${styles.cookiePreferenceToggle} ${styles.disabled}`}>
                    <span className={styles.cookieToggleSlider}></span>
                  </div>
                </div>
                <div className={styles.cookiePreferenceItem}>
                  <div className={styles.cookiePreferenceInfo}>
                    <h3>עוגיות אנליטיקה</h3>
                    <p>עוזרות לנו להבין איך מבקרים משתמשים באתר.</p>
                  </div>
                  <label className={styles.cookiePreferenceToggle}>
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    />
                    <span className={styles.cookieToggleSlider}></span>
                  </label>
                </div>
                <div className={styles.cookiePreferenceItem}>
                  <div className={styles.cookiePreferenceInfo}>
                    <h3>עוגיות שיווק</h3>
                    <p>משמשות להצגת פרסומות מותאמות אישית.</p>
                  </div>
                  <label className={styles.cookiePreferenceToggle}>
                    <input
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                    />
                    <span className={styles.cookieToggleSlider}></span>
                  </label>
                </div>
              </div>
              <div className={styles.cookieConsentActions}>
                <button
                  onClick={saveCustomPreferences}
                  className={`${styles.cookieConsentBtn} ${styles.cookieConsentBtnPrimary}`}
                >
                  שמור העדפות
                </button>
                <Link
                  href="/privacy"
                  className={styles.cookieConsentLink}
                  onClick={() => setIsVisible(false)}
                >
                  קרא עוד במדיניות הפרטיות
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

