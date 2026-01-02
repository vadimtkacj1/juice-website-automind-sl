import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { AdminLanguageProvider } from '@/lib/admin-language-context';
import './admin.css';

const DynamicAdminAuthWrapper = dynamic(() => import('@/components/AdminAuthWrapper'), { ssr: false });
const DynamicLanguageProvider = dynamic(() => Promise.resolve(AdminLanguageProvider), { ssr: false });
const DynamicAdminLayoutContent = dynamic(() => import('@/components/AdminLayoutContent'), { ssr: false });

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
      <DynamicLanguageProvider>
        <DynamicAdminLayoutContent>{children}</DynamicAdminLayoutContent>
      </DynamicLanguageProvider>
    </DynamicAdminAuthWrapper>
  );
}

