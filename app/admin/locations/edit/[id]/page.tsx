'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

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
  show_map_button?: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function EditLocation() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Location>({
    id: 0,
    country: '',
    city: '',
    address: '',
    hours: '',
    phone: '',
    email: '',
    image: '',
    map_url: '',
    show_map_button: true,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (id) {
      fetchLocationData(Number(id));
    }
  }, [id]);

  async function fetchLocationData(locationId: number) {
    setLoading(true);
    try {
      const response = await fetch(`/api/locations/${locationId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data.location);
      } else {
        console.error('Failed to fetch location data');
        router.push('/admin/locations');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      router.push('/admin/locations');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/locations');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading && formData.id === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t('Loading location data...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/locations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Edit Location')}</h1>
          <p className="text-gray-500 mt-1">{t('Modify an existing store location')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>{t('Location Details')}</CardTitle>
                  <CardDescription>{t('Basic location information')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">{t('Country *')}</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder={t('e.g., United States')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t('City *')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t('e.g., NYC')}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">{t('Full Address *')}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('e.g., 123 Coffee Lane, Brewtown, USA')}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="hours">{t('Working Hours')}</Label>
                <Input
                  id="hours"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder={t('e.g., All week: 7:00 AM - 7:00 PM')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">{t('Phone Number')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('e.g., (123) 456-7890')}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('Email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('e.g., store@example.com')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image & Map */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Media & Links')}</CardTitle>
              <CardDescription>{t('Location image and map link')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={formData.image || ''}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="locations"
                label={t('Location Image')}
              />

              <div>
                <Label htmlFor="map_url">{t('Google Maps URL')}</Label>
                <Input
                  id="map_url"
                  type="url"
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                  placeholder={t('https://maps.google.com/...')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('Link to Google Maps location')}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="show_map_button"
                  checked={formData.show_map_button !== false}
                  onChange={(e) => setFormData({ ...formData, show_map_button: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Label htmlFor="show_map_button" className="cursor-pointer">
                  Show "View on Map" button
                </Label>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  {t('Show this location on the website')}
                </Label>
              </div>

              <div>
                <Label htmlFor="sort_order">{t('Display Order')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder={t('0')}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('Lower numbers appear first')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/locations">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? t('Updating...') : t('Update Location')}
          </Button>
        </div>
      </form>
    </div>
  );
}