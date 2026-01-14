'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash, X, Edit2 } from 'lucide-react';
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
  ingredient_group?: string | null;
  is_required?: boolean;
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
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
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
          const existing = categoryConfigs.find(c => c.ingredient_id === ingredientId);
          if (!existing) {
            handleAddIngredientToCategory(ingredient);
          }
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

      if (!categoryRes.ok) throw new Error('Failed to fetch category');

      const categoryData = await categoryRes.json();
      setCategory(categoryData.category || categoryData);

      const ingredientsData = await ingredientsRes.json();
      setIngredients(ingredientsData.ingredients || []);

      const configsData = await configsRes.json();
      const configs = (configsData.configs || []).map((config: any) => ({
        category_id: Number(config.category_id),
        category_name: config.category_name,
        ingredient_id: Number(config.ingredient_id ?? config.custom_ingredient_id),
        ingredient_name: config.ingredient_name,
        selection_type: config.selection_type || 'multiple',
        price_override: config.price_override ?? undefined,
        ingredient_group: config.ingredient_group ?? '',
        is_required: config.is_required || false,
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

  function handleAddIngredientToCategory(ingredient: Ingredient, groupName?: string) {
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

    if (!groupName || !groupName.trim()) {
      setAlertDialog({
        open: true,
        title: t('No Group Selected'),
        message: t('Please select a group to add the ingredient to. Create a group first if needed.'),
        type: 'error',
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
      ingredient_group: groupName || '',
      is_required: false,
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

  function handleCreateGroup() {
    if (!newGroupName.trim()) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Group name is required'),
        type: 'error',
      });
      return;
    }

    const existingGroups = new Set(
      categoryConfigs
        .map(c => c.ingredient_group?.trim())
        .filter((g): g is string => !!g)
    );

    if (existingGroups.has(newGroupName.trim())) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('A group with this name already exists'),
        type: 'error',
      });
      return;
    }

    setNewGroupName('');
    setShowCreateGroup(false);
  }

  function handleAddIngredientToGroup(ingredientId: number, groupName: string) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_id === ingredientId) {
        return { ...config, ingredient_group: groupName };
      }
      return config;
    }));
  }

  function handleRemoveGroup(groupName: string) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_group === groupName) {
        return { ...config, ingredient_group: null, is_required: false };
      }
      return config;
    }));
  }

  function handleUpdateGroupSettings(groupName: string, field: 'selection_type' | 'is_required', value: any) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_group === groupName) {
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
        ingredient_group: config.ingredient_group || null,
        is_required: config.is_required || false,
        volume_prices: null,
      }));

      const configRes = await fetch(`/api/menu-categories/${category.id}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: configsToSave }),
      });

      if (!configRes.ok) throw new Error('Failed to save category configuration');

      setAlertDialog({
        open: true,
        title: t('Success'),
        message: t('Successfully saved configuration.'),
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to save category configuration'),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <p>{t('Category not found')}</p>
        <Link href="/admin/ingredients">
          <Button variant="outline" className="mt-4">{t('Back to Ingredients')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/ingredients">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('Configure Ingredients for')} {t(category.name)}</h1>
        </div>
      </div>

      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">📦 {t('Step 1: Create Groups')}</CardTitle>
            </div>
            <Button onClick={() => { setShowCreateGroup(true); setNewGroupName(''); }} className="bg-blue-600">
              <Plus className="h-4 w-4 mr-2" /> {t('Create Group')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateGroup && (
            <div className="mb-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50 flex gap-2">
              <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder={t('Enter group name')} />
              <Button onClick={handleCreateGroup}>{t('Create')}</Button>
              <Button variant="outline" onClick={() => setShowCreateGroup(false)}><X className="h-4 w-4" /></Button>
            </div>
          )}

          {(() => {
            const existingGroups = Array.from(new Set(
              categoryConfigs
                .map(c => c.ingredient_group?.trim())
                .filter((g): g is string => !!g)
            ));

            if (existingGroups.length === 0) return <p className="text-center py-8">{t('No groups created yet.')}</p>;

            return (
              <div className="space-y-2">
                {existingGroups.map((groupName) => (
                  <div key={groupName} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span className="font-semibold text-blue-900">{t(groupName || '')}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveGroup(groupName)} className="text-red-600">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('Step 2: Add Ingredients to Groups')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
            {ingredients
              .filter(ing => !categoryConfigs.find(c => c.ingredient_id === ing.id))
              .map((ingredient) => {
                const existingGroups = Array.from(new Set(
                  categoryConfigs
                    .map(c => c.ingredient_group?.trim())
                    .filter((g): g is string => !!g)
                ));

                return (
                  <div key={ingredient.id} className="flex items-center justify-between p-2 hover:bg-muted rounded gap-2">
                    <div className="flex-1">
                      <span className="font-medium">{t(ingredient.name)}</span>
                    </div>
                    {existingGroups.length > 0 ? (
                      <select className="text-sm border rounded px-2 py-1" defaultValue="" onChange={(e) => handleAddIngredientToCategory(ingredient, e.target.value)}>
                        <option value="">{t('Select group...')}</option>
                        {existingGroups.map(g => <option key={g} value={g}>{t(g)}</option>)}
                      </select>
                    ) : <span className="text-xs">{t('Create a group first')}</span>}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('Step 3: Manage Groups and Settings')}</CardTitle></CardHeader>
        <CardContent>
          {(() => {
            const groupedConfigs = categoryConfigs.reduce((acc, config) => {
              const groupKey = config.ingredient_group?.trim() || '__ungrouped';
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(config);
              return acc;
            }, {} as Record<string, typeof categoryConfigs>);

            const groups = Object.keys(groupedConfigs).filter(k => k !== '__ungrouped');

            return (
              <div className="space-y-4">
                {groups.map((groupName) => {
                  const groupConfigs = groupedConfigs[groupName];
                  return (
                    <Card key={groupName} className="border-2 border-blue-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-blue-900">{t(groupName || '')}</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveGroup(groupName)} className="text-red-600">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>{t('Selection Type')}</Label>
                            <select 
                              className="w-full border rounded p-2 text-sm" 
                              value={groupConfigs[0]?.selection_type || 'multiple'}
                              onChange={(e) => handleUpdateGroupSettings(groupName, 'selection_type', e.target.value)}
                            >
                              <option value="multiple">{t('Multiple Choice')}</option>
                              <option value="single">{t('Single Choice')}</option>
                            </select>
                          </div>
                          {groupConfigs[0]?.selection_type === 'single' && (
                            <div className="flex items-end gap-2">
                              <input 
                                type="checkbox" 
                                checked={groupConfigs[0]?.is_required || false}
                                onChange={(e) => handleUpdateGroupSettings(groupName, 'is_required', e.target.checked)}
                              />
                              <Label>{t('Required')}</Label>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 border-t pt-4">
                          {groupConfigs.map(config => (
                            <div key={config.ingredient_id} className="flex justify-between items-center p-2 bg-white border rounded">
                              <span>{t(config.ingredient_name)}</span>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)} className="text-red-600">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href="/admin/ingredients"><Button variant="outline">{t('Cancel')}</Button></Link>
        <Button onClick={handleSave} disabled={saving} className="bg-purple-600">
          {saving ? t('Saving...') : `💾 ${t('Save Configuration')}`}
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