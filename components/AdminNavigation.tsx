'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';
import { translateToHebrew } from '@/lib/translations';

const navigation = [
  { name: translateToHebrew('Dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
  { name: translateToHebrew('Menu'), href: '/admin/menu', icon: Package },
  { name: translateToHebrew('Ingredients'), href: '/admin/ingredients', icon: ChefHat },
  { name: translateToHebrew('Orders'), href: '/admin/orders', icon: ShoppingCart },
  { name: translateToHebrew('Telegram Delivery'), href: '/admin/telegram-delivery', icon: MessageSquare },
  { name: translateToHebrew('News'), href: '/admin/news', icon: Newspaper },
  { name: translateToHebrew('Discounts & Promos'), href: '/admin/discounts', icon: Tag },
  { name: translateToHebrew('Locations'), href: '/admin/locations', icon: MapPin },
  { name: translateToHebrew('Contacts'), href: '/admin/contacts', icon: Users },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Don't show navigation on login page
  if (pathname === '/admin/login') {
    return null;
  }

  return (
    <>
      {/* Mobile Header with Burger */}
      <div className="desktop:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4" dir="rtl">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0" dir="rtl">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-2xl font-bold text-purple-600">
                  {translateToHebrew('Admin Panel')}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                          isActive
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  {translateToHebrew('Logout')}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="ml-3 text-xl font-bold text-purple-600">{translateToHebrew('Admin Panel')}</h1>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden desktop:flex desktop:fixed desktop:inset-y-0 desktop:right-0 desktop:w-64 desktop:flex-col bg-white border-l border-gray-200 z-50">
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-purple-600">{translateToHebrew('Admin Panel')}</h1>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
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
            <LogOut className="mr-3 h-5 w-5" />
            {translateToHebrew('Logout')}
          </Button>
        </div>
      </aside>
    </>
  );
}

