'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface BusinessHour {
  id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminBusinessHours() {
  const { t, language } = useAdminLanguage();
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  async function fetchBusinessHours() {
    try {
      const response = await fetch('/api/business-hours');
      const data = await response.json();
      // Convert is_active from 0/1 to boolean
      const formattedHours = (data.businessHours || []).map((bh: any) => ({
        ...bh,
        is_active: bh.is_active === 1 || bh.is_active === true
      }));
      setBusinessHours(formattedHours);
    } catch (error) {
      console.error('Error fetching business hours:', error);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm(t('Are you sure you want to delete this business hour?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/business-hours/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchBusinessHours();
      }
    } catch (error) {
      console.error('Error deleting business hour:', error);
    }
  }

  function formatTime(time: string): string {
    // Convert 24h format to 12h format
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  const dayNames: { [key: string]: string } = {
    'Sunday': t('Sunday'),
    'Monday': t('Monday'),
    'Tuesday': t('Tuesday'),
    'Wednesday': t('Wednesday'),
    'Thursday': t('Thursday'),
    'Friday': t('Friday'),
    'Saturday': t('Saturday'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading business hours...')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir={language}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('Business Hours Management')}</h1>
        <p className="text-gray-500 mt-1">{t('Manage store opening and closing times')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>{t('All Business Hours')}</CardTitle>
                <CardDescription>{t('Store hours for each day of the week')}</CardDescription>
              </div>
            </div>
            <Link href="/admin/business-hours/add">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Business Hours')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {businessHours.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('No business hours yet')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Day')}</TableHead>
                    <TableHead>{t('Opening Time')}</TableHead>
                    <TableHead>{t('Closing Time')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessHours.map((hour) => (
                    <TableRow key={hour.id}>
                      <TableCell>
                        <span className="font-medium">{dayNames[hour.day_of_week] || hour.day_of_week}</span>
                      </TableCell>
                      <TableCell className="font-mono">{formatTime(hour.open_time)}</TableCell>
                      <TableCell className="font-mono">{formatTime(hour.close_time)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          hour.is_active 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {hour.is_active ? t('Active') : t('Inactive')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/business-hours/edit/${hour.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(hour.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}





