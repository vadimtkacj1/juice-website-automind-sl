'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';
import ImageUpload from '@/components/ImageUpload/ImageUpload';

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  sort_order: number;
  is_active: boolean;
}

interface VolumeOption {
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
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
    image: '',
    sort_order: '0',
    is_active: true
  });
  const [categoryVolumes, setCategoryVolumes] = useState<VolumeOption[]>([]);

  useEffect(() => {
    if (id) {
      fetchCategory(Number(id));
    }
  }, [id]);

  async function fetchCategory(categoryId: number) {
    setInitialLoading(true);
    try {
      const [categoryRes, volumesRes] = await Promise.all([
        fetch(`/api/menu-categories/${categoryId}`),
        fetch(`/api/menu-categories/${categoryId}/volumes`)
      ]);
      
      if (!categoryRes.ok) {
        if (categoryRes.status === 404) {
          alert(t('Category not found'));
          router.push('/admin/menu');
          return;
        }
        throw new Error('Failed to fetch category');
      }
      const data = await categoryRes.json();
      const category: MenuCategory = data.category;
      
      setForm({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        sort_order: (category.sort_order || 0).toString(),
        is_active: category.is_active !== undefined ? category.is_active : true
      });

      if (volumesRes.ok) {
        const volumesData = await volumesRes.json();
        setCategoryVolumes(volumesData.volumes || []);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert(t('Error loading category'));
      router.push('/admin/menu');
    } finally {
      setInitialLoading(false);
    }
  }

  function addCategoryVolume() {
    setCategoryVolumes([...categoryVolumes, {
      volume: '',
      price: 0,
      is_default: categoryVolumes.length === 0,
      sort_order: categoryVolumes.length
    }]);
  }

  function removeCategoryVolume(index: number) {
    const newVolumes = categoryVolumes.filter((_, i) => i !== index);
    if (newVolumes.length > 0 && categoryVolumes[index].is_default) {
      newVolumes[0].is_default = true;
    }
    setCategoryVolumes(newVolumes);
  }

  function updateCategoryVolume(index: number, field: keyof VolumeOption, value: any) {
    const newVolumes = [...categoryVolumes];
    if (field === 'is_default' && value) {
      newVolumes.forEach((v, i) => {
        v.is_default = i === index;
      });
    } else {
      newVolumes[index] = { ...newVolumes[index], [field]: value };
    }
    setCategoryVolumes(newVolumes);
  }

  async function saveCategoryVolumes() {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/menu-categories/${id}/volumes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volumes: categoryVolumes })
      });

      if (!response.ok) {
        throw new Error('Failed to save category volumes');
      }
    } catch (error) {
      console.error('Error saving category volumes:', error);
      throw error;
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
      // Save category first
      const response = await fetch(`/api/menu-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          image: form.image.trim() || null,
          sort_order: parseInt(form.sort_order) || 0,
          is_active: form.is_active
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || t('Error updating category'));
        setLoading(false);
        return;
      }

      // Save category volumes
      await saveCategoryVolumes();

      router.push('/admin/menu');
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

            <div>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                folder="categories"
                label={t('Category Image')}
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('Category Volume Options')}</CardTitle>
                <CardDescription>{t('Define volume options for this category (e.g., 0.5L, 1L)')}</CardDescription>
              </div>
              <Button
                type="button"
                onClick={addCategoryVolume}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Volume')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categoryVolumes.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50">
                <p className="font-medium">{t('No volume options defined.')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryVolumes.map((vol, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 p-4 border rounded-lg bg-gray-50/50">
                    <div className="col-span-4">
                      <Label>{t('Volume/Weight')} *</Label>
                      <Input
                        value={vol.volume}
                        onChange={(e) => updateCategoryVolume(index, 'volume', e.target.value)}
                        placeholder={t('e.g., 0.5L, 1L')}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>{t('Price ($)')} *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={vol.price}
                        onChange={(e) => updateCategoryVolume(index, 'price', parseFloat(e.target.value) || 0)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-2 pt-7">
                      <input
                        type="checkbox"
                        checked={vol.is_default}
                        onChange={(e) => updateCategoryVolume(index, 'is_default', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label className="text-sm">{t('Default')}</Label>
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategoryVolume(index)}
                        className="w-full"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

