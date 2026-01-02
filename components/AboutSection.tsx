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

    </section>
  );
};

export default AboutSection;
