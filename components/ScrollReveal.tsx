'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.classList.add('active');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll<HTMLElement>('.reveal');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}

