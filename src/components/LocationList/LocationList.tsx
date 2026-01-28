import React from 'react';
import { MapPin } from 'lucide-react';
import LocationCard from './components/LocationCard/LocationCard';
import { Location } from '@/types/location';
interface LocationListProps {
  locations: Location[];
}

export default function LocationList({ locations }: LocationListProps) {
  return (
    <div className="py-12 rounded-b-2xl bg-white relative z-10">
      {locations.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">{'אין מיקומים זמינים כרגע.'}</p>
        </div>
      ) : locations.length === 1 ? (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <LocationCard location={locations[0]} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      )}
    </div>
  );
}

