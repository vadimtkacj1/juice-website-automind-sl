'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash, ChefHat, X } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export default function EditMenuItem() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { t, language } = useAdminLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
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
      const [itemResponse, volumesResponse, ingredientsResponse] = await Promise.all([
        fetch(`/api/menu-items/${itemId}`),
        fetch(`/api/menu-items/${itemId}/volumes`),
        fetch(`/api/menu-items/${itemId}/custom-ingredients`)
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
        price: '', // Price is now only in volume options
        volume: '', // Volume is now only in volume options
        image: item.image || '',
        discount_percent: (item.discount_percent || 0).toString(),
        is_available: item.is_available !== undefined ? item.is_available : true,
        sort_order: (item.sort_order || 0).toString()
      });

      // Fetch volume options
      if (volumesResponse.ok) {
        const volumesData = await volumesResponse.json();
        const volumes = volumesData.volumes || [];
        
        // If no volume options exist, create one from the item's price and volume
        if (volumes.length === 0 && item.price) {
          setVolumeOptions([{
            volume: item.volume || '',
            price: item.price,
            is_default: true,
            sort_order: 0
          }]);
        } else {
          setVolumeOptions(volumes);
        }
      } else if (item.price) {
        // If volumes endpoint failed but item has price, create default volume option
        setVolumeOptions([{
          volume: item.volume || '',
          price: item.price,
          is_default: true,
          sort_order: 0
        }]);
      }

      // Fetch ingredients
      if (ingredientsResponse.ok) {
        const ingredientsData = await ingredientsResponse.json();
        const itemIngredients = ingredientsData.ingredients || [];
        setSelectedIngredientIds(itemIngredients.map((ing: any) => ing.id));
      }

      // Fetch all available ingredients
      const allIngredientsResponse = await fetch('/api/custom-ingredients?include_inactive=true');
      if (allIngredientsResponse.ok) {
        const allIngredientsData = await allIngredientsResponse.json();
        setIngredients(allIngredientsData.ingredients || []);
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

      // Update menu item
      const response = await fetch(`/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: parseInt(form.category_id),
          name: form.name,
          description: form.description || null,
          price: defaultPrice,
          volume: defaultVolume,
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

      // Update ingredients
      const ingredientsResponse = await fetch(`/api/menu-items/${id}/custom-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_ids: selectedIngredientIds })
      });

      if (!ingredientsResponse.ok) {
        const data = await ingredientsResponse.json();
        console.error('Error updating ingredients:', data);
        // Don't fail the whole update if ingredients fail
      }

      router.push('/admin/menu');
    } catch (error) {
      console.error('Error updating item:', error);
      alert(t('Error updating item'));
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

  function toggleIngredient(ingredientId: number) {
    if (selectedIngredientIds.includes(ingredientId)) {
      setSelectedIngredientIds(selectedIngredientIds.filter(id => id !== ingredientId));
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, ingredientId]);
    }
  }

  async function removeIngredient(ingredientId: number) {
    if (!id) return;
    
    // Store previous state for potential rollback
    const previousIds = [...selectedIngredientIds];
    
    // Remove from local state immediately for better UX
    setSelectedIngredientIds(prev => prev.filter(id => id !== ingredientId));
    
    try {
      // Also remove from database
      const response = await fetch(`/api/menu-items/${id}/custom-ingredients?ingredient_id=${ingredientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If API call failed, restore the ingredient in the list
        setSelectedIngredientIds(previousIds);
        const errorData = await response.json();
        alert(errorData.error || t('Failed to remove ingredient'));
      }
    } catch (error) {
      // If error, restore the ingredient in the list
      setSelectedIngredientIds(previousIds);
      console.error('Error removing ingredient:', error);
      alert(t('Failed to remove ingredient'));
    }
  }

  const availableIngredients = ingredients.filter(ing => ing.is_available);
  const selectedIngredients = ingredients.filter(ing => selectedIngredientIds.includes(ing.id));


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
                <CardTitle>{t('Ingredients')}</CardTitle>
                <CardDescription>
                  {t('Add ingredients that customers can select when ordering this item')}
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => setShowIngredientDialog(true)}
                variant="outline"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                {t('Manage Ingredients')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedIngredients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">{t('No ingredients added yet')}</p>
                <Button
                  type="button"
                  onClick={() => setShowIngredientDialog(true)}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('Add Ingredients')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {ingredient.image && (
                        <img
                          src={ingredient.image}
                          alt={ingredient.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{t(ingredient.name)}</p>
                        <p className="text-xs text-gray-500">
                          {t(ingredient.ingredient_category)} • ₪{(typeof ingredient.price === 'number' ? ingredient.price : parseFloat(String(ingredient.price)) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
            {loading ? t('Updating...') : t('Update Item')}
          </Button>
          <Link href="/admin/menu">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
        </div>
      </form>

      {/* Dialog for managing ingredients */}
      <Dialog open={showIngredientDialog} onOpenChange={setShowIngredientDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Manage Ingredients')}</DialogTitle>
            <DialogDescription>
              {t('Select ingredients that customers can add to this menu item')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">{t('Available Ingredients')}</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                {availableIngredients.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">{t('No ingredients available')}</p>
                ) : (
                  availableIngredients.map((ingredient) => {
                    const isSelected = selectedIngredientIds.includes(ingredient.id);
                    return (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => toggleIngredient(ingredient.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-indigo-600"
                          />
                          {ingredient.image && (
                            <img
                              src={ingredient.image}
                              alt={ingredient.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{t(ingredient.name)}</p>
                            <p className="text-xs text-gray-500">
                              {t(ingredient.ingredient_category)} • ₪{ingredient.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowIngredientDialog(false)}
            >
              {t('Done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

