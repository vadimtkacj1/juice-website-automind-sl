'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const { t, language } = useAdminLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setSelectedOrder(data);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const deleteOrder = async (orderId: number) => {
    setConfirmDialog({
      open: true,
      title: t('Delete Order'),
      description: t('Are you sure you want to delete this order? This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            fetchOrders();
            setShowDetailsDialog(false);
          }
        } catch (error) {
          console.error('Failed to delete order:', error);
        }
      },
    });
  };

  const deleteAllOrders = async () => {
    setConfirmDialog({
      open: true,
      title: t('Delete All Orders'),
      description: t('Are you sure you want to delete ALL orders? This action cannot be undone and will remove all order history.'),
      onConfirm: async () => {
        try {
          const response = await fetch('/api/orders', {
            method: 'DELETE'
          });

          if (response.ok) {
            fetchOrders();
          }
        } catch (error) {
          console.error('Failed to delete all orders:', error);
        }
      },
    });
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const filterButtons = [
    { key: 'all', label: t('All') },
    { key: 'pending', label: t('Pending') },
    { key: 'completed', label: t('Completed') },
    { key: 'cancelled', label: t('Cancelled') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading orders...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('Orders Management')}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{t('View and manage customer orders')}</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-medium">{t('All Orders')}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setStatusFilter(btn.key)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                      statusFilter === btn.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {orders.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteAllOrders}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" strokeWidth={1.75} />
                  {t('Delete All')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-xs font-medium text-slate-500">{t('Order ID')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Customer')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Products')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Total')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Status')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Date')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-100">
                      <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{t(order.customer_name)}</p>
                          {order.customer_email && (
                            <p className="text-xs text-slate-500">{order.customer_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {order.items_count} {t('items')}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">₪{order.total_amount}</TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={cn(
                            'px-2 py-1 rounded-md text-xs font-medium border-0 cursor-pointer',
                            order.status === 'completed' && 'bg-emerald-50 text-emerald-700',
                            order.status === 'pending' && 'bg-amber-50 text-amber-700',
                            order.status === 'cancelled' && 'bg-red-50 text-red-700',
                            order.status === 'processing' && 'bg-blue-50 text-blue-700'
                          )}
                        >
                          <option value="pending">{t('Pending')}</option>
                          <option value="processing">{t('Processing')}</option>
                          <option value="completed">{t('Completed')}</option>
                          <option value="cancelled">{t('Cancelled')}</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order.id)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOrder(order.id)}
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
          ) : (
            <p className="text-center text-slate-400 py-12 text-sm">
              {statusFilter === 'all' ? t('No orders yet') : t(`No ${statusFilter} orders`)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg border-slate-200" dir={language}>
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold">{t('Order Details')} #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">{t('Customer Name')}</Label>
                  <p className="font-medium text-sm mt-0.5">{t(selectedOrder.customer_name)}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">{t('Email')}</Label>
                  <p className="font-medium text-sm mt-0.5">{selectedOrder.customer_email || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">{t('Phone')}</Label>
                  <p className="font-medium text-sm mt-0.5">{selectedOrder.customer_phone || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">{t('Status')}</Label>
                  <p className="font-medium text-sm mt-0.5 capitalize">{t(selectedOrder.status)}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">{t('Total Amount')}</Label>
                <p className="font-semibold text-lg text-indigo-600 mt-0.5">₪{selectedOrder.total_amount}</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-xs text-slate-500">{t('Notes')}</Label>
                  <p className="text-sm mt-0.5 bg-slate-50 p-2 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-500 mb-2 block">{t('Order Items')}</Label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-xs">{t('Product')}</TableHead>
                        <TableHead className="text-xs">{t('Qty')}</TableHead>
                        <TableHead className="text-xs">{t('Price')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: any) => (
                        <TableRow key={item.id} className="border-slate-100">
                          <TableCell className="text-sm">{t(item.item_name || item.product_name)}</TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm font-medium">₪{(item.quantity * item.price).toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="border-slate-200">
              {t('Close')}
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
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
      />
    </div>
  );
}
