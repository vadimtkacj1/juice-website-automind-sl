'use client';

import React from 'react';
import { Heart, Leaf, Users, Award } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="container">
        {/* Who We Are Section */}
        <div className="about-block">
          <div className="about-content">
            <div className="about-text">
              <h2 className="about-title">מי אנחנו</h2>
              <p className="about-description">
                ברוכים הבאים לנטורליי מרענן - היעד שלכם למיצים טבעיים טריים ומשקאות פרימיום! אנחנו חנות פרימיום המתמחה במיצים טבעיים מפירות וירקות טריים, סמוזי, מיצי פירות, סלטי פירות וצלחות בריאות.
              </p>
              <p className="about-description">
                כל יום, אנחנו מכינים את המוצרים שלנו מהפירות והירקות הטריים ביותר, שמגיעים ישירות מחוות מקומיות מהימנות. בין אם אתם מחפשים סמוזי מרענן, מיץ מזין, סלט פירות צבעוני, או צלחת בריאות מלאה - יש לנו בדיוק מה שאתם צריכים כדי לטפח את הגוף שלכם ולשמח את בלוטות הטעם שלכם.
              </p>
            </div>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="about-block">
          <div className="about-content">
            <div className="about-text">
              <h2 className="about-title">מה אנחנו עושים</h2>
              <p className="about-description">
                בנטורליי מרענן, אנחנו מציעים מגוון מלא של מוצרי פירות טריים:
              </p>
              <ul className="about-list">
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
        </div>

        {/* Values Grid */}
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon-wrapper">
              <Leaf size={32} />
            </div>
            <h3 className="value-title">100% טבעי</h3>
            <p className="value-description">
              אנחנו משתמשים רק במרכיבים טריים ואורגניים ללא תוספים מלאכותיים או חומרים משמרים.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon-wrapper">
              <Heart size={32} />
            </div>
            <h3 className="value-title">בריאות קודמת</h3>
            <p className="value-description">
              כל מתכון מתוכנן לתמוך במסע הבריאות שלכם ולטפח את הגוף שלכם.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon-wrapper">
              <Users size={32} />
            </div>
            <h3 className="value-title">ממוקד בקהילה</h3>
            <p className="value-description">
              אנחנו מחויבים לתמוך בחקלאים מקומיים ולבנות קהילה בריאה יותר.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon-wrapper">
              <Award size={32} />
            </div>
            <h3 className="value-title">איכות פרימיום</h3>
            <p className="value-description">
              אנחנו שומרים על הסטנדרטים הגבוהים ביותר בכל שלב בתהליך הייצור שלנו.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: 80px 20px;
          background: var(--white);
        }

        .about-block {
          margin-bottom: 80px;
        }

        .about-block:last-of-type {
          margin-bottom: 60px;
        }

        .about-content {
          max-width: 900px;
          margin: 0 auto;
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
          font-size: 20px;
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
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-gray);
          padding-right: 28px;
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


        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          max-width: 1000px;
          margin: 60px auto 0;
        }

        .value-card {
          background: var(--gray-bg);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
        }

        .value-card:hover {
          background: var(--secondary);
        }

        .value-icon-wrapper {
          width: 70px;
          height: 70px;
          background: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: var(--primary);
        }

        .value-card:hover .value-icon-wrapper {
          background: var(--primary);
          color: var(--white);
        }

        .value-title {
          font-family: 'Heebo', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: var(--dark);
          margin: 0 0 12px 0;
        }

        .value-description {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-gray);
          margin: 0;
          font-weight: 700;
        }

        @media (max-width: 980px) {
          .about-section {
            padding: 60px 16px;
          }

          .about-block {
            margin-bottom: 50px;
          }

          .about-title {
            margin-bottom: 24px;
          }

          .about-description {
            font-size: 18px;
          }

          .about-list li {
            font-size: 16px;
            padding-right: 24px;
          }

          .values-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 50px;
          }
        }

        @media (max-width: 640px) {
          .about-section {
            padding: 40px 12px;
          }

          .about-block {
            margin-bottom: 40px;
          }

          .about-title {
            font-size: clamp(36px, 10vw, 64px);
            margin-bottom: 20px;
          }

          .about-description {
            font-size: 16px;
          }

          .about-list li {
            font-size: 15px;
            padding-right: 20px;
          }

          .values-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-top: 40px;
          }

          .value-card {
            padding: 24px 20px;
          }

          .value-icon-wrapper {
            width: 60px;
            height: 60px;
            margin-bottom: 16px;
          }

          .value-title {
            font-size: 20px;
          }

          .value-description {
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;

