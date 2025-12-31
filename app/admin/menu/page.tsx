'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash, Percent, FolderOpen, Coffee } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';

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
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newDiscount, setNewDiscount] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    sort_order: '0',
    is_active: true 
  });
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
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
      title: 'Delete Menu Item',
      description: 'Are you sure you want to delete this menu item? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchData();
            setAlertDialog({
              open: true,
              title: 'Success',
              message: 'Menu item deleted successfully.',
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: 'Error',
              message: data.error || 'Failed to delete menu item.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          setAlertDialog({
            open: true,
            title: 'Error',
            message: 'An error occurred while deleting the menu item.',
            type: 'error',
          });
        }
      },
    });
  }

  async function handleDeleteCategory(id: number) {
    setConfirmDialog({
      open: true,
      title: 'Delete Category',
      description: 'Are you sure you want to delete this category? Make sure to remove all items from this category first. This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/menu-categories/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchData();
            setAlertDialog({
              open: true,
              title: 'Success',
              message: 'Category deleted successfully.',
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: 'Error',
              message: data.error || 'Error deleting category.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          setAlertDialog({
            open: true,
            title: 'Error',
            message: 'An error occurred while deleting the category.',
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
    setSelectedItem(item);
    setNewDiscount(item.discount_percent.toString());
    setShowDiscountDialog(true);
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
        setShowDiscountDialog(false);
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
    setShowCategoryDialog(true);
  }

  async function saveCategory() {
    if (!categoryForm.name.trim()) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        message: 'Category name is required.',
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
        setShowCategoryDialog(false);
        setAlertDialog({
          open: true,
          title: 'Success',
          message: editingCategory ? 'Category updated successfully.' : 'Category created successfully.',
          type: 'success',
        });
      } else {
        const data = await response.json();
        setAlertDialog({
          open: true,
          title: 'Error',
          message: data.error || 'Error saving category.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'An error occurred while saving the category.',
        type: 'error',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading menu..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <p className="text-gray-500 mt-1">Categories, items, prices and discounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Coffee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter(i => i.is_available).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Sale</CardTitle>
            <Percent className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.filter(i => i.discount_percent > 0).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Items</CardTitle>
                  <CardDescription>Manage menu items</CardDescription>
                </div>
                <Link href="/admin/menu/add">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.volume && (
                                <p className="text-xs text-gray-500">{item.volume}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{item.category_name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">₪{item.price}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDiscountDialog(item)}
                            className={item.discount_percent > 0 ? 'text-red-600' : ''}
                          >
                            {item.discount_percent > 0 ? `-${item.discount_percent}%` : 'None'}
                            <Percent className="ml-1 h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleItemAvailability(item)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              item.is_available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin/menu/edit/${item.id}`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage menu categories</CardDescription>
                </div>
                <Link href="/admin/menu/categories/add">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No categories yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                          {cat.description || '—'}
                        </TableCell>
                        <TableCell>
                          {items.filter(i => i.category_id === cat.id).length}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{cat.sort_order || 0}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cat.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin/menu/categories/edit/${cat.id}`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(cat.id)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Discount</DialogTitle>
            <DialogDescription>
              Discount for: {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-price">Current Price</Label>
              <p className="text-2xl font-bold">₪{selectedItem?.price}</p>
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="0"
              />
            </div>
            {parseFloat(newDiscount) > 0 && selectedItem && (
              <div>
                <Label>Discounted Price</Label>
                <p className="text-2xl font-bold text-red-600">
                  ₪{(selectedItem.price * (1 - parseFloat(newDiscount) / 100)).toFixed(0)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateDiscount} className="bg-purple-600 hover:bg-purple-700 text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update category information' 
                : 'Create a new menu category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Fresh Juices"
                required
              />
            </div>
            <div>
              <Label htmlFor="cat-desc">Description</Label>
              <Input
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cat-sort">Sort Order</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>
              {editingCategory && (
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="cat-active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} className="bg-purple-600 hover:bg-purple-700 text-white">
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Alert Dialog */}
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
