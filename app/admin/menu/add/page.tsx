'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface Category {
  id: number;
  name: string;
}

interface VolumeOption {
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

export default function AddMenuItem() {
  const router = useRouter();
  const { t, language } = useAdminLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    volume: '',
    image: '',
    discount_percent: '0',
    is_available: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/menu-categories');
      const data = await res.json();
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setForm(f => ({ ...f, category_id: data.categories[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate that at least one volume option exists
    if (volumeOptions.length === 0) {
      alert(t('Please add at least one price and volume option.'));
      return;
    }
    
    // Validate that all volume options have required fields
    const invalidOptions = volumeOptions.filter(vol => !vol.volume || vol.price === undefined || vol.price === null);
    if (invalidOptions.length > 0) {
      alert(t('Please fill in all required fields (volume and price) for all options.'));
      return;
    }
    
    setLoading(true);

    try {
      // Use default volume option price if available, otherwise 0
      const defaultPrice = volumeOptions.length > 0 && volumeOptions[0].price 
        ? volumeOptions[0].price 
        : 0;
      const defaultVolume = volumeOptions.length > 0 && volumeOptions[0].volume 
        ? volumeOptions[0].volume 
        : null;

      // Create menu item first
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: parseInt(form.category_id),
          price: defaultPrice,
          volume: defaultVolume,
          image: form.image || null, // Explicitly include image
          discount_percent: parseFloat(form.discount_percent) || 0
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || t('Error adding item'));
        setLoading(false);
        return;
      }

      const itemData = await response.json();
      const newItemId = itemData.id || itemData.item?.id;

      // If volume options exist, add them
      if (volumeOptions.length > 0 && newItemId) {
        const volumesResponse = await fetch(`/api/menu-items/${newItemId}/volumes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volumes: volumeOptions })
        });

        if (!volumesResponse.ok) {
          const data = await volumesResponse.json();
          alert(data.error || t('Item created but error adding volume options'));
        }
      }

      router.push('/admin/menu');
    } catch (error) {
      console.error('Error adding item:', error);
      alert(t('Error adding item'));
    }
    setLoading(false);
  }

  function addVolumeOption() {
    // Use price from first volume option if available, otherwise 0
    const defaultPrice = volumeOptions.length > 0 && volumeOptions[0].price 
      ? volumeOptions[0].price 
      : 0;
    
    setVolumeOptions([...volumeOptions, {
      volume: '',
      price: defaultPrice,
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

  return (
    <div className="space-y-6" dir={language}>
      <div className="flex items-center gap-4">
        <Link href="/admin/menu">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Add Menu Item')}</h1>
          <p className="text-gray-500 mt-1">{t('New menu item')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Item Details')}</CardTitle>
            <CardDescription>{t('Fill in the item information')}</CardDescription>
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

            <div className="grid grid-cols-2 gap-4">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{t('Note:')}</strong> {t('Price and volume are configured in the "Volume Options" section below. Set at least one volume option with price.')}
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
            <CardDescription>{t('Upload or add an image URL')}</CardDescription>
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
                <CardTitle>{t('Price & Volume Options')}</CardTitle>
                <CardDescription>
                  {t('Configure prices and volumes for this item. At least one option is required. Customers will choose from these when ordering.')}
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
                {t('Add Option')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {volumeOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium text-red-600 mb-2">{t('At least one price and volume option is required!')}</p>
                <p className="text-sm mt-2">{t('Click "Add Option" to create price and volume options for this item.')}</p>
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

        <div className="lg:col-span-2 flex gap-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? t('Adding...') : t('Add Item')}
          </Button>
          <Link href="/admin/menu">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
