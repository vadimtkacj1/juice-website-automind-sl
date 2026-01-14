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
  ChefHat,
  MessageSquare,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAdminLanguage } from '@/lib/admin-language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useAdminLanguage();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const isRTL = language === 'he';

  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
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
    const interval = setInterval(fetchNewOrdersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return null;
  }

  const navigation = [
    { name: t('Dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('Menu'), href: '/admin/menu', icon: Package },
    { name: t('Ingredients'), href: '/admin/ingredients', icon: ChefHat },
    { name: t('Orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('Telegram Delivery'), href: '/admin/telegram-delivery', icon: MessageSquare },
    { name: t('Discounts & Promos'), href: '/admin/discounts', icon: Tag },
    { name: t('Locations'), href: '/admin/locations', icon: MapPin },
    { name: t('Contacts'), href: '/admin/contacts', icon: Users },
    { name: t('Business Hours'), href: '/admin/business-hours', icon: Clock },
  ];

  const NavLink = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const Icon = item.icon;
    const isActive = pathname.startsWith(item.href);
    const isOrders = item.href === '/admin/orders';
    const showBadge = isOrders && newOrdersCount > 0;
    
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-150',
          isActive 
            ? 'bg-indigo-50 text-indigo-600' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        <div className="relative flex-shrink-0">
          <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-indigo-600' : 'text-slate-400')} strokeWidth={1.75} />
          {showBadge && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-medium px-1">
              {newOrdersCount > 9 ? '9+' : newOrdersCount}
            </span>
          )}
        </div>
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div 
        className="desktop:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4"
        dir={language}
      >
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600">
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side={isRTL ? 'right' : 'left'} 
              className="w-[260px] p-0 border-slate-200" 
              dir={language}
            >
              <div className="flex flex-col h-full">
                <SheetHeader className="p-4 border-b border-slate-100">
                  <SheetTitle className="text-lg font-semibold text-slate-900">
                    {t('Admin Panel')}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-3">
                  <div className="flex flex-col gap-0.5">
                    {navigation.map((item) => (
                      <NavLink key={item.href} item={item} onClick={() => setIsOpen(false)} />
                    ))}
                  </div>
                </nav>
                <div className="p-3 border-t border-slate-100 space-y-2">
                  <LanguageSwitcher />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 h-10"
                  >
                    <LogOut className={cn('h-[18px] w-[18px]', isRTL ? 'ml-3' : 'mr-3')} strokeWidth={1.75} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                    {t('Logout')}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-base font-semibold text-slate-900">{t('Admin Panel')}</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'hidden desktop:flex desktop:fixed desktop:inset-y-0 desktop:w-60 desktop:flex-col bg-white z-50',
          isRTL ? 'desktop:right-0 border-l border-slate-200' : 'desktop:left-0 border-r border-slate-200'
        )} 
        dir={language}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
          <span className="text-base font-semibold text-slate-900">{t('Admin Panel')}</span>
          <LanguageSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-0.5">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 h-10"
          >
            <LogOut className={cn('h-[18px] w-[18px]', isRTL ? 'ml-3' : 'mr-3')} strokeWidth={1.75} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            {t('Logout')}
          </Button>
        </div>
      </aside>
    </>
  );
}
