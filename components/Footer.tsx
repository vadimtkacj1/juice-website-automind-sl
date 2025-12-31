import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/locations', label: 'Locations' },
  { href: '/contact', label: 'Contact' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
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
