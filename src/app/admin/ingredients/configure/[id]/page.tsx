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
  ingredient_group_id?: number | null;
  is_required?: boolean;
}

interface IngredientGroupOption {
  id: number;
  name_he: string;
  sort_order?: number;
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
  const [groups, setGroups] = useState<IngredientGroupOption[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
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
      const [categoryRes, ingredientsRes, configsRes, groupsRes] = await Promise.all([
        fetch(`/api/menu-categories/${params.id}`),
        fetch('/api/custom-ingredients?include_inactive=true'),
        fetch(`/api/menu-categories/${params.id}/ingredient-configs?include_inactive=true`),
        fetch('/api/ingredient-groups'),
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
        selection_type: config.ingredient_group_id ? 'single' : 'multiple',
        price_override: config.price_override ?? undefined,
        ingredient_group: config.ingredient_group_name ?? config.ingredient_group ?? null,
        ingredient_group_id: config.ingredient_group_id ?? null,
        is_required: config.ingredient_group_id ? !!config.is_required : false,
      }));
      setCategoryConfigs(configs);

      const groupsData = await groupsRes.json();
      setGroups(Array.isArray(groupsData.groups) ? groupsData.groups : []);
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

  function handleAddIngredientToCategory(ingredient: Ingredient, groupIdRaw?: string | number | null) {
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

    const groupId = groupIdRaw ? Number(groupIdRaw) : null;
    const groupMeta = groupId ? groups.find(g => g.id === groupId) : null;
    const newConfig: CategoryIngredientConfig = {
      category_id: category!.id,
      category_name: category!.name,
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      selection_type: groupId ? 'single' : 'multiple',
      price_override: undefined,
      ingredient_group: groupMeta?.name_he || null,
      ingredient_group_id: groupId,
      is_required: groupId ? false : false,
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

  async function handleCreateGroup() {
    if (!newGroupName.trim()) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Group name is required'),
        type: 'error',
      });
      return;
    }

    const normalized = newGroupName.trim();
    const existingGroupNames = new Set(groups.map((g) => g.name_he.trim()));

    if (existingGroupNames.has(normalized)) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('A group with this name already exists'),
        type: 'error',
      });
      return;
    }

    try {
      const res = await fetch('/api/ingredient-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_he: normalized, sort_order: groups.length }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create group');
      }
      const data = await res.json();
      setGroups((prev) => [...prev, { id: data.id, name_he: data.name_he, sort_order: data.sort_order }]);
      setNewGroupName('');
      setShowCreateGroup(false);
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to save group'),
        type: 'error',
      });
    }
  }

  function handleAddIngredientToGroup(ingredientId: number, groupName: string) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_id === ingredientId) {
        return { ...config, ingredient_group: groupName };
      }
      return config;
    }));
  }

  function handleRemoveGroup(groupId: number) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_group_id === groupId) {
        return { ...config, ingredient_group: null, ingredient_group_id: null, is_required: false, selection_type: 'multiple' };
      }
      return config;
    }));
  }

  function handleUpdateGroupRequired(groupId: number, value: boolean) {
    setCategoryConfigs(prev => prev.map(config => {
      if (config.ingredient_group_id === groupId) {
        return { ...config, is_required: value, selection_type: 'single' };
      }
      return config;
    }));
  }

  async function handleSave() {
    if (!category) return;
    setSaving(true);
    try {
      const configsToSave = categoryConfigs.map(config => {
        const normalizedGroup = config.ingredient_group?.trim() || null;
        const groupMeta = config.ingredient_group_id ? groups.find((g) => g.id === config.ingredient_group_id) : null;
        return {
          ...config,
          selection_type: config.ingredient_group_id ? 'single' : 'multiple',
          ingredient_group_id: config.ingredient_group_id || null,
          ingredient_group: groupMeta?.name_he || normalizedGroup || null,
          is_required: config.ingredient_group_id ? !!config.is_required : false,
          volume_prices: null,
        };
      });

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
            const existingGroups = groups;

            if (existingGroups.length === 0) return <p className="text-center py-8">{t('No groups created yet.')}</p>;

            return (
              <div className="space-y-2">
                {existingGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span>📦</span>
                      <span className="font-semibold text-blue-900">{group.name_he}</span>
                    </div>
                    <span className="text-xs text-slate-500">ID: {group.id}</span>
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
                const existingGroups = groups;

                return (
                  <div key={ingredient.id} className="flex items-center justify-between p-2 hover:bg-muted rounded gap-2">
                    <div className="flex-1">
                      <span className="font-medium">{t(ingredient.name)}</span>
                    </div>
                    <select
                      className="text-sm border rounded px-2 py-1"
                      defaultValue=""
                      onChange={(e) => handleAddIngredientToCategory(ingredient, e.target.value || null)}
                    >
                      <option value="">{t('Attach without group (multi-choice)')}</option>
                      {existingGroups.map(g => <option key={g.id} value={g.id}>{g.name_he}</option>)}
                    </select>
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
            const groupedById = groups.map((g) => ({
              group: g,
              configs: categoryConfigs.filter((c) => c.ingredient_group_id === g.id),
            }));
            const ungrouped = categoryConfigs.filter((c) => !c.ingredient_group_id);

            return (
              <div className="space-y-4">
                {groups.length === 0 && (
                  <p className="text-sm text-slate-600">{t('No groups yet. You can attach ingredients without a group or create one above.')}</p>
                )}
                {groupedById.map(({ group, configs }) => {
                  const isRequired = configs.some((c) => c.is_required);
                  return (
                    <Card key={group.id} className="border-2 border-blue-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-blue-900">{group.name_he}</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveGroup(group.id)} className="text-red-600">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{t('Single choice')}</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={isRequired}
                              onChange={(e) => handleUpdateGroupRequired(group.id, e.target.checked)}
                            />
                            <Label className="text-sm">{t('Required (must pick one)')}</Label>
                          </div>
                        </div>
                        <div className="space-y-2 border-t pt-4">
                          {configs.length === 0 ? (
                            <p className="text-sm text-slate-500">{t('No ingredients in this group yet.')}</p>
                          ) : (
                            configs.map(config => (
                              <div key={config.ingredient_id} className="flex justify-between items-center p-2 bg-white border rounded">
                                <span>{t(config.ingredient_name)}</span>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)} className="text-red-600">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <Card className="border border-dashed">
                  <CardHeader>
                    <CardTitle>{t('Standalone ingredients (multi-choice)')}</CardTitle>
                    <CardDescription>{t('These are not in a group; customers can pick any number.')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    { ungrouped.length === 0 ? (
                      <p className="text-sm text-slate-500">{t('No standalone ingredients yet.')}</p>
                    ) : (
                      <div className="space-y-2">
                        {ungrouped.map(config => (
                          <div key={config.ingredient_id} className="flex justify-between items-center p-2 bg-white border rounded">
                            <span>{t(config.ingredient_name)}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)} className="text-red-600">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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