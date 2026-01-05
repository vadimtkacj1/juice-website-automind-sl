'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import AboutSection from '@/components/AboutSection';

interface Contact {
  id: number;
  type: string;
  value: string;
}

export default function HomePage() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhoneNumber() {
      try {
        const response = await fetch('/api/contacts');
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();
        const phoneContact = data.contacts.find((contact: Contact) => contact.type === 'phone');
        if (phoneContact) {
          setPhoneNumber(phoneContact.value);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
      }
    }

    fetchPhoneNumber();
  }, []);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "נטורליי מרענן - מיצים טבעיים",
    "alternateName": "Naturalay Refreshing",
    "url": "https://www.reviva.com",
    "logo": "/images/logo.png",
    "description": "חנות מיצים טבעיים טריים, סמוזי, סלטי פירות וצלחות בריאות. מוצרים טריים מדי יום ללא חומרים משמרים.",
    "sameAs": [
      "https://www.facebook.com/reviva",
      "https://www.instagram.com/reviva",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phoneNumber || "",
      "contactType": "customer service",
      "availableLanguage": ["Hebrew", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IL"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "נטורליי מרענן",
    "image": "/og-image.jpg",
    "priceRange": "$$",
    "servesCuisine": "מיצים טבעיים, סמוזי, מזון בריא",
    "telephone": phoneNumber || "",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IL"
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      {phoneNumber && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          />
        </>
      )}
      
      {/* Hero Section with Floating Oranges */}
      <HeroSection showFloatingOranges={true}>
        <h1 className="hero-title">טבעי שזה מרענן</h1>
      </HeroSection>
      
      {/* About Section */}
      <AboutSection />
      
      {/* News Section */}
      <NewsSection />
    </>
  );
}
