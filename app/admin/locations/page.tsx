'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, MapPin, Eye, EyeOff, Globe, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface Location {
  id: number;
  country: string;
  city: string;
  address: string;
  hours?: string;
  image?: string;
  map_url?: string;
  show_map_button?: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function AdminLocations() {
  const { t, language } = useAdminLanguage();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm(t('Are you sure you want to delete this location?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  }

  async function toggleActive(location: Location) {
    try {
      await fetch(`/api/locations/${location.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...location,
          is_active: !location.is_active,
        }),
      });
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading locations...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6" dir={language}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('Locations Management')}</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">{t('Manage store locations, images, and contact information')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">{t('All Locations')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('Store locations displayed on the website')}</CardDescription>
              </div>
            </div>
            <Link href="/admin/locations/add" className="w-full sm:w-auto">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                <Plus className={`h-4 w-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                {t('Add Location')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('No locations yet')}</p>
              <Link href="/admin/locations/add">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  {t('Add Your First Location')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">{t('Image')}</TableHead>
                      <TableHead>{t('Location')}</TableHead>
                      <TableHead>{t('Address')}</TableHead>
                      <TableHead className="w-20">{t('Status')}</TableHead>
                      <TableHead className={language === 'he' ? 'text-left' : 'text-right'}>{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location.id} className={!location.is_active ? 'opacity-50' : ''}>
                        <TableCell>
                          {location.image ? (
                            <img 
                              src={location.image} 
                              alt={location.city}
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{t(location.city)}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {t(location.country)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate">{t(location.address)}</p>
                            {location.hours && (
                              <p className="text-xs text-gray-400">{t(location.hours)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleActive(location)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              location.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {location.is_active ? (
                              <>
                                <Eye className="h-3 w-3" />
                                {t('Active')}
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                {t('Hidden')}
                              </>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className={language === 'he' ? 'text-left' : 'text-right'}>
                          <div className={`flex gap-2 ${language === 'he' ? 'justify-start' : 'justify-end'}`}>
                            <Link href={`/admin/locations/edit/${location.id}`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {locations.map((location) => (
                  <Card key={location.id} className={!location.is_active ? 'opacity-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {location.image ? (
                          <img 
                            src={location.image} 
                            alt={location.city}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{t(location.city)}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {t(location.country)}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleActive(location)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                location.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {location.is_active ? (
                                <>
                                  <Eye className="h-3 w-3" />
                                  <span className="hidden sm:inline">{t('Active')}</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  <span className="hidden sm:inline">{t('Hidden')}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-1 break-words">{t(location.address)}</p>
                          {location.hours && (
                            <p className="text-xs text-gray-400 mb-3">{t(location.hours)}</p>
                          )}
                          <div className="flex gap-2">
                            <Link href={`/admin/locations/edit/${location.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Pencil className={`h-4 w-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                                {t('Edit')}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                              className="text-red-600 hover:text-red-700 border-red-200"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
