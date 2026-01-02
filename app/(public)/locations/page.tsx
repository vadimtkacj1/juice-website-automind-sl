'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import LocationList from '@/components/LocationList';
import { Location } from '@/types/location';
import { translateToHebrew } from '@/lib/translations';
import styles from './locations.module.css';

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
    <>
      {/* Locations Hero Section */}
      <section className={styles['locations-hero']}>
        <div className={styles['locations-hero-content']}>
          <h1 className={styles['locations-hero-title']}>{translateToHebrew('OUR LOCATIONS')}</h1>
          <p className={styles['locations-hero-subtitle']}>{translateToHebrew('Find us at a location near you!')}</p>
        </div>
      </section>
      <LocationList locations={locations} />
    </>
  );
}
