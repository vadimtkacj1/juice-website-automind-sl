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
  return (
    <footer className="footer-main">
      <div className="footer-brand">REVIVA</div>

      <div className="footer-links">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="menu-item white-link">
            <div className="roll-inner">
              <span>{link.label}</span>
              <span className="hvr">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="footer-legal">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="legal-link">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
