'use client';

import HeroSection from '@/components/HeroSection';
import styles from './accessibility.module.css';

export default function AccessibilityPage() {
  return (
    <div className={styles['legal-page']}>
      <HeroSection backgroundImage="https://images.unsplash.com/photo-1628178652615-3974c5d63f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1M3wxfDB8c2VhcjI2Mnx8anVpY2UlMjBiYXJ8ZW58MHx8fHwxNzA5NDc0NDcxfDA&ixlib=rb-4.0.3&q=80&w=1080">
        <h1 className="hero-title">{'הצהרת נגישות'}</h1>
      </HeroSection>

      <div className={styles['legal-content']} dir="rtl">
        <div className={styles.container}>
          <div className={styles['legal-section']}>
            <p className={styles['last-updated']}>{'עודכן לאחרונה:'} {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2>1. המחויבות שלנו לנגישות</h2>
              <p>
                ראביבה מחויבת להבטיח נגישות דיגיטלית לאנשים עם מוגבלויות. אנו משפרים ללא הרף את חוויית המשתמש עבור כולם ומיישמים את תקני הנגישות הרלוונטיים.
              </p>
            </section>

            <section>
              <h2>2. סטטוס התאמה</h2>
              <p>
                הנחיות נגישות תוכן האינטרנט (WCAG) מגדירות דרישות למעצבים ומפתחים לשיפור הנגישות לאנשים עם מוגבלויות. הן מגדירות שלוש רמות התאמה: רמה A, רמה AA ורמה AAA. אתר זה תואם חלקית ל-WCAG 2.1 רמה AA.
              </p>
              <p>
                התאמה חלקית משמעה שחלקים מסוימים מהתוכן אינם עומדים במלואם בתקן הנגישות.
              </p>
            </section>

            <section>
              <h2>3. תכונות נגישות</h2>
              <p>האתר שלנו כולל את תכונות הנגישות הבאות:</p>
              <ul>
                <li><strong>ניווט במקלדת:</strong> ניתן לגשת לכל האלמנטים האינטראקטיביים באמצעות מקלדת</li>
                <li><strong>תמיכה בקורא מסך:</strong> HTML סמנטי נכון ותוויות ARIA לטכנולוגיות מסייעות</li>
                <li><strong>חלופות טקסט:</strong> טקסט חלופי לתמונות ולתוכן שאינו טקסט</li>
                <li><strong>ניגודיות צבע:</strong> יחסי ניגודיות צבע מספיקים לקריאות</li>
                <li><strong>טקסט בגודל משתנה:</strong> ניתן לשנות את גודל הטקסט עד 200% ללא אובדן פונקציונליות</li>
                <li><strong>אינדיקטורי פוקוס:</strong> אינדיקטורי פוקוס נראים לניווט במקלדת</li>
                <li><strong>טפסים נגישים:</strong> שדות טופס מסומנים כראוי עם זיהוי שגיאות</li>
                <li><strong>דילוג על ניווט:</strong> קישורי דילוג לתוכן הראשי למשתמשי קורא מסך</li>
              </ul>
            </section>

            <section>
              <h2>4. טכנולוגיות מסייעות</h2>
              <p>אתר זה תוכנן להיות תואם לטכנולוגיות המסייעות הבאות:</p>
              <ul>
                <li>קוראי מסך (NVDA, JAWS, VoiceOver)</li>
                <li>תוכנת הגדלת מסך</li>
                <li>תוכנת זיהוי דיבור</li>
                <li>ניווט במקלדת בלבד</li>
                <li>התקני קלט חלופיים</li>
              </ul>
            </section>

            <section>
              <h2>5. מגבלות ידועות</h2>
              <p>למרות מאמצינו להבטיח נגישות, ייתכנו מגבלות מסוימות. להלן בעיות ידועות:</p>
              <ul>
                <li>תוכן צד שלישי מסוים עשוי שלא להיות נגיש במלואו</li>
                <li>מסמכי PDF ישנים עשויים שלא לעמוד בתקני הנגישות הנוכחיים</li>
                <li>סרטונים מוטמעים מסוימים עשויים להיות חסרי כתוביות או תמלילים</li>
              </ul>
              <p>אנו עובדים לטפל בבעיות אלו ולשפר את הנגישות בכל האתר שלנו.</p>
            </section>

            <section>
              <h2>6. מפרטים טכניים</h2>
              <p>נגישות אתר זה מסתמכת על הטכנולוגיות הבאות:</p>
              <ul>
                <li>HTML5</li>
                <li>CSS3</li>
                <li>JavaScript</li>
                <li>WAI-ARIA</li>
              </ul>
              <p>טכנולוגיות אלה נדרשות להתאמה לתקני הנגישות שבהם נעשה שימוש.</p>
            </section>

            <section>
              <h2>7. בדיקה והערכה</h2>
              <p>האתר שלנו נבדק בשיטות הבאות:</p>
              <ul>
                <li>כלי בדיקת נגישות אוטומטיים</li>
                <li>בדיקה ידנית עם ניווט במקלדת</li>
                <li>בדיקת קורא מסך</li>
                <li>ניתוח ניגודיות צבע</li>
                <li>בדיקת משתמשים עם אנשים עם מוגבלויות</li>
              </ul>
            </section>

            <section>
              <h2>8. כלי נגישות</h2>
              <p>אנו מספקים ווידג'ט נגישות באתר שלנו המאפשר לך:</p>
              <ul>
                <li>התאמת גודל טקסט</li>
                <li>הגברת ניגודיות</li>
                <li>הפעלת טקסט לדיבור</li>
                <li>הדגשת קישורים</li>
                <li>שימוש במדריך קריאה</li>
                <li>התאמת ריווח אותיות ושורות</li>
              </ul>
            </section>

            <section>
              <h2>9. משוב ותלונות</h2>
              <p>
                אנו מברכים על המשוב שלך לגבי נגישות אתר זה. אם אתה נתקל במחסומי נגישות, אנא הודע לנו:
              </p>
              <ul>
                <li><strong>{'אימייל:'}</strong> accessibility@reviva.com</li>
                <li><strong>{'טלפון:'}</strong> +972 50-123-4567</li>
              </ul>
              <p>
                אנו שואפים להגיב למשוב נגישות תוך 5 ימי עסקים ולהציע פתרון תוך 10 ימי עסקים.
              </p>
            </section>

            <section>
              <h2>10. מאמצים מתמשכים</h2>
              <p>אנו מחויבים לשיפור מתמיד של נגישות האתר שלנו:</p>
              <ul>
                <li>ביקורות ובדיקות נגישות קבועות</li>
                <li>הכשרת צוות על שיטות עבודה מומלצות לנגישות</li>
                <li>הכללת נגישות בתהליך העיצוב והפיתוח שלנו</li>
                <li>ניטור ועדכון תכונות נגישות</li>
                <li>יצירת קשר עם קהילת האנשים עם מוגבלויות למשוב</li>
              </ul>
            </section>

            <section>
              <h2>11. דרישות משפטיות</h2>
              <p>
                הצהרת נגישות זו היא בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלויות (התאמות נגישות לשירות), תשע"ג-2013, ולהנחיות נגישות תוכן האינטרנט (WCAG) 2.1.
              </p>
            </section>

            <section>
              <h2>12. תאריך ההצהרה</h2>
              <p>
                הצהרת נגישות זו נוצרה בתאריך {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })} ונבדקה לאחרונה באותו תאריך.
              </p>
            </section>

            <section>
              <h2>13. פרטי יצירת קשר</h2>
              <p>אם יש לך שאלות או שאתה זקוק לסיוע בנגישות, אנא צור איתנו קשר:</p>
              <ul>
                <li><strong>רכז נגישות:</strong> [Name]</li>
                <li><strong>{'אימייל:'}</strong> accessibility@reviva.com</li>
                <li><strong>{'טלפון:'}</strong> +972 50-123-4567</li>
                <li><strong>כתובת:</strong> [Your Business Address]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
