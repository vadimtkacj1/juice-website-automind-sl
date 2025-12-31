'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import ShopSection from '@/components/ShopSection';
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
    "name": "Reviva",
    "url": "https://www.reviva.com", // Replace with your actual website URL
    "logo": "https://framerusercontent.com/images/K2ZYusAMck7jg9gN9jfI2FAslA.svg", // Replace with your actual logo URL
    "sameAs": [
      "https://www.facebook.com/reviva", // Replace with your actual Facebook page
      "https://www.instagram.com/reviva", // Replace with your actual Instagram page
      // Add other social media profiles as needed
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phoneNumber || "", // Dynamically fetched phone number
      "contactType": "customer service"
    }
  };

  return (
    <>
      {phoneNumber && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      )}
      <HeroSection>
        <h1 className="hero-title">REVIVA</h1>
      </HeroSection>
      <AboutSection />
      <NewsSection />
    </>
  );
}