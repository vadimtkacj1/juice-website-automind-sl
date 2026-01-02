import Link from 'next/link';
import { translateToHebrew } from '@/lib/translations';

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
    <footer className="footer-main" role="contentinfo" aria-label="כותרת תחתונה">
      {/* Brand Name */}
      <div className="footer-brand" aria-label="שם המותג">
        נטורליי מרענן
      </div>

      {/* Navigation Links */}
      <nav className="footer-links" aria-label="ניווט תחתון">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="menu-item white-link">
            <div className="roll-inner">
              <span>{link.label}</span>
              <span className="hvr">{link.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Legal Links */}
      <div className="footer-legal">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="legal-link">
            {link.label}
          </Link>
        ))}
      </div>

      {/* Copyright */}
      <p className="footer-copyright">
        © {currentYear} נטורליי מרענן. כל הזכויות שמורות.
      </p>

      <style jsx>{`
        .footer-copyright {
          color: rgba(29, 26, 64, 0.6);
          font-size: clamp(12px, 1vw, 14px);
          font-weight: 500;
          margin-block-start: 20px;
        }
      `}</style>
    </footer>
  );
}
