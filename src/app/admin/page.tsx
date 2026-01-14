'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAdminLanguage } from '@/lib/admin-language-context';

export default function AdminPage() {
  const router = useRouter();
  const { t, language } = useAdminLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/admin/login');
        }
      } catch (error) {
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-50" 
      dir={language}
      style={{ fontFamily: "'Heebo', 'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" strokeWidth={1.5} />
        <p className="text-sm text-slate-500">{t('Checking authentication...')}</p>
      </div>
    </div>
  );
}
