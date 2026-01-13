'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { AlertDialog } from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Ingredient {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredient_category: 'boosters' | 'fruits' | 'toppings';
  is_available: boolean;
  sort_order: number;
}

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
}

interface CategoryIngredientConfig {
  category_id: number;
  category_name: string;
  ingredient_id: number;
  ingredient_name: string;
  selection_type: 'single' | 'multiple';
  price_override?: number;
}

export default function ConfigureCategory() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryIngredientConfig[]>([]);
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

  useEffect(() => {
    if (params?.id) {
      fetchData();
    }
  }, [params?.id]);

  useEffect(() => {
    const addIngredient = searchParams?.get('addIngredient');
    if (addIngredient && category && ingredients.length > 0) {
      const ingredientId = parseInt(addIngredient);
      if (!isNaN(ingredientId)) {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        if (ingredient) {
          // Check if ingredient is already added
          const existing = categoryConfigs.find(c => c.ingredient_id === ingredientId);
          if (!existing) {
            handleAddIngredientToCategory(ingredient);
          }
          // Remove the parameter from URL
          router.replace(`/admin/ingredients/configure/${params.id}`, { scroll: false });
        }
      }
    }
  }, [searchParams, category, ingredients, categoryConfigs, router, params?.id]);

  async function fetchData() {
    try {
      const [categoryRes, ingredientsRes, configsRes] = await Promise.all([
        fetch(`/api/menu-categories/${params.id}`),
        fetch('/api/custom-ingredients?include_inactive=true'),
        fetch(`/api/menu-categories/${params.id}/ingredient-configs?include_inactive=true`),
      ]);

      if (!categoryRes.ok) {
        throw new Error('Failed to fetch category');
      }

      const categoryData = await categoryRes.json();
      setCategory(categoryData.category || categoryData);

      const ingredientsData = await ingredientsRes.json();
      setIngredients(ingredientsData.ingredients || []);

      const configsData = await configsRes.json();
      const configs = (configsData.configs || []).map((config: any) => ({
        ...config,
        // volume_prices intentionally ignored/hidden in admin UI per requirements
      }));
      setCategoryConfigs(configs);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('Failed to load data'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }


  function handleAddIngredientToCategory(ingredient: Ingredient) {
    const existing = categoryConfigs.find(c => c.ingredient_id === ingredient.id);
    if (existing) {
      setAlertDialog({
        open: true,
        title: t('Already Added'),
        message: `${t(ingredient.name)} ${t('is already attached to this category.')}`,
        type: 'info',
      });
      return;
    }

    const newConfig: CategoryIngredientConfig = {
      category_id: category!.id,
      category_name: category!.name,
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      selection_type: 'multiple',
      price_override: undefined,
    };
    
    setCategoryConfigs([...categoryConfigs, newConfig]);
  }

  function handleRemoveIngredientFromCategory(ingredientId: number) {
    setCategoryConfigs(categoryConfigs.filter(c => c.ingredient_id !== ingredientId));
  }

  function handleUpdateCategoryConfig(ingredientId: number, field: string, value: any) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_id === ingredientId) {
        return { ...config, [field]: value };
      }
      return config;
    }));
  }

  async function handleSave() {
    if (!category) return;

    setSaving(true);

    try {
      const configsToSave = categoryConfigs.map(config => ({
        ...config,
        volume_prices: null,
      }));

      const configRes = await fetch(`/api/menu-categories/${category.id}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: configsToSave }),
      });

      if (!configRes.ok) {
        throw new Error('Failed to save category configuration');
      }

      setAlertDialog({
        open: true,
        title: t('Success'),
        message: t('Successfully saved configuration. Customers will now see these ingredients when selecting items from this category.'),
        type: 'success',
      });

      // Don't redirect immediately, let user see the success message
      // setTimeout(() => {
      //   router.push('/admin/ingredients');
      // }, 1500);
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to save category configuration'),
        type: 'error',
      });
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <p>{t('Category not found')}</p>
        <Link href="/admin/ingredients">
          <Button variant="outline" className="mt-4">
            {t('Back to Ingredients')}
          </Button>
        </Link>
      </div>
    );
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
          <h1 className="text-3xl font-bold">{t('Configure Ingredients for')} {t(category.name)}</h1>
          <p className="text-muted-foreground mt-1">{t('Attach ingredients to this category and configure their settings.')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Available Ingredients')}</CardTitle>
          <CardDescription>
            {t('You can add multiple ingredients. Click "Add" for each one you want to include.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
            {ingredients
              .filter(ing => !categoryConfigs.find(c => c.ingredient_id === ing.id))
              .sort((a, b) => {
                if (a.ingredient_category !== b.ingredient_category) {
                  return a.ingredient_category.localeCompare(b.ingredient_category);
                }
                return a.name.localeCompare(b.name);
              })
              .map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded"
                >
                  <div>
                    <span className="font-medium">{t(ingredient.name)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({t(ingredient.ingredient_category)}) - ${(typeof ingredient.price === 'number' ? ingredient.price : parseFloat(String(ingredient.price)) || 0).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddIngredientToCategory(ingredient)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    {t('Add')}
                  </Button>
                </div>
              ))}
            {ingredients.filter(ing => !categoryConfigs.find(c => c.ingredient_id === ing.id)).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('All ingredients are already attached')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className={categoryConfigs.length > 0 ? 'border-2 border-purple-500' : ''}>
        <CardHeader>
          <CardTitle>{t('Attached Ingredients')} ({categoryConfigs.length})</CardTitle>
          <CardDescription>
            {categoryConfigs.length > 0 ? (
              <span className="text-orange-600 font-semibold">
                ⚠️ {t('Click "Save Configuration" button below to save your changes!')}
              </span>
            ) : (
              t('All ingredients listed here will be available when customers select items from this category')
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryConfigs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('No ingredients attached. Add ingredients from the list above.')}
            </p>
          ) : (
            <div className="space-y-4">
              {categoryConfigs.map((config) => {
                const ingredient = ingredients.find(i => i.id === config.ingredient_id);
                return (
                  <Card key={config.ingredient_id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{t(config.ingredient_name)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {t('Category')}: {t(ingredient?.ingredient_category || '')}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>{t('Selection Type')}</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={config.selection_type}
                              onChange={(e) => handleUpdateCategoryConfig(config.ingredient_id, 'selection_type', e.target.value)}
                            >
                              <option value="multiple">{t('Multiple Choice (Recommended)')}</option>
                              <option value="single">{t('Single Choice (Choose One)')}</option>
                            </select>
                          </div>
                          <div>
                            <Label>{t('Base Price Override ($) - Optional')}</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={config.price_override || ''}
                              onChange={(e) => handleUpdateCategoryConfig(
                                config.ingredient_id,
                                'price_override',
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )}
                              placeholder={`${t('Default')}: $${(typeof ingredient?.price === 'number' ? ingredient.price : parseFloat(String(ingredient?.price)) || 0).toFixed(2)}`}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-purple-600 hover:bg-purple-700 text-white animate-pulse"
        >
          {saving ? t('Saving...') : `💾 ${t('Save Configuration')}`}
        </Button>
      </div>
      
      {categoryConfigs.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 text-center">
          <p className="text-orange-800 font-semibold">
            ⚠️ {t('Important: Your changes are not saved yet! Click the "Save Configuration" button above.')}
          </p>
        </div>
      )}

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

