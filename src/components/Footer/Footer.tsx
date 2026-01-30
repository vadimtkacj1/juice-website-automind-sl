import Link from 'next/link';
import styles from './Footer.module.css';

const footerLinks = [
  { href: '/menu', label: 'תפריט' },
  { href: '/locations', label: 'מיקומים' },
  { href: '/contact', label: 'צור קשר' },
];

const legalLinks = [
  { href: '/privacy', label: 'מדיניות פרטיות' },
  { href: '/terms', label: 'תנאים והגבלות' },
  { href: '/accessibility', label: 'הצהרת נגישות' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footerMain} role="contentinfo" aria-label="כותרת תחתונה">
      {/* Brand Name */}
      <div className={styles.footerBrand} aria-label="שם המותג">
        טבעי שזה מרענן
      </div>

      {/* Navigation Links */}
      <nav className={styles.footerLinks} aria-label="ניווט תחתון">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.footerNavLink}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Legal Links */}
      <div className={styles.footerLegal}>
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.legalLink}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Copyright */}
      <p className={styles.footerCopyright}>
        © {currentYear} טבעי שזה מרענן. כל הזכויות שמורות.
      </p>
    </footer>
  );
}
