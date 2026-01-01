'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export default function EditCategory() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sort_order: '0',
    is_active: true
  });

  useEffect(() => {
    if (id) {
      fetchCategory(Number(id));
    }
  }, [id]);

  async function fetchCategory(categoryId: number) {
    setInitialLoading(true);
    try {
      const response = await fetch(`/api/menu-categories/${categoryId}`);
      if (!response.ok) {
        if (response.status === 404) {
          alert(t('Category not found'));
          router.push('/admin/menu');
          return;
        }
        throw new Error('Failed to fetch category');
      }
      const data = await response.json();
      const category: MenuCategory = data.category;
      
      setForm({
        name: category.name || '',
        description: category.description || '',
        sort_order: (category.sort_order || 0).toString(),
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      alert(t('Error loading category'));
      router.push('/admin/menu');
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert(t('Category name is required.'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/menu-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          sort_order: parseInt(form.sort_order) || 0,
          is_active: form.is_active
        })
      });

      if (response.ok) {
        router.push('/admin/menu');
      } else {
        const data = await response.json();
        alert(data.error || t('Error updating category'));
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert(t('Error updating category'));
    }
    setLoading(false);
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading category...')} />
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">{t('Edit Category')}</h1>
          <p className="text-gray-500 mt-1">{t('Modify category details')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('Category Details')}</CardTitle>
            <CardDescription>{t('Update the category information')}</CardDescription>
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

            <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  {t('Active (show on website)')}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? t('Updating...') : t('Update Category')}
          </Button>
          <Link href="/admin/menu">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

