'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useAdminLanguage } from '@/lib/admin-language-context';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

export default function AddCategory() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    sort_order: '0',
    is_active: true
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert(t('Category name is required.'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/menu-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          image: form.image.trim() || null,
          sort_order: parseInt(form.sort_order) || 0
        })
      });

      if (response.ok) {
        router.push('/admin/menu');
      } else {
        const data = await response.json();
        alert(data.error || t('Error saving category.'));
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert(t('Error saving category.'));
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/menu">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Add Category')}</h1>
          <p className="text-gray-500 mt-1">{t('Create a new menu category')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('Category Details')}</CardTitle>
            <CardDescription>{t('Fill in the category information')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('Name')} *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('Fresh Juices')}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">{t('Description')}</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('Category description (optional)')}
                rows={3}
              />
            </div>

            <div>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                folder="categories"
                label={t('Category Image')}
              />
            </div>

            <div>
              <Label htmlFor="sort_order">{t('Sort Order')}</Label>
              <Input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('Lower numbers appear first')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? t('Creating...') : t('Create') + ' ' + t('Category')}
          </Button>
          <Link href="/admin/menu">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

