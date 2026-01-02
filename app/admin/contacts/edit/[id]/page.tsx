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

interface Contact {
  id: number;
  type: string;
  value: string;
}

export default function EditContact() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Contact>({
    id: 0,
    type: '',
    value: '',
  });

  useEffect(() => {
    if (id) {
      fetchContactData(Number(id));
    }
  }, [id]);

  async function fetchContactData(contactId: number) {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data.contact);
      } else {
        console.error('Failed to fetch contact data');
        router.push('/admin/contacts');
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
      router.push('/admin/contacts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/contacts');
      } else {
        alert(t('Failed to update contact'));
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert(t('An error occurred'));
    } finally {
      setLoading(false);
    }
  }

  if (loading && formData.id === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{t('Loading contact data...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/contacts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Edit Contact')}</h1>
          <p className="text-gray-500 mt-1">{t('Modify an existing contact method')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Contact Information')}</CardTitle>
            <CardDescription>{t('Edit the contact details')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">{t('Contact Type')} *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">{t('Select type')}</option>
                <option value="email">{t('Email')}</option>
                <option value="phone">{t('Phone')}</option>
                <option value="whatsapp">{t('WhatsApp')}</option>
                <option value="other">{t('Other')}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="value">{t('Contact Value')} *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={t('e.g., contact@example.com')}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/contacts">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? t('Updating...') : t('Update Contact')}
          </Button>
        </div>
      </form>
    </div>
  );
}