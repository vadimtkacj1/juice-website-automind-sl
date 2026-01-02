'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, ShoppingBag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface OrderPrompt {
  id: number;
  title: string;
  description?: string;
  prompt_type: string;
  is_active: boolean;
  sort_order: number;
  show_on_all_products: boolean;
  products?: OrderPromptProduct[];
}

interface OrderPromptProduct {
  id: number;
  prompt_id: number;
  menu_item_id?: number;
  product_name?: string;
  product_price: number;
  volume_option?: string;
  sort_order: number;
}

export default function AdminOrderPrompts() {
  const { t, language } = useAdminLanguage();
  const [prompts, setPrompts] = useState<OrderPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      setLoading(true);
      const response = await fetch('/api/order-prompts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error: any) {
      console.error('Error fetching order prompts:', error);
      setError(t('Failed to load order prompts.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('Are you sure you want to delete this order prompt?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/order-prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setPrompts(prompts.filter((prompt) => prompt.id !== id));
    } catch (error: any) {
      console.error('Error deleting order prompt:', error);
      alert(t('Failed to delete order prompt.'));
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text={t('Loading order prompts...')} />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8" dir={language}>{t('Error')}: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8" dir={language}>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-2xl font-bold">{t('Order Prompts')}</CardTitle>
            <CardDescription>{t('Manage prompts shown when customers add items to cart.')}</CardDescription>
          </div>
          <Link href="/admin/order-prompts/add">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> {t('Add New Prompt')}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {prompts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('No order prompts configured yet')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Title')}</TableHead>
                  <TableHead>{t('Type')}</TableHead>
                  <TableHead>{t('Products')}</TableHead>
                  <TableHead className="text-center">{t('Active')}</TableHead>
                  <TableHead className="text-center">{t('Sort Order')}</TableHead>
                  <TableHead className="text-right">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">{prompt.title}</TableCell>
                    <TableCell>{t(prompt.prompt_type === 'additional_items' ? 'Additional Items' : 'Volume/Weight')}</TableCell>
                    <TableCell>
                      {prompt.products && prompt.products.length > 0 
                        ? `${prompt.products.length} ${t('items')}`
                        : t('All Products')}
                    </TableCell>
                    <TableCell className="text-center">
                      {prompt.is_active ? '✅' : '❌'}
                    </TableCell>
                    <TableCell className="text-center">{prompt.sort_order}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Link href={`/admin/order-prompts/edit/${prompt.id}`}>
                        <Button variant="outline" size="icon">
                          <Pencil size={18} />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDelete(prompt.id)}
                      >
                        <Trash size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

