'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash, Pencil, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

export default function DiscountsPage() {
  const { t, language } = useAdminLanguage();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Discount Dialog
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    id: null,
    name: '',
    type: 'percentage',
    value: '',
    product_id: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });

  // Promo Code Dialog
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoForm, setPromoForm] = useState({
    id: null,
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    usage_limit: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [discountsRes, promosRes, productsRes] = await Promise.all([
        fetch('/api/discounts'),
        fetch('/api/promo-codes'),
        fetch('/api/products')
      ]);

      const [discountsData, promosData, productsData] = await Promise.all([
        discountsRes.json(),
        promosRes.json(),
        productsRes.json()
      ]);

      setDiscounts(discountsData);
      setPromoCodes(promosData);
      setProducts(productsData.products || productsData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePromoCode = async () => {
    try {
      const response = await fetch('/api/promo-codes/generate');
      const data = await response.json();
      setPromoForm({ ...promoForm, code: data.code });
    } catch (error) {
      console.error('Failed to generate promo code:', error);
    }
  };

  const saveDiscount = async () => {
    try {
      const url = discountForm.id ? `/api/discounts/${discountForm.id}` : '/api/discounts';
      const method = discountForm.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...discountForm,
          product_id: discountForm.product_id || null,
          value: parseFloat(discountForm.value)
        })
      });

      if (response.ok) {
        fetchData();
        setShowDiscountDialog(false);
        resetDiscountForm();
      }
    } catch (error) {
      console.error('Failed to save discount:', error);
    }
  };

  const savePromoCode = async () => {
    try {
      const url = promoForm.id ? `/api/promo-codes/${promoForm.id}` : '/api/promo-codes';
      const method = promoForm.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...promoForm,
          discount_value: parseFloat(promoForm.discount_value),
          usage_limit: promoForm.usage_limit ? parseInt(promoForm.usage_limit) : null
        })
      });

      if (response.ok) {
        fetchData();
        setShowPromoDialog(false);
        resetPromoForm();
      } else {
        const data = await response.json();
        alert(data.error || t('Failed to save promo code'));
      }
    } catch (error) {
      console.error('Failed to save promo code:', error);
    }
  };

  const deleteDiscount = async (id: number) => {
    if (!confirm(t('Are you sure you want to delete this discount?'))) return;

    try {
      const response = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete discount:', error);
    }
  };

  const deletePromoCode = async (id: number) => {
    if (!confirm(t('Are you sure you want to delete this promo code?'))) return;

    try {
      const response = await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete promo code:', error);
    }
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      id: null,
      name: '',
      type: 'percentage',
      value: '',
      product_id: '',
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const resetPromoForm = () => {
    setPromoForm({
      id: null,
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      usage_limit: '',
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading discounts...')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir={language}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('Discounts & Promo Codes')}</h1>
        <p className="text-gray-500 mt-1">{t('Manage discounts and promotional codes')}</p>
      </div>

      <Tabs defaultValue="discounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discounts">{t('Discounts')}</TabsTrigger>
          <TabsTrigger value="promo-codes">{t('Promo Codes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('Product Discounts')}</CardTitle>
                  <CardDescription>{t('Manage discounts for products')}</CardDescription>
                </div>
                <Button onClick={() => { resetDiscountForm(); setShowDiscountDialog(true); }} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('Add Discount')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {discounts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Name')}</TableHead>
                      <TableHead>{t('Type')}</TableHead>
                      <TableHead>{t('Value')}</TableHead>
                      <TableHead>{t('Product')}</TableHead>
                      <TableHead>{t('Status')}</TableHead>
                      <TableHead>{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-medium">{t(discount.name)}</TableCell>
                        <TableCell className="capitalize">{t(discount.type)}</TableCell>
                        <TableCell>
                          {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                        </TableCell>
                        <TableCell>{discount.product_name ? t(discount.product_name) : t('All Products')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            discount.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {discount.is_active ? t('Active') : t('Inactive')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDiscount(discount.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">{t('No discounts yet')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promo-codes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('Promo Codes')}</CardTitle>
                  <CardDescription>{t('Manage promotional codes for customers')}</CardDescription>
                </div>
                <Button onClick={() => { resetPromoForm(); generatePromoCode(); setShowPromoDialog(true); }} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('Generate Promo Code')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {promoCodes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Code')}</TableHead>
                      <TableHead>{t('Type')}</TableHead>
                      <TableHead>{t('Value')}</TableHead>
                      <TableHead>{t('Usage')}</TableHead>
                      <TableHead>{t('Status')}</TableHead>
                      <TableHead>{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                        <TableCell className="capitalize">{t(promo.discount_type)}</TableCell>
                        <TableCell>
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                        </TableCell>
                        <TableCell>
                          {promo.used_count} / {promo.usage_limit || '∞'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {promo.is_active ? t('Active') : t('Inactive')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePromoCode(promo.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">{t('No promo codes yet')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent dir={language}>
          <DialogHeader>
            <DialogTitle>{discountForm.id ? t('Edit') : t('Add')} {t('Discount')}</DialogTitle>
            <DialogDescription>{t('Configure discount settings')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="discount-name">{t('Discount Name')}</Label>
              <Input
                id="discount-name"
                value={discountForm.name}
                onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                placeholder={t('Summer Sale')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount-type">{t('Type')}</Label>
                <select
                  id="discount-type"
                  value={discountForm.type}
                  onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="percentage">{t('Percentage')}</option>
                  <option value="fixed">{t('Fixed Amount')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="discount-value">{t('Value')}</Label>
                <Input
                  id="discount-value"
                  type="number"
                  step="0.01"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                  placeholder={discountForm.type === 'percentage' ? '20' : '10.00'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="discount-product">{t('Product (Optional)')}</Label>
              <select
                id="discount-product"
                value={discountForm.product_id}
                onChange={(e) => setDiscountForm({ ...discountForm, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">{t('All Products')}</option>
                {Array.isArray(products) && products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {t(product.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="discount-active"
                checked={discountForm.is_active}
                onChange={(e) => setDiscountForm({ ...discountForm, is_active: e.target.checked })}
              />
              <Label htmlFor="discount-active">{t('Active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
              {t('Cancel')}
            </Button>
            <Button onClick={saveDiscount} className="bg-purple-600 hover:bg-purple-700 text-white">{t('Save Discount')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent dir={language}>
          <DialogHeader>
            <DialogTitle>{promoForm.id ? t('Edit') : t('Generate')} {t('Promo Code')}</DialogTitle>
            <DialogDescription>{t('Configure promo code settings')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="promo-code">{t('Promo Code')}</Label>
              <div className="flex gap-2">
                <Input
                  id="promo-code"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={generatePromoCode}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-type">{t('Discount Type')}</Label>
                <select
                  id="promo-type"
                  value={promoForm.discount_type}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="percentage">{t('Percentage')}</option>
                  <option value="fixed">{t('Fixed Amount')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="promo-value">{t('Discount Value')}</Label>
                <Input
                  id="promo-value"
                  type="number"
                  step="0.01"
                  value={promoForm.discount_value}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                  placeholder={promoForm.discount_type === 'percentage' ? '20' : '10.00'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="usage-limit">{t('Usage Limit (Optional)')}</Label>
              <Input
                id="usage-limit"
                type="number"
                value={promoForm.usage_limit}
                onChange={(e) => setPromoForm({ ...promoForm, usage_limit: e.target.value })}
                placeholder={t('Leave empty for unlimited')}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="promo-active"
                checked={promoForm.is_active}
                onChange={(e) => setPromoForm({ ...promoForm, is_active: e.target.checked })}
              />
              <Label htmlFor="promo-active">{t('Active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoDialog(false)}>
              {t('Cancel')}
            </Button>
            <Button onClick={savePromoCode} className="bg-purple-600 hover:bg-purple-700 text-white">{t('Save Promo Code')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

