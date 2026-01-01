import dynamic from 'next/dynamic';
import AdminNavigation from '@/components/AdminNavigation';
import type { Metadata } from 'next';

const DynamicAdminAuthWrapper = dynamic(() => import('@/components/AdminAuthWrapper'), { ssr: false });

export const metadata: Metadata = {
  title: 'Admin Panel | Juice Website',
  description: 'Admin panel for managing products, orders, and more',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicAdminAuthWrapper>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <AdminNavigation />
        {/* Main content with proper spacing for sidebar/header */}
        <main className="pt-16 desktop:pt-0 desktop:pr-64" dir="rtl">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </DynamicAdminAuthWrapper>
  );
}

