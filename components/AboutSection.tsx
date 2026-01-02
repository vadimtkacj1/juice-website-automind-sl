'use client';

import React from 'react';
import { Heart, Leaf, Users, Award } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="about-section" aria-labelledby="about-title">
      <div className="container">
        {/* Who We Are Section */}
        <article className="about-block">
          <div className="about-content">
            <div className="about-text">
              <h2 id="about-title" className="about-title">מי אנחנו</h2>
              <p className="about-description">
                ברוכים הבאים לנטורליי מרענן - היעד שלכם למיצים טבעיים טריים ומשקאות פרימיום! אנחנו חנות פרימיום המתמחה במיצים טבעיים מפירות וירקות טריים, סמוזי, מיצי פירות, סלטי פירות וצלחות בריאות.
              </p>
              <p className="about-description">
                כל יום, אנחנו מכינים את המוצרים שלנו מהפירות והירקות הטריים ביותר, שמגיעים ישירות מחוות מקומיות מהימנות. בין אם אתם מחפשים סמוזי מרענן, מיץ מזין, סלט פירות צבעוני, או צלחת בריאות מלאה - יש לנו בדיוק מה שאתם צריכים כדי לטפח את הגוף שלכם ולשמח את בלוטות הטעם שלכם.
              </p>
            </div>
          </div>
        </article>

        {/* What We Do Section */}
        <article className="about-block">
          <div className="about-content">
            <div className="about-text">
              <h2 className="about-title">מה אנחנו עושים</h2>
              <p className="about-description">
                בנטורליי מרענן, אנחנו מציעים מגוון מלא של מוצרי פירות טריים:
              </p>
              <ul className="about-list" role="list">
                <li>מיצים טבעיים טריים - מוכנים מדי יום מהפירות והירקות הטובים ביותר</li>
                <li>סמוזי טעימים - שילובים קרמיים ומרעננים עמוסים בוויטמינים</li>
                <li>סלטי פירות צבעוניים - פירות עונתיים טריים חתוכים ומוכנים לפי הזמנה</li>
                <li>צלחות בריאות - ארוחות מזינות מלאות עם פירות, ירקות ועוד</li>
                <li>מוצרי פירות טריים - פירות באיכות פרימיום מוכנים לקחת הביתה</li>
              </ul>
              <p className="about-description">
                הכל מוכן טרי מדי יום, ללא חומרים משמרים או תוספים מלאכותיים. רק טוב טבעי טהור שהגוף שלכם יאהב!
              </p>
            </div>
          </div>
        </article>

        {/* Values Grid */}
        <div className="values-grid" role="list" aria-label="הערכים שלנו">
          <article className="value-card" role="listitem">
            <div className="value-icon-wrapper" aria-hidden="true">
              <Leaf size={32} />
            </div>
            <h3 className="value-title">100% טבעי</h3>
            <p className="value-description">
              אנחנו משתמשים רק במרכיבים טריים ואורגניים ללא תוספים מלאכותיים או חומרים משמרים.
            </p>
          </article>

          <article className="value-card" role="listitem">
            <div className="value-icon-wrapper" aria-hidden="true">
              <Heart size={32} />
            </div>
            <h3 className="value-title">בריאות קודמת</h3>
            <p className="value-description">
              כל מתכון מתוכנן לתמוך במסע הבריאות שלכם ולטפח את הגוף שלכם.
            </p>
          </article>

          <article className="value-card" role="listitem">
            <div className="value-icon-wrapper" aria-hidden="true">
              <Users size={32} />
            </div>
            <h3 className="value-title">ממוקד בקהילה</h3>
            <p className="value-description">
              אנחנו מחויבים לתמוך בחקלאים מקומיים ולבנות קהילה בריאה יותר.
            </p>
          </article>

          <article className="value-card" role="listitem">
            <div className="value-icon-wrapper" aria-hidden="true">
              <Award size={32} />
            </div>
            <h3 className="value-title">איכות פרימיום</h3>
            <p className="value-description">
              אנחנו שומרים על הסטנדרטים הגבוהים ביותר בכל שלב בתהליך הייצור שלנו.
            </p>
          </article>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: 80px 20px;
          background: var(--white);
        }

        .about-block {
          margin-block-end: 80px;
        }

        .about-block:last-of-type {
          margin-block-end: 60px;
        }

        .about-content {
          max-width: 900px;
          margin-inline: auto;
        }

        .about-text {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .about-title {
          font-family: 'Heebo', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 900;
          color: var(--dark);
          margin: 0 0 32px 0;
          line-height: 1.1;
          text-align: right;
          letter-spacing: -0.02em;
        }

        .about-description {
          font-size: clamp(16px, 1.5vw, 20px);
          line-height: 1.7;
          color: var(--text-gray);
          margin: 0;
          font-weight: 700;
          text-align: right;
        }

        .about-list {
          list-style: none;
          padding: 0;
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-list li {
          font-size: clamp(15px, 1.3vw, 18px);
          line-height: 1.7;
          color: var(--text-gray);
          padding-inline-start: 28px;
          position: relative;
          font-weight: 700;
        }

        .about-list li::before {
          content: '•';
          position: absolute;
          right: 0;
          color: var(--primary);
          font-weight: 900;
          font-size: 24px;
        }

        @media (max-width: 980px) {
          .about-section {
            padding: 60px 16px;
          }

          .about-block {
            margin-block-end: 50px;
          }

          .about-title {
            margin-block-end: 24px;
          }

          .about-list li {
            padding-inline-start: 24px;
          }
        }

        @media (max-width: 640px) {
          .about-section {
            padding: 40px 12px;
          }

          .about-block {
            margin-block-end: 40px;
          }

          .about-title {
            font-size: clamp(36px, 10vw, 64px);
            margin-block-end: 20px;
          }

          .about-list li {
            padding-inline-start: 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
