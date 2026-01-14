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
        category_id: Number(config.category_id),
        category_name: config.category_name,
        ingredient_id: Number(config.ingredient_id ?? config.custom_ingredient_id),
        ingredient_name: config.ingredient_name,
        selection_type: config.selection_type || 'multiple',
        price_override: config.price_override ?? undefined,
        ingredient_group: config.ingredient_group ?? '',
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

    // If groupName is not provided, show error
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

    // Check if group already exists
    const existingGroups = new Set(
      categoryConfigs
        .map(c => c.ingredient_group?.trim())
        .filter(g => g && g !== '')
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

    // Create an empty group by adding a placeholder config (will be removed if no ingredients added)
    // Actually, we don't need to create empty groups - groups are created when ingredients are added
    // Just close the input
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
    // Remove group name from all ingredients in this group
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

      {/* First: Create Groups Section */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">📦 {t('Step 1: Create Groups')}</CardTitle>
              <CardDescription>
                {t('First, create groups for your ingredients. You can add ingredients to groups in the next step.')}
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => {
                setShowCreateGroup(true);
                setNewGroupName('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('Create Group')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateGroup && (
            <div className="mb-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t('Enter group name (e.g., Milk base, Protein choice)')}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateGroup();
                    } else if (e.key === 'Escape') {
                      setShowCreateGroup(false);
                      setNewGroupName('');
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={handleCreateGroup}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('Create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateGroup(false);
                    setNewGroupName('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {(() => {
            const existingGroups = new Set(
              categoryConfigs
                .map(c => c.ingredient_group?.trim())
                .filter(g => g && g !== '')
            );

            if (existingGroups.size === 0) {
              return (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-muted-foreground mb-2">
                    {t('No groups created yet.')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('Click "Create Group" above to get started.')}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {Array.from(existingGroups).map((groupName) => {
                  const groupConfigs = categoryConfigs.filter(c => c.ingredient_group?.trim() === groupName);
                  return (
                    <div
                      key={groupName}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <span className="font-semibold text-blue-900">{t(groupName)}</span>
                        <span className="text-sm text-blue-600">
                          ({groupConfigs.length} {t('ingredients')})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveGroup(groupName)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Second: Add Ingredients to Groups */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Step 2: Add Ingredients to Groups')}</CardTitle>
          <CardDescription>
            {t('Select a group and add ingredients to it. Ingredients must be added to a group.')}
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
              .map((ingredient) => {
                // Get available groups
                const existingGroups = Array.from(new Set(
                  categoryConfigs
                    .map(c => c.ingredient_group?.trim())
                    .filter(g => g && g !== '')
                ));

                return (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded gap-2"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{t(ingredient.name)}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({t(ingredient.ingredient_category)}) - ₪{(typeof ingredient.price === 'number' ? ingredient.price : parseFloat(String(ingredient.price)) || 0).toFixed(2)}
                      </span>
                    </div>
                    {existingGroups.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm border rounded px-2 py-1"
                          defaultValue=""
                          onChange={(e) => {
                            const groupName = e.target.value;
                            if (groupName) {
                              handleAddIngredientToCategory(ingredient, groupName);
                              e.target.value = ''; // Reset select
                            }
                          }}
                        >
                          <option value="">{t('Select group...')}</option>
                          {existingGroups.map(groupName => (
                            <option key={groupName} value={groupName}>
                              {t(groupName)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t('Create a group first')}
                      </span>
                    )}
                  </div>
                );
              })}
            {ingredients.filter(ing => !categoryConfigs.find(c => c.ingredient_id === ing.id)).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('All ingredients are already attached')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manage Groups Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t('Step 3: Manage Groups and Settings')}</CardTitle>
            <CardDescription>
              {t('Configure group settings, add/remove ingredients, and set selection types.')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>

          {(() => {
            const groupedConfigs = categoryConfigs.reduce((acc, config) => {
              const groupKey = config.ingredient_group?.trim() || '__ungrouped';
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(config);
              return acc;
            }, {} as Record<string, typeof categoryConfigs>);

            const groups = Object.keys(groupedConfigs).filter(k => k !== '__ungrouped');

            if (groups.length === 0 && categoryConfigs.length === 0) {
              return (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('No groups created yet. Create a group and add ingredients to it.')}
                </p>
              );
            }

            return (
              <div className="space-y-4">
                {groups.map((groupName) => {
                  const groupConfigs = groupedConfigs[groupName];
                  const isEditing = editingGroup === groupName;
                  
                  return (
                    <Card key={groupName} className="border-2 border-blue-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {isEditing ? (
                              <Input
                                type="text"
                                value={groupName}
                                onChange={(e) => {
                                  const newName = e.target.value.trim();
                                  if (newName && newName !== groupName) {
                                    setCategoryConfigs(prev => prev.map(config => 
                                      config.ingredient_group === groupName 
                                        ? { ...config, ingredient_group: newName }
                                        : config
                                    ));
                                    setEditingGroup(newName);
                                  }
                                }}
                                onBlur={() => setEditingGroup(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    setEditingGroup(null);
                                  }
                                }}
                                className="font-semibold text-lg"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📦</span>
                                <CardTitle className="text-blue-900">{t(groupName)}</CardTitle>
                                <span className="text-sm text-blue-600">
                                  ({groupConfigs.length} {t('ingredients')})
                                </span>
                              </div>
                            )}
                            <CardDescription className="mt-1">
                              {groupConfigs[0]?.selection_type === 'single' 
                                ? t('Customers can choose only ONE from this group')
                                : t('Customers can choose MULTIPLE from this group')}
                              {groupConfigs[0]?.is_required && (
                                <span className="text-red-600 font-semibold ml-2">
                                  ({t('Required')})
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {!isEditing && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingGroup(groupName)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveGroup(groupName)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>{t('Selection Type')}</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={groupConfigs[0]?.selection_type || 'multiple'}
                                onChange={(e) => handleUpdateGroupSettings(groupName, 'selection_type', e.target.value)}
                              >
                                <option value="multiple">{t('Multiple Choice')}</option>
                                <option value="single">{t('Single Choice (Choose One)')}</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              {groupConfigs[0]?.selection_type === 'single' && (
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="checkbox"
                                    id={`required-${groupName}`}
                                    checked={groupConfigs[0]?.is_required || false}
                                    onChange={(e) => handleUpdateGroupSettings(groupName, 'is_required', e.target.checked)}
                                    className="w-4 h-4"
                                  />
                                  <Label htmlFor={`required-${groupName}`} className="cursor-pointer">
                                    {t('Required Group')}
                                  </Label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <Label className="mb-2 block">{t('Ingredients in this group')}:</Label>
                          <div className="space-y-2">
                            {groupConfigs.map((config) => {
                              const ingredient = ingredients.find(i => i.id === config.ingredient_id);
                              return (
                                <div
                                  key={config.ingredient_id}
                                  className="flex items-center justify-between p-2 bg-white border rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{t(config.ingredient_name)}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ₪{(config.price_override ?? ingredient?.price ?? 0).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAddIngredientToGroup(config.ingredient_id, '')}
                                      title={t('Remove from group')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)}
                                      className="text-red-600"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add ingredients to group */}
                          <div className="mt-4 pt-4 border-t">
                            <Label className="mb-2 block">{t('Add ingredients to this group')}:</Label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {categoryConfigs
                                .filter(c => !c.ingredient_group || c.ingredient_group.trim() === '')
                                .map((config) => {
                                  const ingredient = ingredients.find(i => i.id === config.ingredient_id);
                                  return (
                                    <div
                                      key={config.ingredient_id}
                                      className="flex items-center justify-between p-2 hover:bg-muted rounded"
                                    >
                                      <span className="text-sm">{t(config.ingredient_name)}</span>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddIngredientToGroup(config.ingredient_id, groupName)}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        {t('Add')}
                                      </Button>
                                    </div>
                                  );
                                })}
                              {categoryConfigs.filter(c => !c.ingredient_group || c.ingredient_group.trim() === '').length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  {t('All ingredients are already in groups or not attached')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Ungrouped ingredients */}
                {groupedConfigs['__ungrouped'] && groupedConfigs['__ungrouped'].length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Ungrouped Ingredients')}</CardTitle>
                      <CardDescription>
                        {t('These ingredients are not in any group. Add them to a group above or leave them ungrouped.')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {groupedConfigs['__ungrouped'].map((config) => {
                          const ingredient = ingredients.find(i => i.id === config.ingredient_id);
                          return (
                            <div
                              key={config.ingredient_id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <span className="font-medium">{t(config.ingredient_name)}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ₪{(config.price_override ?? ingredient?.price ?? 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <select
                                  className="text-sm border rounded px-2 py-1"
                                  value={config.ingredient_group || ''}
                                  onChange={(e) => {
                                    const groupName = e.target.value;
                                    if (groupName) {
                                      handleAddIngredientToGroup(config.ingredient_id, groupName);
                                    }
                                  }}
                                >
                                  <option value="">{t('Move to group...')}</option>
                                  {Object.keys(groupedConfigs)
                                    .filter(k => k !== '__ungrouped')
                                    .map(groupName => (
                                      <option key={groupName} value={groupName}>
                                        {t(groupName)}
                                      </option>
                                    ))}
                                </select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)}
                                  className="text-red-600"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
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

