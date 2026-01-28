import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'תפריט' },
  { href: '/locations', label: 'מיקומים' },
  { href: '/contact', label: 'צור קשר' },
];

export default function DesktopNavigation() {
  return (
    <div className="nav-links">
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className="menu-item">
          <div className="roll-inner">
            <span>{link.label}</span>
            <span className="hvr">{link.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
