'use client';

import AdminNavigation from '@/components/AdminNavigation';
import { useAdminLanguage } from '@/lib/admin-language-context';

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { language } = useAdminLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50" id="admin-layout-root">
      <AdminNavigation />
      {/* Main content with proper spacing for sidebar/header */}
      {/* Hebrew (RTL): sidebar on right → padding-right, English (LTR): sidebar on left → padding-left */}
      <main 
        className={`pt-16 desktop:pt-0 ${language === 'he' ? 'desktop:pr-64' : 'desktop:pl-64'}`} 
        id="admin-main-content"
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

