'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeroSection from '@/components/HeroSection';
import LocationList from '@/components/LocationList';
import { Location } from '@/types/location';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      // Filter to only show active locations
      const activeLocations = (data.locations || []).filter((loc: Location) => loc.is_active);
      setLocations(activeLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading locations..." />
      </div>
    );
  }

  return (
    <>
      <HeroSection >
        <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl">OUR LOCATIONS</h1>
        <p className="hero-subtitle text-white mt-4">Find us at a location near you!</p>
      </HeroSection>
      <LocationList locations={locations} />
    </>
  );
}
