'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminLanguage } from '@/lib/admin-language-context';

export default function AddBusinessHour() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    day_of_week: '',
    open_time: '',
    close_time: '',
    sort_order: 0,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      is_active: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/business-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push('/admin/business-hours');
    } catch (error: any) {
      console.error('Error adding business hour:', error);
      alert(t('Failed to add business hour.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8" dir={language}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('Add New Business Hour')}</CardTitle>
          <CardDescription>{t('Enter the details for a new business hour entry.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day_of_week">{t('Day(s) of Week')}</Label>
                <Input
                  id="day_of_week"
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  placeholder={t('e.g., Monday - Friday, Weekend, Sunday')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('Sort Order')}</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={handleChange}
                  placeholder={t('0')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="open_time">{t('Open Time')}</Label>
                <Input
                  id="open_time"
                  name="open_time"
                  type="time"
                  value={formData.open_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close_time">{t('Close Time')}</Label>
                <Input
                  id="close_time"
                  name="close_time"
                  type="time"
                  value={formData.close_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_active">{t('Is Active')}</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/admin/business-hours">
                <Button type="button" variant="outline">{t('Cancel')}</Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('Adding...') : t('Add Business Hour')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

