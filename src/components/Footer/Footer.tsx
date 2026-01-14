import Link from 'next/link';
import { translateToHebrew } from '@/lib/translations';
import styles from './Footer.module.css';

const footerLinks = [
  { href: '/', label: translateToHebrew('Home') },
  { href: '/menu', label: translateToHebrew('Menu') },
  { href: '/locations', label: translateToHebrew('Locations') },
  { href: '/contact', label: translateToHebrew('Contact') },
];

const legalLinks = [
  { href: '/privacy', label: translateToHebrew('Privacy Policy') },
  { href: '/terms', label: translateToHebrew('Terms & Conditions') },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footerMain} role="contentinfo" aria-label="כותרת תחתונה">
      {/* Brand Name */}
      <div className={styles.footerBrand} aria-label="שם המותג">
        נטורליי מרענן
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
        © {currentYear} נטורליי מרענן. כל הזכויות שמורות.
      </p>
    </footer>
  );
}
