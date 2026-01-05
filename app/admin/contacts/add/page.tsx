'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAdminLanguage } from '@/lib/admin-language-context';

export default function AddContact() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    value: '',
    label: '',
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/contacts');
      } else {
        alert(t('Failed to add contact'));
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(t('An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{t('Add Contact')}</h1>
          <p className="text-gray-500 mt-1">{t('Create a new contact method')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Contact Information')}</CardTitle>
            <CardDescription>{t('Enter the contact details')}</CardDescription>
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
                <option value="whatsapp">WhatsApp</option>
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

            <div>
              <Label htmlFor="label">{t('Label')} (Optional)</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder={t('e.g., Email Us, Call Us')}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('Description')} (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('e.g., We\'ll respond within 24 hours')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/contacts">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? t('Creating...') : t('Create') + ' ' + t('Contact')}
          </Button>
        </div>
      </form>
    </div>
  );
}