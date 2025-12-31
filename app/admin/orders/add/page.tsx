'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import Link from 'next/link';

export default function AddOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    notes: ''
  });
  const [orderItems, setOrderItems] = useState<any[]>([
    { product_id: '', product_name: '', quantity: 1, price: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/menu-items?include_inactive=true');
      const data = await response.json();
      // Map menu items to products format for compatibility
      const items = data.items || [];
      setProducts(items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image
      })));
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItems = orderItems.filter(item => item.product_id && item.quantity > 0);
      
      if (validItems.length === 0) {
        alert('Please add at least one product');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: validItems
        })
      });

      if (response.ok) {
        router.push('/admin/orders');
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', product_name: '', quantity: 1, price: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index] = {
          ...newItems[index],
          product_id: product.id,
          menu_item_id: product.id,
          product_name: product.name,
          item_name: product.name,
          price: product.price
        };
      }
    } else {
      newItems[index][field] = value;
    }
    
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-500 mt-1">Add a new customer order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Enter customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Phone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <textarea
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter full delivery address"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add products to this order</CardDescription>
              </div>
              <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label>Product</Label>
                  <select
                    value={item.product_id}
                    onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a product</option>
                    {Array.isArray(products) && products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="w-32">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="w-32">
                  <Label>Subtotal</Label>
                  <p className="px-3 py-2 bg-white border border-gray-200 rounded-md font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOrderItem(index)}
                  disabled={orderItems.length === 1}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-end items-center gap-4 pt-4 border-t">
              <p className="text-lg font-medium">Total:</p>
              <p className="text-2xl font-bold text-green-600">${calculateTotal().toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/orders">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}

