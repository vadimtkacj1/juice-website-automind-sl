'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Trash } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { translateToHebrew } from '@/lib/translations';

export default function OrdersPage() {
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
      title: translateToHebrew('Delete Order'),
      description: translateToHebrew('Are you sure you want to delete this order? This action cannot be undone.'),
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={translateToHebrew('Loading orders...')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{translateToHebrew('Orders Management')}</h1>
        <p className="text-gray-500 mt-1">{translateToHebrew('View and manage customer orders')}</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{translateToHebrew('All Orders')}</CardTitle>
            <CardDescription>{translateToHebrew('A list of all customer orders')}</CardDescription>
          </div>
          <div className="flex justify-end mt-4">
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
              >
                {translateToHebrew('All')}
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
              >
                {translateToHebrew('Pending')}
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
                className={statusFilter === 'completed' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
              >
                {translateToHebrew('Completed')}
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('cancelled')}
                className={statusFilter === 'cancelled' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
              >
                {translateToHebrew('Cancelled')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translateToHebrew('Order ID')}</TableHead>
                  <TableHead>{translateToHebrew('Customer')}</TableHead>
                  <TableHead>{translateToHebrew('Products')}</TableHead>
                  <TableHead>{translateToHebrew('Total')}</TableHead>
                  <TableHead>{translateToHebrew('Status')}</TableHead>
                  <TableHead>{translateToHebrew('Date')}</TableHead>
                  <TableHead>{translateToHebrew('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{translateToHebrew(order.customer_name)}</p>
                        {order.customer_email && (
                          <p className="text-sm text-gray-500">{order.customer_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{order.items_count} {translateToHebrew('items')}</p>
                    </TableCell>
                    <TableCell className="font-bold">${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-none ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <option value="pending">{translateToHebrew('Pending')}</option>
                        <option value="processing">{translateToHebrew('Processing')}</option>
                        <option value="completed">{translateToHebrew('Completed')}</option>
                        <option value="cancelled">{translateToHebrew('Cancelled')}</option>
                      </select>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewOrderDetails(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrder(order.id)}
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
          ) : (
            <p className="text-center text-gray-500 py-8">
              {statusFilter === 'all' ? translateToHebrew('No orders yet') : translateToHebrew(`No ${statusFilter} orders`)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{translateToHebrew('Order Details')} #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {translateToHebrew('Complete information about this order')}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">{translateToHebrew('Customer Name')}</Label>
                  <p className="font-medium">{translateToHebrew(selectedOrder.customer_name)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{translateToHebrew('Email')}</Label>
                  <p className="font-medium">{selectedOrder.customer_email || translateToHebrew('N/A')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{translateToHebrew('Phone')}</Label>
                  <p className="font-medium">{selectedOrder.customer_phone || translateToHebrew('N/A')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{translateToHebrew('Status')}</Label>
                  <p className="font-medium capitalize">{translateToHebrew(selectedOrder.status)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">{translateToHebrew('Total Amount')}</Label>
                  <p className="font-bold text-lg">${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">{translateToHebrew('Notes')}</Label>
                <p className="font-medium">{selectedOrder.notes || translateToHebrew('No notes')}</p>
              </div>

              <div>
                <Label className="text-gray-500 mb-2 block">{translateToHebrew('Order Items')}</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{translateToHebrew('Product')}</TableHead>
                        <TableHead>{translateToHebrew('Quantity')}</TableHead>
                        <TableHead>{translateToHebrew('Price')}</TableHead>
                        <TableHead>{translateToHebrew('Subtotal')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{translateToHebrew(item.item_name || item.product_name)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              {translateToHebrew('Close')}
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
    </div>
  );
}

