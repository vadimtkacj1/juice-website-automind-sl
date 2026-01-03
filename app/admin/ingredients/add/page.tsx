'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { AlertDialog } from '@/components/ui/alert-dialog';

interface VolumeOption {
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

export default function AddIngredient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();
  const [loading, setLoading] = useState(false);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'error' | 'warning';
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });

  const categoryParam = searchParams?.get('category') || 'fruits';
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '0',
    image: '',
    ingredient_category: categoryParam as 'boosters' | 'fruits' | 'toppings',
    is_available: true,
    sort_order: '0',
  });

  function addVolumeOption() {
    setVolumeOptions([...volumeOptions, {
      volume: '',
      price: parseFloat(form.price) || 0,
      is_default: volumeOptions.length === 0,
      sort_order: volumeOptions.length
    }]);
  }

  function removeVolumeOption(index: number) {
    const newVolumes = volumeOptions.filter((_, i) => i !== index);
    if (newVolumes.length > 0 && volumeOptions[index].is_default) {
      newVolumes[0].is_default = true;
    }
    setVolumeOptions(newVolumes);
  }

  function updateVolumeOption(index: number, field: keyof VolumeOption, value: any) {
    const newVolumes = [...volumeOptions];
    if (field === 'is_default' && value) {
      newVolumes.forEach((v, i) => {
        v.is_default = i === index;
      });
    } else {
      newVolumes[index] = { ...newVolumes[index], [field]: value };
    }
    setVolumeOptions(newVolumes);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Ingredient name is required.'),
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/custom-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: parseFloat(form.price) || 0,
          image: form.image || null,
          ingredient_category: form.ingredient_category,
          is_available: form.is_available,
          sort_order: parseInt(form.sort_order) || 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('Failed to save ingredient'));
      }

      const responseData = await response.json();
      const ingredientId = responseData.id;

      // Save volume options
      if (ingredientId && volumeOptions.length > 0) {
        const volumesResponse = await fetch(`/api/custom-ingredients/${ingredientId}/volumes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volumes: volumeOptions })
        });

        if (!volumesResponse.ok) {
          const error = await volumesResponse.json();
          throw new Error(error.error || t('Failed to save volume options'));
        }
      }

      setAlertDialog({
        open: true,
        title: t('Success'),
        message: t('Ingredient created successfully!'),
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/ingredients');
      }, 1500);
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to save ingredient'),
        type: 'error',
      });
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/ingredients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('Add New Ingredient')}</h1>
          <p className="text-muted-foreground mt-1">{t('Create a new ingredient')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Basic Information')}</CardTitle>
            <CardDescription>{t('Enter the basic details for the ingredient')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('Name')} *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('e.g., Strawberry, Protein Powder, Chia Seeds')}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">{t('Description')}</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('Optional description')}
                className="mt-2 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">{t('Base Price ($)')}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="category">{t('Ingredient Category')}</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-2"
                  value={form.ingredient_category}
                  onChange={(e) => setForm({ ...form, ingredient_category: e.target.value as any })}
                >
                  <option value="fruits">{t('Fruits')}</option>
                  <option value="boosters">{t('Boosters')}</option>
                  <option value="toppings">{t('Toppings')}</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="sort_order">{t('Sort Order')}</Label>
              <Input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                placeholder="0"
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t('Lower numbers appear first. Controls display order in customer selection.')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_available"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="is_available" className="cursor-pointer">{t('Available')}</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Image')}</CardTitle>
            <CardDescription>{t('Upload or provide image URL')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image">{t('Image URL')}</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder={t('Image URL or use upload below')}
                className="mt-2"
              />
              <div className="mt-3">
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  folder="ingredients"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('Volume/Weight Options')}</CardTitle>
                <CardDescription>
                  {t('Define volume or weight options (e.g., 100g, 250g, 1kg, 0.5L). Customers can choose from these when selecting this ingredient.')}
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={addVolumeOption}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Volume')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {volumeOptions.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50">
                <p className="font-medium">{t('No volume options defined.')}</p>
                <p className="text-xs mt-2">{t('Click "Add Volume" to create options like "100g", "250g", "1kg", etc.')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {volumeOptions.map((vol, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 p-4 border rounded-lg bg-gray-50/50">
                    <div className="col-span-4">
                      <Label>{t('Volume/Weight')} *</Label>
                      <Input
                        value={vol.volume}
                        onChange={(e) => updateVolumeOption(index, 'volume', e.target.value)}
                        placeholder={t('e.g., 100g, 250g, 1kg')}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>{t('Price ($)')} *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={vol.price}
                        onChange={(e) => updateVolumeOption(index, 'price', parseFloat(e.target.value) || 0)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-2 pt-7">
                      <input
                        type="checkbox"
                        checked={vol.is_default}
                        onChange={(e) => updateVolumeOption(index, 'is_default', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label className="text-sm">{t('Default')}</Label>
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVolumeOption(index)}
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

        <div className="flex justify-end gap-2">
          <Link href="/admin/ingredients">
            <Button type="button" variant="outline">
              {t('Cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? t('Saving...') : t('Create')}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
}

