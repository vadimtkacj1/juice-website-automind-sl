'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface BusinessHour {
  id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  sort_order: number;
  is_active: boolean;
}

export default function EditBusinessHour() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessHour>({
    id: 0,
    day_of_week: '',
    open_time: '',
    close_time: '',
    sort_order: 0,
    is_active: true,
  });

  const daysOfWeek = [
    { value: 'Sunday', label: t('Sunday') },
    { value: 'Monday', label: t('Monday') },
    { value: 'Tuesday', label: t('Tuesday') },
    { value: 'Wednesday', label: t('Wednesday') },
    { value: 'Thursday', label: t('Thursday') },
    { value: 'Friday', label: t('Friday') },
    { value: 'Saturday', label: t('Saturday') },
  ];

  useEffect(() => {
    if (id) {
      fetchBusinessHourData(Number(id));
    }
  }, [id]);

  async function fetchBusinessHourData(hourId: number) {
    setLoading(true);
    try {
      const response = await fetch(`/api/business-hours/${hourId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data.businessHour);
      } else {
        console.error('Failed to fetch business hour data');
        router.push('/admin/business-hours');
      }
    } catch (error) {
      console.error('Error fetching business hour data:', error);
      router.push('/admin/business-hours');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/business-hours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/business-hours');
      } else {
        const error = await response.json();
        alert(error.error || t('Failed to update business hours'));
      }
    } catch (error) {
      console.error('Error updating business hours:', error);
      alert(t('An error occurred'));
    } finally {
      setLoading(false);
    }
  }

  if (loading && formData.id === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t('Loading business hours data...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/business-hours">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Edit Business Hours')}</h1>
          <p className="text-gray-500 mt-1">{t('Modify existing business hours')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Business Hours Information')}</CardTitle>
            <CardDescription>{t('Edit the business hours details')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="day_of_week">{t('Day of Week')} *</Label>
              <select
                id="day_of_week"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">{t('Select day')}</option>
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="open_time">{t('Opening Time')} *</Label>
                <Input
                  id="open_time"
                  type="time"
                  value={formData.open_time}
                  onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t('24-hour format (e.g., 09:00)')}</p>
              </div>

              <div>
                <Label htmlFor="close_time">{t('Closing Time')} *</Label>
                <Input
                  id="close_time"
                  type="time"
                  value={formData.close_time}
                  onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t('24-hour format (e.g., 18:00)')}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="sort_order">{t('Sort Order')}</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">{t('Lower numbers appear first')}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {t('Active')}
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/business-hours">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? t('Updating...') : t('Update Business Hours')}
          </Button>
        </div>
      </form>
    </div>
  );
}



