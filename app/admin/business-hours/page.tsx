'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BusinessHour {
  id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminBusinessHours() {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  async function fetchBusinessHours() {
    try {
      setLoading(true);
      const response = await fetch('/api/business-hours');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBusinessHours(data.businessHours);
    } catch (error: any) {
      console.error('Error fetching business hours:', error);
      setError('Failed to load business hours.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this business hour entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/business-hours/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the deleted item from the state
      setBusinessHours(businessHours.filter((hour) => hour.id !== id));
    } catch (error: any) {
      console.error('Error deleting business hour:', error);
      alert('Failed to delete business hour.');
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading business hours..." />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-2xl font-bold">Business Hours</CardTitle>
            <CardDescription>Manage your store's operating hours.</CardDescription>
          </div>
          <Link href="/admin/business-hours/add">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> Add New Hour
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {businessHours.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No business hours configured yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Day(s)</TableHead>
                  <TableHead>Open Time</TableHead>
                  <TableHead>Close Time</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Sort Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessHours.map((hour) => (
                  <TableRow key={hour.id}>
                    <TableCell className="font-medium">{hour.day_of_week}</TableCell>
                    <TableCell>{hour.open_time}</TableCell>
                    <TableCell>{hour.close_time}</TableCell>
                    <TableCell className="text-center">
                      {hour.is_active ? '✅' : '❌'}
                    </TableCell>
                    <TableCell className="text-center">{hour.sort_order}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Link href={`/admin/business-hours/edit/${hour.id}`}>
                        <Button variant="outline" size="icon">
                          <Pencil size={18} />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDelete(hour.id)}
                      >
                        <Trash size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

