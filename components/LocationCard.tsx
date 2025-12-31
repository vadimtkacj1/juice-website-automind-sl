import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import React from 'react';

interface Location {
  id: number;
  country: string;
  city: string;
  address: string;
  hours?: string;
  phone?: string;
  email?: string;
  image?: string;
  map_url?: string;
  is_active: boolean;
  sort_order: number;
}

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <div
      key={location.id}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {location.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={location.image}
            alt={location.city}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{location.city}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {location.country}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">{location.address}</p>
          </div>

          {location.hours && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{location.hours}</p>
            </div>
          )}

          {location.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <a
                href={`tel:${location.phone}`}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                {location.phone}
              </a>
            </div>
          )}

          {location.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <a
                href={`mailto:${location.email}`}
                className="text-gray-600 hover:text-purple-600 transition-colors break-all"
              >
                {location.email}
              </a>
            </div>
          )}

          {location.map_url && (
            <div className="pt-2">
              <a
                href={location.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                View on Map
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
