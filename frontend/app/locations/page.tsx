
'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Location {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('http://localhost:3000/admin/api/locations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLocations(data.locations);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchLocations();
  }, []);

  if (loading) {
    return <div className="text-center p-8">טוען מיקומים...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">שגיאה בטעינת מיקומים: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>מצאו אותנו | מיקומי Juice Website</title>
        <meta name="description" content="מצאו את הסניף הקרוב אליכם! בדקו את שעות הפתיחה, כתובות ופרטי יצירת קשר של כל מיקומי Juice Website." />
      </Head>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">המיקומים שלנו</h1>
      <section id="locations-list" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {locations.length === 0 ? (
          <p className="col-span-full text-center">אין מיקומים זמינים כרגע.</p>
        ) : (
          locations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden text-right">
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">${location.name}</h3>
                <p className="text-gray-700 mb-2">כתובת: ${location.address}</p>
                {location.phone && <p className="text-gray-700">טלפון: ${location.phone}</p>}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

