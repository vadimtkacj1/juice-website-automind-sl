'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import LocationList from '@/components/LocationList';
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
    <>
      {/* Locations Hero Section */}
      <section className="locations-hero">
        <div className="locations-hero-content">
          <h1 className="locations-hero-title">{translateToHebrew('OUR LOCATIONS')}</h1>
          <p className="locations-hero-subtitle">{translateToHebrew('Find us at a location near you!')}</p>
        </div>
      </section>
      <LocationList locations={locations} />
      
      <style jsx>{`
        .locations-hero {
          background: #7322ff;
          border-radius: var(--radius-md);
          margin: 15px;
          padding: 80px 20px;
          text-align: center;
          color: white;
          min-height: 40vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .locations-hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .locations-hero-title {
          font-family: 'Heebo', sans-serif;
          font-size: 120px;
          font-weight: 900;
          color: white;
          margin: 0 0 20px 0;
          line-height: 1.1;
        }
        
        .locations-hero-subtitle {
          font-family: 'Heebo', sans-serif;
          font-size: 40px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.4;
        }
        
        @media (max-width: 768px) {
          .locations-hero {
            margin: 10px;
            padding: 60px 20px;
            min-height: 30vh;
          }
          .locations-hero-title {
            font-size: 96px;
          }
          .locations-hero-subtitle {
            font-size: 36px;
          }
        }
        
        @media (max-width: 480px) {
          .locations-hero {
            margin: 8px;
            padding: 50px 16px;
            min-height: 25vh;
          }
          .locations-hero-title {
            font-size: 64px;
          }
          .locations-hero-subtitle {
            font-size: 32px;
          }
        }
      `}</style>
    </>
  );
}
