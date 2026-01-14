'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { AlertDialog } from '@/components/ui/alert-dialog';

export default function AddIngredient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();
  const [loading, setLoading] = useState(false);
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

      const result = await response.json();
      
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
    <div className="space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/ingredients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('Add New Ingredient')}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t('Create a new ingredient')}</p>
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
                <Label htmlFor="price">{t('Price (₪)')}</Label>
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
                <Label htmlFor="category">{t('Category')} ({t('Optional')})</Label>
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
                <p className="text-sm text-slate-500 mt-1">
                  {t('Category is optional. Ingredients can be attached to menu items or categories later.')}
                </p>
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
              <p className="text-sm text-slate-500 mt-1">
                {t('Lower numbers appear first')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_available"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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

        <div className="flex justify-end gap-2">
          <Link href="/admin/ingredients">
            <Button type="button" variant="outline">
              {t('Cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
