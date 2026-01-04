import Link from 'next/link';
import { translateToHebrew } from '@/lib/translations';

const navLinks = [
  { href: '/', label: translateToHebrew('Home') },
  { href: '/menu', label: translateToHebrew('Menu') },
  { href: '/locations', label: translateToHebrew('Locations') },
  { href: '/contact', label: translateToHebrew('Contact') },
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
