'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLanguageProvider, useAdminLanguage } from '@/lib/admin-language-context';
import { Lock, Loader2 } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const { t, language } = useAdminLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Безопасное определение направления текста (RTL/LTR)
  const direction = language === 'he' ? 'rtl' : 'ltr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || t('Login failed'));
      }
    } catch (err) {
      setError(t('An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-50 p-4 transition-colors duration-300" 
      dir={direction}
      style={{ fontFamily: "'Heebo', 'Segoe UI', system-ui, sans-serif" }}
    >
      <Card className="w-full max-w-sm border-slate-200 shadow-xl bg-white">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-indigo-600" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {t('Admin Panel')}
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              {t('Enter your credentials to access the admin dashboard')}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center animate-in fade-in zoom-in duration-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">{t('Username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('Enter your username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('Password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('Enter your password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus-visible:ring-indigo-500"
              />
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('Signing in...')}
                </>
              ) : (
                t('Sign in')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <AdminLanguageProvider>
      <AdminLoginContent />
    </AdminLanguageProvider>
  );
}