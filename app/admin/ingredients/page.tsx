'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash, FolderOpen, Coffee, Link2, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useAdminLanguage } from '@/lib/admin-language-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface MenuItem {
  id: number;
  name: string;
  category_name?: string;
  image?: string;
}

interface AttachmentCategory {
  id: number;
  name: string;
  description?: string;
}

interface AttachmentMenuItem {
  id: number;
  name: string;
  image?: string;
  category_name?: string;
}

export default function AdminIngredients() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'boosters' | 'fruits' | 'toppings'>('fruits');
  const [showAddToCategoryDialog, setShowAddToCategoryDialog] = useState(false);
  const [showAddToMenuItemDialog, setShowAddToMenuItemDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [ingredientToAdd, setIngredientToAdd] = useState<number | null>(null);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachedCategories, setAttachedCategories] = useState<AttachmentCategory[]>([]);
  const [attachedMenuItems, setAttachedMenuItems] = useState<AttachmentMenuItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
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
      fetchData();
  }, []);

  useEffect(() => {
    const addToCategory = searchParams?.get('addToCategory');
    if (addToCategory) {
      const ingredientId = parseInt(addToCategory);
      if (!isNaN(ingredientId)) {
        setIngredientToAdd(ingredientId);
        fetchCategories();
        setShowAddToCategoryDialog(true);
        // Remove the parameter from URL
        router.replace('/admin/ingredients', { scroll: false });
      }
    }
  }, [searchParams, router]);

  async function fetchData() {
    try {
      const response = await fetch('/api/custom-ingredients?include_inactive=true');
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/menu-categories?include_inactive=true');
      const data = await response.json();
      // Defensive: de-duplicate by id (users reported duplicates in the picker)
      const unique = new Map<number, MenuCategory>();
      (data.categories || []).forEach((c: MenuCategory) => unique.set(c.id, c));
      setCategories(Array.from(unique.values()));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchMenuItems() {
    try {
      const response = await fetch('/api/menu-items?include_inactive=true');
      const data = await response.json();
      // Defensive: de-duplicate by id
      const unique = new Map<number, MenuItem>();
      (data.items || []).forEach((i: MenuItem) => unique.set(i.id, i));
      setMenuItems(Array.from(unique.values()));
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  }

  async function handleAddIngredientToMenuItem(itemId: number) {
    if (!ingredientToAdd) {
      console.error('No ingredient to add');
      return;
    }

    try {
      // First, get current ingredients for this item
      const currentResponse = await fetch(`/api/menu-items/${itemId}/custom-ingredients`);
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch current ingredients');
      }
      
      const currentData = await currentResponse.json();
      const currentIngredientIds = (currentData.ingredients || []).map((ing: any) => ing.id);
      
      // Add the new ingredient if it's not already there
      if (!currentIngredientIds.includes(ingredientToAdd)) {
        const newIngredientIds = [...currentIngredientIds, ingredientToAdd];
        
        console.log('Adding ingredient', ingredientToAdd, 'to menu item', itemId, 'with all ingredients:', newIngredientIds);
        
        const response = await fetch(`/api/menu-items/${itemId}/custom-ingredients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredient_ids: newIngredientIds })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData);
          throw new Error(errorData.error || 'Failed to add ingredient');
        }

        const result = await response.json();
        console.log('Success:', result);
        
        // Verify the ingredient was added by fetching again
        const verifyResponse = await fetch(`/api/menu-items/${itemId}/custom-ingredients`);
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('Verified ingredients after add:', verifyData.ingredients?.length || 0);
        }
        
        setShowAddToMenuItemDialog(false);
        setIngredientToAdd(null);
        setAlertDialog({
          open: true,
          title: t('Success'),
          message: t('Ingredient added to menu item successfully!'),
          type: 'success',
        });
      } else {
        setShowAddToMenuItemDialog(false);
        setIngredientToAdd(null);
        setAlertDialog({
          open: true,
          title: t('Info'),
          message: t('This ingredient is already added to this menu item.'),
          type: 'info',
        });
      }
    } catch (error: any) {
      console.error('Error adding ingredient to item:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('An error occurred while adding the ingredient.'),
        type: 'error',
      });
    }
  }

  async function handleAddIngredientToCategory(categoryId: number) {
    if (!ingredientToAdd) return;

    try {
      // Attach directly (stay in modals) by merging configs and saving back
      const currentRes = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs?include_inactive=true`);
      if (!currentRes.ok) {
        throw new Error(t('Failed to fetch current category ingredients'));
      }
      const currentData = await currentRes.json();
      const currentConfigs = Array.isArray(currentData.configs) ? currentData.configs : [];

      const already = currentConfigs.some((c: any) => Number(c.custom_ingredient_id) === ingredientToAdd || Number(c.ingredient_id) === ingredientToAdd);
      if (already) {
        setShowAddToCategoryDialog(false);
        setIngredientToAdd(null);
        setAlertDialog({
          open: true,
          title: t('Info'),
          message: t('This ingredient is already added to this category.'),
          type: 'info',
        });
        return;
      }

      const newConfigs = [
        ...currentConfigs.map((c: any) => ({
          ingredient_id: c.custom_ingredient_id ?? c.ingredient_id,
          selection_type: c.selection_type || 'multiple',
          price_override: c.price_override ?? null,
          volume_prices: null,
        })),
        {
          ingredient_id: ingredientToAdd,
          selection_type: 'multiple',
          price_override: null,
          volume_prices: null,
        },
      ];

      const saveRes = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: newConfigs }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({}));
        throw new Error(err.error || t('Failed to save category configuration'));
      }

      setShowAddToCategoryDialog(false);
      setIngredientToAdd(null);
      setAlertDialog({
        open: true,
        title: t('Success'),
        message: t('Ingredient added to category successfully!'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error navigating to category config:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: (error as any)?.message || t('An error occurred while adding the ingredient.'),
        type: 'error',
      });
    }
  }

  async function openAttachments(ingredientId: number) {
    setIngredientToAdd(ingredientId);
    setShowAttachmentsDialog(true);
    setAttachmentsLoading(true);
    setAttachedCategories([]);
    setAttachedMenuItems([]);

    try {
      const res = await fetch(`/api/custom-ingredients/${ingredientId}/attachments`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || t('Failed to load attachments'));
      }
      const data = await res.json();
      setAttachedCategories(Array.isArray(data.categories) ? data.categories : []);
      setAttachedMenuItems(Array.isArray(data.menuItems) ? data.menuItems : []);
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to load attachments'),
        type: 'error',
      });
      setShowAttachmentsDialog(false);
      setIngredientToAdd(null);
    } finally {
      setAttachmentsLoading(false);
    }
  }

  async function detachFromCategory(categoryId: number) {
    if (!ingredientToAdd) return;

    const prev = attachedCategories;
    setAttachedCategories((p) => p.filter((c) => c.id !== categoryId));

    try {
      const res = await fetch(`/api/custom-ingredients/${ingredientToAdd}/attachments?category_id=${categoryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || t('Failed to detach'));
      }
    } catch (error: any) {
      setAttachedCategories(prev);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to detach'),
        type: 'error',
      });
    }
  }

  async function detachFromMenuItem(menuItemId: number) {
    if (!ingredientToAdd) return;

    const prev = attachedMenuItems;
    setAttachedMenuItems((p) => p.filter((i) => i.id !== menuItemId));

    try {
      const res = await fetch(`/api/custom-ingredients/${ingredientToAdd}/attachments?menu_item_id=${menuItemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || t('Failed to detach'));
      }
    } catch (error: any) {
      setAttachedMenuItems(prev);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: error.message || t('Failed to detach'),
        type: 'error',
      });
    }
  }

  async function handleDelete(id: number) {
    setConfirmDialog({
      open: true,
      title: t('Delete Ingredient'),
      description: t('Are you sure you want to delete this ingredient? This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/custom-ingredients/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
          fetchData();
          setAlertDialog({
            open: true,
              title: t('Success'),
              message: t('Ingredient deleted successfully!'),
            type: 'success',
          });
          } else {
            const error = await response.json();
          setAlertDialog({
            open: true,
              title: t('Error'),
              message: error.error || t('Failed to delete ingredient.'),
            type: 'error',
          });
        }
        } catch (error) {
          console.error('Error deleting ingredient:', error);
      setAlertDialog({
        open: true,
            title: t('Error'),
            message: t('An error occurred while deleting the ingredient.'),
        type: 'error',
      });
    }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }

  const filteredIngredients = ingredients.filter(i => i.ingredient_category === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading ingredients...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('Ingredients')}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t('Manage fruits, boosters, and toppings')}</p>
        </div>
        <Link href={`/admin/ingredients/add?category=${activeTab}`}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t('Add Ingredient')}
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="fruits">{t('Fruits')}</TabsTrigger>
          <TabsTrigger value="boosters">{t('Boosters')}</TabsTrigger>
          <TabsTrigger value="toppings">{t('Toppings')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'fruits' ? t('Fruits') : 
                 activeTab === 'boosters' ? t('Boosters') : 
                 t('Toppings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
                    {filteredIngredients.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">{t('No ingredients yet')}</p>
                  <Link href={`/admin/ingredients/add?category=${activeTab}`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('Add First Ingredient')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Name')}</TableHead>
                      <TableHead>{t('Description')}</TableHead>
                      <TableHead>{t('Price')}</TableHead>
                      <TableHead>{t('Available')}</TableHead>
                        <TableHead className="text-right">{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredIngredients
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((ingredient) => (
                          <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">{t(ingredient.name)}</TableCell>
                            <TableCell className="text-slate-500">
                              {ingredient.description ? t(ingredient.description) : '-'}
                        </TableCell>
                            <TableCell>₪{(typeof ingredient.price === 'number' ? ingredient.price : parseFloat(String(ingredient.price)) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                ingredient.is_available 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {ingredient.is_available ? t('Yes') : t('No')}
                      </span>
                    </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAttachments(ingredient.id)}
                                  className="text-slate-700 hover:text-slate-900"
                                  title={t('Manage Attachments')}
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIngredientToAdd(ingredient.id);
                                    fetchMenuItems();
                                    setShowAddToMenuItemDialog(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-700"
                                  title={t('Add to Menu Item')}
                                >
                                  <Coffee className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIngredientToAdd(ingredient.id);
                                    fetchCategories();
                                    setShowAddToCategoryDialog(true);
                                  }}
                                  className="text-purple-600 hover:text-purple-700"
                                  title={t('Add to Category')}
                                >
                                  <FolderOpen className="h-4 w-4" />
                                </Button>
                                <Link href={`/admin/ingredients/edit/${ingredient.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                <Button
                  variant="outline"
                  size="sm"
                                  onClick={() => handleDelete(ingredient.id)}
                                  className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                            </TableCell>
                          </TableRow>
                  ))}
                    </TableBody>
                  </Table>
                </div>
              )}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />

      {/* Dialog for selecting menu item to add ingredient */}
      <Dialog open={showAddToMenuItemDialog} onOpenChange={setShowAddToMenuItemDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Select Menu Item')}</DialogTitle>
            <DialogDescription>
              {t('Select a menu item to add the ingredient to')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {menuItems.length === 0 ? (
              <p className="text-center text-slate-400 py-8">{t('No menu items found')}</p>
            ) : (
              menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddIngredientToMenuItem(item.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{t(item.name)}</p>
                      {item.category_name && (
                        <p className="text-xs text-slate-500">{t(item.category_name)}</p>
                      )}
                    </div>
                    <Coffee className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddToMenuItemDialog(false);
                setIngredientToAdd(null);
              }}
            >
              {t('Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for selecting category to add ingredient */}
      <Dialog open={showAddToCategoryDialog} onOpenChange={setShowAddToCategoryDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Select Category')}</DialogTitle>
            <DialogDescription>
              {t('Select a category to add the ingredient to')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-center text-slate-400 py-8">{t('No categories found')}</p>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleAddIngredientToCategory(category.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{t(category.name)}</p>
                      {category.description && (
                        <p className="text-xs text-slate-500">{t(category.description)}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddToCategoryDialog(false);
                setIngredientToAdd(null);
              }}
            >
              {t('Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for managing attachments (detach) */}
      <Dialog open={showAttachmentsDialog} onOpenChange={setShowAttachmentsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Manage Attachments')}</DialogTitle>
            <DialogDescription>
              {t('Detach this ingredient from categories or menu items')}
            </DialogDescription>
          </DialogHeader>

          {attachmentsLoading ? (
            <div className="py-10">
              <LoadingSpinner size="md" text={t('Loading...')} />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{t('Categories')}</h3>
                {attachedCategories.length === 0 ? (
                  <p className="text-sm text-slate-500">{t('No categories attached')}</p>
                ) : (
                  <div className="space-y-2">
                    {attachedCategories.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{t(c.name)}</p>
                          {c.description && <p className="text-xs text-slate-500">{t(c.description)}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => detachFromCategory(c.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title={t('Detach')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{t('Menu Items')}</h3>
                {attachedMenuItems.length === 0 ? (
                  <p className="text-sm text-slate-500">{t('No menu items attached')}</p>
                ) : (
                  <div className="space-y-2">
                    {attachedMenuItems.map((i) => (
                      <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          {i.image && (
                            <img
                              src={i.image}
                              alt={i.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm text-slate-900">{t(i.name)}</p>
                            {i.category_name && <p className="text-xs text-slate-500">{t(i.category_name)}</p>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => detachFromMenuItem(i.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title={t('Detach')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAttachmentsDialog(false);
                setIngredientToAdd(null);
              }}
            >
              {t('Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
