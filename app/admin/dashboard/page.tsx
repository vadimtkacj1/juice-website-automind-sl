'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Package, ShoppingCart, Tag, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  activePromoCodes: number;
  recentOrders: any[];
  ordersByStatus: any[];
  revenueByMonth: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics({
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        totalProducts: data.totalProducts || 0,
        activePromoCodes: data.activePromoCodes || 0,
        recentOrders: data.recentOrders || [],
        ordersByStatus: data.ordersByStatus || [],
        revenueByMonth: data.revenueByMonth || [],
        topProducts: data.topProducts || [],
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(null); // Set to null on error to show fallback UI
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics. Please check the server logs.</div>;
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${(analytics.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: 'Total sales revenue',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders || 0,
      icon: ShoppingCart,
      description: 'All time orders',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Products',
      value: analytics.totalProducts || 0,
      icon: Package,
      description: 'Available products',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Active Promos',
      value: analytics.activePromoCodes || 0,
      icon: Tag,
      description: 'Active promo codes',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.topProducts && analytics.topProducts.length > 0) ? (
              <div className="space-y-3">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.total_sold || 0} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${(product.revenue || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No sales data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {(analytics.ordersByStatus && analytics.ordersByStatus.length > 0) ? (
              <div className="space-y-3">
                {analytics.ordersByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status.status === 'completed' ? 'bg-green-500' :
                        status.status === 'pending' ? 'bg-yellow-500' :
                        status.status === 'cancelled' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <p className="font-medium capitalize">{status.status}</p>
                    </div>
                    <p className="font-bold">{status.count || 0}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
            {(analytics.recentOrders && analytics.recentOrders.length > 0) ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.items_count || 0}</TableCell>
                    <TableCell>${(order.total_amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      {(analytics.revenueByMonth && analytics.revenueByMonth.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.revenueByMonth.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{month.month}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full flex items-center justify-end pr-2"
                      style={{
                        width: `${((month.revenue || 0) / Math.max(1, ...analytics.revenueByMonth.map(m => m.revenue || 0))) * 100}%`,
                        minWidth: '60px'
                      }}
                    >
                      <span className="text-white text-sm font-bold">${(month.revenue || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-500">{month.orders || 0} orders</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}