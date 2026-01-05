'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import LocationList from '@/components/LocationList';
import HeroSection from '@/components/HeroSection';
import { Location } from '@/types/location';
import { translateToHebrew } from '@/lib/translations';

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
        <LoadingSpinner size="lg" text={translateToHebrew('Loading locations...')} />
      </div>
    );
  }

  return (
    <div>
      <HeroSection>
        <h1 className="hero-title">{translateToHebrew('OUR LOCATIONS')}</h1>
        <p className="hero-subtitle">{translateToHebrew('Find us at a location near you!')}</p>
      </HeroSection>
      <div className="mx-[15px]">
        <LocationList locations={locations} />
      </div>
    </div>
  );
}
