'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface PromptProduct {
  product_name: string;
  product_price: number;
  volume_option?: string;
  sort_order: number;
}

export default function AddOrderPrompt() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt_type: 'additional_items',
    is_active: true,
    sort_order: 0,
    show_on_all_products: true,
  });
  const [products, setProducts] = useState<PromptProduct[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const addProduct = () => {
    setProducts([...products, { product_name: '', product_price: 0, sort_order: products.length }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/order-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, products }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push('/admin/order-prompts');
    } catch (error: any) {
      console.error('Error adding order prompt:', error);
      alert(t('Failed to add order prompt.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8" dir={language}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('Add New Order Prompt')}</CardTitle>
          <CardDescription>{t('Enter the details for a new order prompt.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('Prompt Title')}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('e.g., Would you like to add additional items?')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('Prompt Description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('Optional description for the prompt')}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prompt_type">{t('Prompt Type')}</Label>
                <Select
                  value={formData.prompt_type}
                  onValueChange={(value) => setFormData({ ...formData, prompt_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="additional_items">{t('Additional Items')}</SelectItem>
                    <SelectItem value="volume_weight">{t('Volume/Weight')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('Sort Order')}</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                />
                <Label htmlFor="is_active" className="font-medium cursor-pointer">{t('Is Active')}</Label>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {formData.is_active ? t('ON') : t('OFF')}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <Switch
                  id="show_on_all_products"
                  checked={formData.show_on_all_products}
                  onCheckedChange={(checked) => handleSwitchChange('show_on_all_products', checked)}
                />
                <Label htmlFor="show_on_all_products" className="font-medium cursor-pointer">{t('Show on All Products')}</Label>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.show_on_all_products 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {formData.show_on_all_products ? t('ON') : t('OFF')}
              </span>
            </div>

            {/* Products Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">{t('Add Products')}</Label>
                <Button type="button" onClick={addProduct} variant="outline" size="sm">
                  <span className="mr-2">+</span> {t('Add Product')}
                </Button>
              </div>
              {products.map((product, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>{t('Product Name')}</Label>
                    <Input
                      value={product.product_name}
                      onChange={(e) => updateProduct(index, 'product_name', e.target.value)}
                      placeholder={t('Product name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Product Price')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={product.product_price}
                      onChange={(e) => updateProduct(index, 'product_price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Volume Option')}</Label>
                    <Input
                      value={product.volume_option || ''}
                      onChange={(e) => updateProduct(index, 'volume_option', e.target.value)}
                      placeholder={t('e.g., 500ml, 1kg')}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProduct(index)}
                    >
                      {t('Remove')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/admin/order-prompts">
                <Button type="button" variant="outline">{t('Cancel')}</Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('Adding...') : t('Add Order Prompt')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

