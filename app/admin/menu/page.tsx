'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Percent, FolderOpen, Coffee } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MenuItem {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description?: string;
  price: number;
  volume?: string;
  image?: string;
  discount_percent: number;
  is_available: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newDiscount, setNewDiscount] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    sort_order: '0',
    is_active: true 
  });
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showAddIngredientDialog, setShowAddIngredientDialog] = useState(false);
  const [ingredientToAdd, setIngredientToAdd] = useState<number | null>(null);
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
    const addIngredient = searchParams?.get('addIngredient');
    if (addIngredient) {
      const ingredientId = parseInt(addIngredient);
      if (!isNaN(ingredientId)) {
        setIngredientToAdd(ingredientId);
        setShowAddIngredientDialog(true);
        // Remove the parameter from URL
        router.replace('/admin/menu', { scroll: false });
      }
    }
  }, [searchParams, router]);

  async function fetchData() {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch('/api/menu-items?include_inactive=true'),
        fetch('/api/menu-categories?include_inactive=true')
      ]);
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      setItems(itemsData.items || []);
      setCategories(catsData.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  async function handleDeleteItem(id: number) {
    setConfirmDialog({
      open: true,
      title: t('Delete Menu Item'),
      description: t('Are you sure you want to delete this menu item? This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchData();
            setAlertDialog({
              open: true,
              title: t('Success'),
              message: t('Menu item deleted successfully.'),
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: t('Error'),
              message: data.error || t('Failed to delete menu item.'),
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: t('An error occurred while deleting the menu item.'),
            type: 'error',
          });
        }
      },
    });
  }

  async function handleDeleteCategory(id: number) {
    setConfirmDialog({
      open: true,
      title: t('Delete Category'),
      description: t('Are you sure you want to delete this category? Make sure to remove all items from this category first. This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/menu-categories/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchData();
            setAlertDialog({
              open: true,
              title: t('Success'),
              message: t('Category deleted successfully.'),
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: t('Error'),
              message: data.error || t('Error deleting category.'),
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: t('An error occurred while deleting the category.'),
            type: 'error',
          });
        }
      },
    });
  }

  async function toggleItemAvailability(item: MenuItem) {
    try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !item.is_available })
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  function openDiscountDialog(item: MenuItem) {
    if (showDiscountForm && selectedItem?.id === item.id) {
      setShowDiscountForm(false);
      setSelectedItem(null);
      setNewDiscount('');
    } else {
      setSelectedItem(item);
      setNewDiscount(item.discount_percent.toString());
      setShowDiscountForm(true);
    }
  }

  async function updateDiscount() {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/menu-items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_percent: parseFloat(newDiscount) || 0 })
      });
      if (response.ok) {
        fetchData();
        setShowDiscountForm(false);
        setSelectedItem(null);
        setNewDiscount('');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
    }
  }

  function openCategoryDialog(category?: MenuCategory) {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ 
        name: category.name, 
        description: category.description || '',
        sort_order: (category.sort_order || 0).toString(),
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ 
        name: '', 
        description: '',
        sort_order: '0',
        is_active: true
      });
    }
    setShowCategoryForm(true);
  }

  async function saveCategory() {
    if (!categoryForm.name.trim()) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Category name is required.'),
        type: 'warning',
      });
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/menu-categories/${editingCategory.id}` 
        : '/api/menu-categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        sort_order: parseInt(categoryForm.sort_order) || 0,
        ...(editingCategory ? { is_active: categoryForm.is_active } : {})
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        fetchData();
        setShowCategoryForm(false);
        setEditingCategory(null);
        setAlertDialog({
          open: true,
          title: t('Success'),
          message: editingCategory ? t('Category updated successfully.') : t('Category created successfully.'),
          type: 'success',
        });
      } else {
        const data = await response.json();
        setAlertDialog({
          open: true,
          title: t('Error'),
          message: data.error || t('Error saving category.'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('An error occurred while saving the category.'),
        type: 'error',
      });
    }
  }

  async function handleAddIngredientToItem(itemId: number) {
    if (!ingredientToAdd) return;

    try {
      // First, get current ingredients for this item
      const currentResponse = await fetch(`/api/menu-items/${itemId}/custom-ingredients`);
      const currentData = await currentResponse.json();
      const currentIngredientIds = (currentData.ingredients || []).map((ing: any) => ing.id);
      
      // Add the new ingredient if it's not already there
      if (!currentIngredientIds.includes(ingredientToAdd)) {
        const newIngredientIds = [...currentIngredientIds, ingredientToAdd];
        
        const response = await fetch(`/api/menu-items/${itemId}/custom-ingredients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredient_ids: newIngredientIds })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Ingredient added successfully:', result);
          
          // Refresh the menu items to show updated ingredients
          fetchMenu();
          
          setShowAddIngredientDialog(false);
          setIngredientToAdd(null);
          setAlertDialog({
            open: true,
            title: t('Success'),
            message: t('Ingredient added to menu item successfully!'),
            type: 'success',
          });
        } else {
          const data = await response.json();
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: data.error || t('Failed to add ingredient to menu item.'),
            type: 'error',
          });
        }
      } else {
        setShowAddIngredientDialog(false);
        setIngredientToAdd(null);
        setAlertDialog({
          open: true,
          title: t('Info'),
          message: t('This ingredient is already added to this menu item.'),
          type: 'info',
        });
      }
    } catch (error) {
      console.error('Error adding ingredient to item:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('An error occurred while adding the ingredient.'),
        type: 'error',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading menu...')} />
      </div>
    );
  }

  const stats = [
    { title: t('Categories'), value: categories.length, icon: FolderOpen, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: t('Total Items'), value: items.length, icon: Coffee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: t('Available'), value: items.filter(i => i.is_available).length, icon: Coffee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: t('On Sale'), value: items.filter(i => i.discount_percent > 0).length, icon: Percent, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('Menu Management')}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{t('Categories, items, prices and discounts')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-xl`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.75} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="items" className="rounded-md px-4">{t('Menu Items')}</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-md px-4">{t('Categories')}</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{t('All Items')}</CardTitle>
                <Link href="/admin/menu/add">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4">
                    <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                    {t('Add Item')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {items.length === 0 ? (
                <p className="text-center text-slate-400 py-12 text-sm">{t('No items yet')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="text-xs font-medium text-slate-500">{t('Name')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Category')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Price')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Discount')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Status')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="border-slate-100">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-9 h-9 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm text-slate-900">{t(item.name)}</p>
                                {item.volume && (
                                  <p className="text-xs text-slate-500">{item.volume}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">{t(item.category_name)}</TableCell>
                          <TableCell className="font-semibold text-sm">₪{item.price}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => openDiscountDialog(item)}
                              className={cn(
                                'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                                item.discount_percent > 0 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              )}
                            >
                              {item.discount_percent > 0 ? `-${item.discount_percent}%` : '0%'}
                            </button>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => toggleItemAvailability(item)}
                              className={cn(
                                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                                item.is_available
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              )}
                            >
                              {item.is_available ? t('Available') : t('Unavailable')}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/admin/menu/edit/${item.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700">
                                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
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

        <TabsContent value="categories">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{t('Categories')}</CardTitle>
                <Link href="/admin/menu/categories/add">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4">
                    <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                    {t('Add Category')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {categories.length === 0 ? (
                <p className="text-center text-slate-400 py-12 text-sm">{t('No categories yet')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="text-xs font-medium text-slate-500">{t('Name')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Description')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Items')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Order')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Status')}</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id} className="border-slate-100">
                          <TableCell className="font-medium text-sm">{t(cat.name)}</TableCell>
                          <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                            {cat.description ? t(cat.description) : '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {items.filter(i => i.category_id === cat.id).length}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">{cat.sort_order || 0}</TableCell>
                          <TableCell>
                            <span className={cn(
                              'px-2 py-1 rounded-md text-xs font-medium',
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            )}>
                              {cat.is_active ? t('Active') : t('Inactive')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/admin/menu/categories/edit/${cat.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700">
                                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
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

      {/* Discount Form */}
      {showDiscountForm && selectedItem && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t('Set Discount')}</CardTitle>
            <p className="text-sm text-slate-500">{t('Discount for:')} {selectedItem?.name ? t(selectedItem.name) : ''}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-slate-500">{t('Current Price')}</Label>
                <p className="text-xl font-semibold text-slate-900 mt-1">₪{selectedItem?.price}</p>
              </div>
              <div>
                <Label htmlFor="discount" className="text-xs text-slate-500">{t('Discount (%)')}</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              {parseFloat(newDiscount) > 0 && selectedItem && (
                <div>
                  <Label className="text-xs text-slate-500">{t('Discounted Price')}</Label>
                  <p className="text-xl font-semibold text-emerald-600 mt-1">
                    ₪{(selectedItem.price * (1 - parseFloat(newDiscount) / 100)).toFixed(0)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowDiscountForm(false);
                setSelectedItem(null);
                setNewDiscount('');
              }} className="border-slate-200">
                {t('Cancel')}
              </Button>
              <Button onClick={updateDiscount} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {t('Save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Form */}
      {showCategoryForm && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              {editingCategory ? t('Edit Category') : t('New Category')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cat-name" className="text-xs text-slate-500">{t('Name')} *</Label>
                <Input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder={t('Fresh Juices')}
                  required
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cat-desc" className="text-xs text-slate-500">{t('Description')}</Label>
                <Input
                  id="cat-desc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder={t('Category description (optional)')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cat-sort" className="text-xs text-slate-500">{t('Sort Order')}</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
                <p className="text-xs text-slate-400 mt-1">{t('Lower numbers appear first')}</p>
              </div>
              {editingCategory && (
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="cat-active" className="cursor-pointer text-sm">
                    {t('Active')}
                  </Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }} className="border-slate-200">
                {t('Cancel')}
              </Button>
              <Button onClick={saveCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingCategory ? t('Update') : t('Create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />

      {/* Dialog for selecting menu item to add ingredient */}
      <Dialog open={showAddIngredientDialog} onOpenChange={setShowAddIngredientDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Select Menu Item')}</DialogTitle>
            <DialogDescription>
              {t('Select a menu item to add the ingredient to')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-slate-400 py-8">{t('No menu items found')}</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddIngredientToItem(item.id)}
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
                      <p className="text-xs text-slate-500">{t(item.category_name)}</p>
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
                setShowAddIngredientDialog(false);
                setIngredientToAdd(null);
              }}
            >
              {t('Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
