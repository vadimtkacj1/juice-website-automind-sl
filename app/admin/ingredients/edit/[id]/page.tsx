'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Coffee, FolderOpen } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { AlertDialog } from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditIngredient() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useAdminLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '0',
    image: '',
    ingredient_category: 'fruits' as 'boosters' | 'fruits' | 'toppings',
    is_available: true,
    sort_order: '0',
  });

  useEffect(() => {
    if (params?.id) {
      fetchIngredient();
    }
  }, [params?.id]);

  async function fetchIngredient() {
    try {
      const response = await fetch(`/api/custom-ingredients/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ingredient');
      }

      const ingredientData = await response.json();
      const ingredient = ingredientData.ingredient || ingredientData;

      setForm({
        name: ingredient.name,
        description: ingredient.description || '',
        price: ingredient.price.toString(),
        image: ingredient.image || '',
        ingredient_category: ingredient.ingredient_category,
        is_available: ingredient.is_available,
        sort_order: ingredient.sort_order.toString(),
      });
    } catch (error) {
      console.error('Error fetching ingredient:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('Failed to load ingredient'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
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

    setSaving(true);

    try {
      const response = await fetch(`/api/custom-ingredients/${params.id}`, {
        method: 'PUT',
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

      setAlertDialog({
        open: true,
        title: t('Success'),
        message: t('Ingredient updated successfully!'),
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
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading...')} />
      </div>
    );
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
          <h1 className="text-2xl font-semibold text-slate-900">{t('Edit Ingredient')}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t('Update ingredient details')}</p>
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
                <Label htmlFor="category">{t('Category')}</Label>
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

        <Card>
          <CardHeader>
            <CardTitle>{t('Quick Actions')}</CardTitle>
            <CardDescription>{t('Add this ingredient to a menu item or category')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  router.push(`/admin/menu?addIngredient=${params.id}`);
                }}
                variant="outline"
                className="flex-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                <Coffee className="h-4 w-4 mr-2" />
                {t('Add to Menu Item')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  router.push(`/admin/ingredients?addToCategory=${params.id}`);
                }}
                variant="outline"
                className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {t('Add to Category')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/admin/ingredients">
            <Button type="button" variant="outline">
              {t('Cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? t('Saving...') : t('Update')}
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
