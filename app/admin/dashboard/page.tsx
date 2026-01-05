'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Package, ShoppingCart, Tag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

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
  const { t, language } = useAdminLanguage();
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
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading dashboard...')} />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-slate-500 py-12">
        {t('Failed to load analytics. Please check the server logs.')}
      </div>
    );
  }

  const stats = [
    {
      title: t('Total Revenue'),
      value: `₪${(analytics.totalRevenue || 0).toFixed(0)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: t('Total Orders'),
      value: analytics.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: t('Products'),
      value: analytics.totalProducts || 0,
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: t('Active Promos'),
      value: analytics.activePromoCodes || 0,
      icon: Tag,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('Dashboard')}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{t('Welcome to your admin panel')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-xl`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.75} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Selling Products */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t('Top Selling Products')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(analytics.topProducts && analytics.topProducts.length > 0) ? (
              <div className="space-y-2">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{t(product.name)}</p>
                      <p className="text-xs text-slate-500">{product.total_sold || 0} {t('sold')}</p>
                    </div>
                    <p className="font-semibold text-emerald-600">₪{(product.revenue || 0).toFixed(0)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-6 text-sm">{t('No sales data yet')}</p>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t('Orders by Status')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(analytics.ordersByStatus && analytics.ordersByStatus.length > 0) ? (
              <div className="space-y-2">
                {analytics.ordersByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${
                        status.status === 'completed' ? 'bg-emerald-500' :
                        status.status === 'pending' ? 'bg-amber-500' :
                        status.status === 'cancelled' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <p className="font-medium text-slate-900 text-sm capitalize">{t(status.status)}</p>
                    </div>
                    <p className="font-semibold text-slate-900">{status.count || 0}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-6 text-sm">{t('No orders yet')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{t('Recent Orders')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {(analytics.recentOrders && analytics.recentOrders.length > 0) ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-xs font-medium text-slate-500">{t('Order ID')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Customer')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Items')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Total')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Status')}</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500">{t('Date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-100">
                      <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                      <TableCell className="text-sm">{t(order.customer_name)}</TableCell>
                      <TableCell className="text-sm text-slate-500">{order.items_count || 0}</TableCell>
                      <TableCell className="font-medium text-sm">₪{(order.total_amount || 0).toFixed(0)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {t(order.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8 text-sm">{t('No orders yet')}</p>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      {(analytics.revenueByMonth && analytics.revenueByMonth.length > 0) && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t('Revenue Trend')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {analytics.revenueByMonth.map((month, index) => {
                const maxRevenue = Math.max(1, ...analytics.revenueByMonth.map(m => m.revenue || 0));
                const percentage = ((month.revenue || 0) / maxRevenue) * 100;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-slate-600">{t(month.month)}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full flex items-center justify-end px-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 15)}%` }}
                      >
                        <span className="text-white text-xs font-medium">₪{(month.revenue || 0).toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="w-16 text-xs text-slate-500 text-left">{month.orders || 0} {t('orders')}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
