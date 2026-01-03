'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  MapPin,
  Users,
  LogOut,
  Menu,
  X,
  Newspaper,
  ChefHat,
  MessageSquare,
  Clock,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';
import { useAdminLanguage } from '@/lib/admin-language-context';
import LanguageSwitcher from './LanguageSwitcher';


export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useAdminLanguage();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    // Fetch new orders count (pending/processing orders)
    const fetchNewOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            // Count orders with pending or processing status
            const newOrders = data.filter((order: any) => 
              order.status === 'pending' || order.status === 'processing'
            );
            setNewOrdersCount(newOrders.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch new orders count:', error);
      }
    };

    fetchNewOrdersCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNewOrdersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Don't show navigation on login page
  if (pathname === '/admin/login') {
    return null;
  }

  const navigation = [
    { name: t('Dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('Menu'), href: '/admin/menu', icon: Package },
    { name: t('Ingredients'), href: '/admin/ingredients', icon: ChefHat },
    { name: t('Addons'), href: '/admin/addons', icon: Sparkles },
    { name: t('Orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('Telegram Delivery'), href: '/admin/telegram-delivery', icon: MessageSquare },
    { name: t('News'), href: '/admin/news', icon: Newspaper },
    { name: t('Discounts & Promos'), href: '/admin/discounts', icon: Tag },
    { name: t('Locations'), href: '/admin/locations', icon: MapPin },
    { name: t('Contacts'), href: '/admin/contacts', icon: Users },
    { name: t('Business Hours'), href: '/admin/business-hours', icon: Clock },
    { name: t('Order Prompts'), href: '/admin/order-prompts', icon: ShoppingBag },
  ];

  return (
    <>
      {/* Mobile Header with Burger */}
      <div className={`desktop:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4`} dir={language}>
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'he' ? 'right' : 'left'} className="w-[280px] p-0" dir={language}>
              <div className="flex flex-col h-full">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="text-2xl font-bold text-purple-600">
                    {t('Admin Panel')}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              const isOrders = item.href === '/admin/orders';
              const showBadge = isOrders && newOrdersCount > 0;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors relative',
                    'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {isOrders ? (
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff00ff] flex items-center justify-center text-white text-xs font-bold">
                          {newOrdersCount > 9 ? '9+' : newOrdersCount}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  {item.name}
                </Link>
              );
            })}
                  </div>
                </nav>
                <div className="p-4 border-t space-y-2">
                  <LanguageSwitcher />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className={language === 'he' ? 'ml-3' : 'mr-3'} style={{ transform: language === 'he' ? 'scaleX(-1)' : 'none' }} />
                    {t('Logout')}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className={`text-xl font-bold text-purple-600 ${language === 'he' ? 'ml-3' : 'mr-3'}`}>{t('Admin Panel')}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden desktop:flex desktop:fixed desktop:inset-y-0 ${language === 'he' ? 'desktop:right-0' : 'desktop:left-0'} desktop:w-64 desktop:flex-col bg-white ${language === 'he' ? 'border-l' : 'border-r'} border-gray-200 z-50`} dir={language}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-purple-600">{t('Admin Panel')}</h1>
          <LanguageSwitcher />
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              const isOrders = item.href === '/admin/orders';
              const showBadge = isOrders && newOrdersCount > 0;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors relative',
                    'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {isOrders ? (
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff00ff] flex items-center justify-center text-white text-xs font-bold">
                          {newOrdersCount > 9 ? '9+' : newOrdersCount}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className={language === 'he' ? 'ml-3' : 'mr-3'} style={{ transform: language === 'he' ? 'scaleX(-1)' : 'none' }} />
            {t('Logout')}
          </Button>
        </div>
      </aside>
    </>
  );
}

