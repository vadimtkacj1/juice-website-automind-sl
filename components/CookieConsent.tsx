'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <>
      {isVisible && (
        <>
          <div className="cookie-consent-overlay" aria-hidden="true" />
          <div className="cookie-consent" role="dialog" aria-labelledby="cookie-title" aria-modal="true" style={{ display: isVisible ? 'block' : 'none' }}>
        <div className="cookie-consent-header">
          <div className="cookie-consent-icon">
            <Cookie size={24} />
          </div>
          <h2 id="cookie-title" className="cookie-consent-title">
            עוגיות באתר
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="cookie-consent-close"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cookie-consent-content">
          {!isExpanded ? (
            <>
              <p className="cookie-consent-text">
                אנו משתמשים בעוגיות כדי לשפר את החוויה שלך באתר, לנתח את השימוש באתר ולעזור לנו בשיווק.
                על ידי המשך השימוש באתר, אתה מסכים לשימוש בעוגיות בהתאם למדיניות הפרטיות שלנו.
              </p>
              <div className="cookie-consent-actions">
                <button
                  onClick={acceptAll}
                  className="cookie-consent-btn cookie-consent-btn-primary"
                >
                  קבל הכל
                </button>
                <button
                  onClick={acceptNecessary}
                  className="cookie-consent-btn cookie-consent-btn-secondary"
                >
                  רק הכרחיות
                </button>
                <button
                  onClick={customizePreferences}
                  className="cookie-consent-btn cookie-consent-btn-link"
                >
                  התאם העדפות
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="cookie-consent-text">
                בחר את סוגי העוגיות שאתה מאפשר:
              </p>
              <div className="cookie-consent-preferences">
                <div className="cookie-preference-item">
                  <div className="cookie-preference-info">
                    <h3>עוגיות הכרחיות</h3>
                    <p>עוגיות אלה נחוצות לפעולת האתר ואי אפשר לבטל אותן.</p>
                  </div>
                  <div className="cookie-preference-toggle disabled">
                    <span className="cookie-toggle-slider"></span>
                  </div>
                </div>
                <div className="cookie-preference-item">
                  <div className="cookie-preference-info">
                    <h3>עוגיות אנליטיקה</h3>
                    <p>עוזרות לנו להבין איך מבקרים משתמשים באתר.</p>
                  </div>
                  <label className="cookie-preference-toggle">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                </div>
                <div className="cookie-preference-item">
                  <div className="cookie-preference-info">
                    <h3>עוגיות שיווק</h3>
                    <p>משמשות להצגת פרסומות מותאמות אישית.</p>
                  </div>
                  <label className="cookie-preference-toggle">
                    <input
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="cookie-consent-actions">
                <button
                  onClick={saveCustomPreferences}
                  className="cookie-consent-btn cookie-consent-btn-primary"
                >
                  שמור העדפות
                </button>
                <Link
                  href="/privacy"
                  className="cookie-consent-link"
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
      )}
    </>
  );
}

