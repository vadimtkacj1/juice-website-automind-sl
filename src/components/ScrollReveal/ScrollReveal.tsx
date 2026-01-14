'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // Hero animation with delay
    const hero = document.getElementById('hero');
    if (hero) {
      setTimeout(() => {
        hero.classList.add('active');
      }, 100);
    }

    // Enhanced Intersection Observer with multiple animation types
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Don't observe again after animation
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all reveal elements
    const targets = document.querySelectorAll<HTMLElement>('.reveal, .reveal-fade, .reveal-slide, .reveal-scale, .reveal-rotate');
    targets.forEach((el) => observer.observe(el));

    // Animate letters in hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && heroTitle.textContent && !heroTitle.querySelector('.letter')) {
      const text = heroTitle.textContent;
      // Clear existing content safely - use textContent to avoid DOM manipulation issues
      // Store the text first, then clear and rebuild
      const letters = text.split('');
      heroTitle.textContent = ''; // Clear all content at once
      
      letters.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--d', `${index * 0.03}s`);
        if (heroTitle && heroTitle.parentNode) {
          heroTitle.appendChild(span);
        }
      });
    }

    // Parallax effect for hero images
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll<HTMLElement>('.parallax');
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0.5');
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}

