'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  volume?: string;
  image?: string;
  discount_percent: number;
  is_available: boolean;
  sort_order?: number;
}

interface VolumeOption {
  id?: number;
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

interface AdditionalItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

export default function EditMenuItem() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { t, language } = useAdminLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([]);
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    volume: '',
    image: '',
    discount_percent: '0',
    is_available: true,
    sort_order: '0'
  });

  useEffect(() => {
    if (id) {
      fetchCategories();
      fetchMenuItem(Number(id));
    }
  }, [id]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/menu-categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchMenuItem(itemId: number) {
    setInitialLoading(true);
    try {
      const [itemResponse, volumesResponse, additionalItemsResponse] = await Promise.all([
        fetch(`/api/menu-items/${itemId}`),
        fetch(`/api/menu-items/${itemId}/volumes`),
        fetch(`/api/menu-items/${itemId}/additional-items`)
      ]);
      
      if (!itemResponse.ok) {
        if (itemResponse.status === 404) {
          alert(t('Menu item not found'));
          router.push('/admin/menu');
          return;
        }
        throw new Error('Failed to fetch menu item');
      }
      
      const itemData = await itemResponse.json();
      const item: MenuItem = itemData.item;
      
      setForm({
        category_id: item.category_id.toString(),
        name: item.name || '',
        description: item.description || '',
        price: item.price.toString(),
        volume: item.volume || '',
        image: item.image || '',
        discount_percent: (item.discount_percent || 0).toString(),
        is_available: item.is_available !== undefined ? item.is_available : true,
        sort_order: (item.sort_order || 0).toString()
      });

      // Fetch volume options
      if (volumesResponse.ok) {
        const volumesData = await volumesResponse.json();
        setVolumeOptions(volumesData.volumes || []);
      }

      // Fetch additional items
      if (additionalItemsResponse.ok) {
        const additionalItemsData = await additionalItemsResponse.json();
        setAdditionalItems(additionalItemsData.additionalItems || []);
      }
    } catch (error) {
      console.error('Error fetching menu item:', error);
      alert(t('Error loading menu item'));
      router.push('/admin/menu');
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Update menu item
      const response = await fetch(`/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: parseInt(form.category_id),
          name: form.name,
          description: form.description || null,
          price: parseFloat(form.price),
          volume: form.volume || null,
          image: form.image || null,
          discount_percent: parseFloat(form.discount_percent) || 0,
          is_available: form.is_available,
          sort_order: parseInt(form.sort_order) || 0
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || t('Error updating item'));
        setLoading(false);
        return;
      }

      // Update volume options
      const volumesResponse = await fetch(`/api/menu-items/${id}/volumes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volumes: volumeOptions })
      });

      if (!volumesResponse.ok) {
        const data = await volumesResponse.json();
        alert(data.error || t('Error updating volume options'));
        setLoading(false);
        return;
      }

      // Save additional items (delete all and recreate)
      // First, delete all existing additional items
      const existingItems = additionalItems.filter(item => item.id);
      for (const item of existingItems) {
        await fetch(`/api/menu-items/${id}/additional-items/${item.id}`, {
          method: 'DELETE'
        });
      }

      // Then create new ones
      for (const item of additionalItems) {
        await fetch(`/api/menu-items/${id}/additional-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            description: item.description || null,
            price: item.price,
            is_available: item.is_available,
            sort_order: item.sort_order
          })
        });
      }

      router.push('/admin/menu');
    } catch (error) {
      console.error('Error updating item:', error);
      alert(t('Error updating item'));
    }
    setLoading(false);
  }

  function addVolumeOption() {
    setVolumeOptions([...volumeOptions, {
      volume: '',
      price: parseFloat(form.price) || 0,
      is_default: volumeOptions.length === 0,
      sort_order: volumeOptions.length
    }]);
  }

  function removeVolumeOption(index: number) {
    const newVolumes = volumeOptions.filter((_, i) => i !== index);
    // If we removed the default, make the first one default
    if (newVolumes.length > 0 && volumeOptions[index].is_default) {
      newVolumes[0].is_default = true;
    }
    setVolumeOptions(newVolumes);
  }

  function updateVolumeOption(index: number, field: keyof VolumeOption, value: any) {
    const newVolumes = [...volumeOptions];
    if (field === 'is_default' && value) {
      // Only one default allowed
      newVolumes.forEach((v, i) => {
        v.is_default = i === index;
      });
    } else {
      newVolumes[index] = { ...newVolumes[index], [field]: value };
    }
    setVolumeOptions(newVolumes);
  }

  const addAdditionalItem = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAdditionalItems(prev => {
      const newItem = {
        name: '',
        description: '',
        price: 0,
        is_available: true,
        sort_order: prev.length
      };
      return [...prev, newItem];
    });
  }, []);

  function removeAdditionalItem(index: number) {
    setAdditionalItems(additionalItems.filter((_, i) => i !== index));
  }

  function updateAdditionalItem(index: number, field: keyof AdditionalItem, value: any) {
    const newItems = [...additionalItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setAdditionalItems(newItems);
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading menu item...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/menu">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Edit Menu Item')}</h1>
          <p className="text-gray-500 mt-1">{t('Modify menu item details')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Item Details')}</CardTitle>
            <CardDescription>{t('Update the item information')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">{t('Category *')}</Label>
              <select
                id="category"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="name">{t('Name *')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('Orange Juice')}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">{t('Description')}</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('Fresh squeezed orange juice')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">{t('Price (₪) *')}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder={t('25')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="volume">{t('Volume/Size')}</Label>
                <Input
                  id="volume"
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  placeholder={t('0.5L')}
                />
              </div>
              <div>
                <Label htmlFor="discount">{t('Discount (%)')}</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount_percent}
                  onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                  placeholder={t('0')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sort_order">{t('Sort Order')}</Label>
              <Input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                placeholder={t('0')}
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('Lower numbers appear first')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="available">{t('Available for order')}</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Item Image')}</CardTitle>
            <CardDescription>{t('Upload or update the image URL')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="menu"
              label={t('Product Image')}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('Volume Options')}</CardTitle>
                <CardDescription>
                  {t('Define multiple volume/size options for this item. Customers can choose from these when ordering.')}
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={addVolumeOption}
                variant="outline"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Volume')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {volumeOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('No volume options defined.')}</p>
                <p className="text-sm mt-2">{t('Click "Add Volume" to create volume options for this item.')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {volumeOptions.map((vol, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div className="col-span-4">
                      <Label htmlFor={`vol-${index}`}>{t('Volume/Size *')}</Label>
                      <Input
                        id={`vol-${index}`}
                        value={vol.volume}
                        onChange={(e) => updateVolumeOption(index, 'volume', e.target.value)}
                        placeholder={t('0.5L')}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`price-${index}`}>{t('Price (₪) *')}</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        step="0.01"
                        value={vol.price}
                        onChange={(e) => updateVolumeOption(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder={t('25')}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`sort-${index}`}>{t('Sort Order')}</Label>
                      <Input
                        id={`sort-${index}`}
                        type="number"
                        value={vol.sort_order}
                        onChange={(e) => updateVolumeOption(index, 'sort_order', parseInt(e.target.value) || 0)}
                        placeholder={t('0')}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`default-${index}`}
                          checked={vol.is_default}
                          onChange={(e) => updateVolumeOption(index, 'is_default', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`default-${index}`} className="cursor-pointer text-sm">
                          {t('Default')}
                        </Label>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeVolumeOption(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('Additional Items')}</CardTitle>
                <CardDescription>
                  {t('Add optional items like "Bigger Glass" or "More KG" that customers can select when buying this item.')}
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  addAdditionalItem(e);
                }}
                variant="outline"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                formNoValidate
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Item')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {additionalItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('No additional items defined.')}</p>
                <p className="text-sm mt-2">{t('Click "Add Item" to create additional options for this item.')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {additionalItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div className="col-span-4">
                      <Label htmlFor={`add-name-${index}`}>{t('Name *')}</Label>
                      <Input
                        id={`add-name-${index}`}
                        value={item.name}
                        onChange={(e) => updateAdditionalItem(index, 'name', e.target.value)}
                        placeholder={t('Bigger Glass')}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`add-price-${index}`}>{t('Price (₪) *')}</Label>
                      <Input
                        id={`add-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateAdditionalItem(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder={t('5')}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`add-sort-${index}`}>{t('Sort Order')}</Label>
                      <Input
                        id={`add-sort-${index}`}
                        type="number"
                        value={item.sort_order}
                        onChange={(e) => updateAdditionalItem(index, 'sort_order', parseInt(e.target.value) || 0)}
                        placeholder={t('0')}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`add-available-${index}`}
                          checked={item.is_available}
                          onChange={(e) => updateAdditionalItem(index, 'is_available', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`add-available-${index}`} className="text-sm">
                          {t('Available')}
                        </Label>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeAdditionalItem(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="col-span-12">
                      <Label htmlFor={`add-desc-${index}`}>{t('Description')}</Label>
                      <Input
                        id={`add-desc-${index}`}
                        value={item.description || ''}
                        onChange={(e) => updateAdditionalItem(index, 'description', e.target.value)}
                        placeholder={t('Optional description')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex gap-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? t('Updating...') : t('Update Item')}
          </Button>
          <Link href="/admin/menu">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

