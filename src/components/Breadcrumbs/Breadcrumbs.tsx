import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    /* dir="rtl" handles the flow; standard Flexbox will now start from the right */
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb" dir="rtl">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className={styles.item}>
              {!isLast ? (
                <>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                  {/* The separator points leftwards, moving "deeper" into the site structure */}
                  <ChevronLeft className={styles.separator} size={14} />
                </>
              ) : (
                /* Current page: Rendered as a span for UX/SEO (not clickable) */
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}