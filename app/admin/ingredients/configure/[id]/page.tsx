'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  volume_prices?: Record<string, number>;
}

interface VolumeOption {
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

export default function ConfigureCategory() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useAdminLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryIngredientConfig[]>([]);
  const [categoryVolumes, setCategoryVolumes] = useState<VolumeOption[]>([]);
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

  async function fetchData() {
    try {
      const [categoryRes, ingredientsRes, configsRes, volumesRes] = await Promise.all([
        fetch(`/api/menu-categories/${params.id}`),
        fetch('/api/custom-ingredients?include_inactive=true'),
        fetch(`/api/menu-categories/${params.id}/ingredient-configs?include_inactive=true`),
        fetch(`/api/menu-categories/${params.id}/volumes`)
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
        volume_prices: typeof config.volume_prices === 'string' 
          ? JSON.parse(config.volume_prices) 
          : config.volume_prices
      }));
      setCategoryConfigs(configs);

      if (volumesRes.ok) {
        const volumesData = await volumesRes.json();
        setCategoryVolumes(volumesData.volumes || []);
      }
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
    
    const initialVolumePrices: Record<string, number> = {};
    categoryVolumes.forEach(vol => {
      if (vol.volume) {
        initialVolumePrices[vol.volume] = ingredient.price;
      }
    });
    
    const newConfig: CategoryIngredientConfig = {
      category_id: category!.id,
      category_name: category!.name,
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      selection_type: 'multiple',
      price_override: undefined,
      volume_prices: Object.keys(initialVolumePrices).length > 0 ? initialVolumePrices : undefined,
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

  function handleUpdateIngredientVolumePrice(ingredientId: number, volume: string, price: number | undefined) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_id === ingredientId) {
        const newVolumePrices = { ...(config.volume_prices || {}) };
        if (price !== undefined) {
          newVolumePrices[volume] = price;
        } else {
          delete newVolumePrices[volume];
        }
        return { ...config, volume_prices: newVolumePrices };
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
        volume_prices: config.volume_prices ? JSON.stringify(config.volume_prices) : null
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

      setTimeout(() => {
        router.push('/admin/ingredients');
      }, 1500);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('Category Volume Options')}</CardTitle>
              <CardDescription>
                {t('Volume options are configured in the category edit page.')}
                <Link href={`/admin/menu/categories/edit/${category.id}`} className="ml-2 text-purple-600 hover:underline">
                  {t('Edit Category Volumes')}
                </Link>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categoryVolumes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50">
              <p className="font-medium">{t('No volume options defined.')}</p>
              <p className="text-xs mt-2">
                <Link href={`/admin/menu/categories/edit/${category.id}`} className="text-purple-600 hover:underline">
                  {t('Add volume options in category settings')}
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categoryVolumes.map((vol, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{vol.volume}</span>
                    <span className="text-sm text-muted-foreground">${(vol.price || 0).toFixed(2)}</span>
                    {vol.is_default && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {t('Default')}
                      </span>
                    )}
                  </div>
                  <Link href={`/admin/menu/categories/edit/${category.id}`}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      {t('Edit')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                      ({t(ingredient.ingredient_category)}) - ${(ingredient.price || 0).toFixed(2)}
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

      <Card>
        <CardHeader>
          <CardTitle>{t('Attached Ingredients')} ({categoryConfigs.length})</CardTitle>
          <CardDescription>
            {t('All ingredients listed here will be available when customers select items from this category')}
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
                              placeholder={`${t('Default')}: $${(ingredient?.price || 0).toFixed(2)}`}
                            />
                          </div>
                        </div>
                        
                        {categoryVolumes.length > 0 && (
                          <div>
                            <Label>{t('Price per Volume/Weight')}</Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {categoryVolumes.map((vol) => {
                                const currentPrice = config.volume_prices?.[vol.volume];
                                return (
                                  <div key={vol.volume} className="flex items-center gap-2">
                                    <Label className="w-20 text-sm">{vol.volume}:</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={currentPrice !== undefined ? currentPrice : ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        handleUpdateIngredientVolumePrice(
                                          config.ingredient_id,
                                          vol.volume,
                                          value && value !== '' ? parseFloat(value) : undefined
                                        );
                                      }}
                                      placeholder={`$${(ingredient?.price || 0).toFixed(2)}`}
                                      className="flex-1"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
        <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
          {saving ? t('Saving...') : t('Save Configuration')}
        </Button>
      </div>

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

