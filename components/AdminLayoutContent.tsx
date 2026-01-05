'use client';

import AdminNavigation from '@/components/AdminNavigation';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { cn } from '@/lib/utils';

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { language } = useAdminLanguage();
  const isRTL = language === 'he';
  
  return (
    <div className="min-h-screen bg-slate-50" id="admin-layout-root" dir={language}>
      <AdminNavigation />
      <main 
        className={cn(
          'pt-14 desktop:pt-0 min-h-screen',
          isRTL ? 'desktop:pr-60' : 'desktop:pl-60'
        )}
        id="admin-main-content"
      >
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
