'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLanguageProvider, useAdminLanguage } from '@/lib/admin-language-context';
import { Lock } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const { t, language } = useAdminLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      className="min-h-screen flex items-center justify-center bg-slate-50 p-4" 
      dir={language}
      style={{ fontFamily: "'Heebo', 'Segoe UI', system-ui, sans-serif" }}
    >
      <Card className="w-full max-w-sm border-slate-200 shadow-sm">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-indigo-600" strokeWidth={1.75} />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900">{t('Admin Panel')}</CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-1">
              {t('Enter your credentials to access the admin dashboard')}
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2.5 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-slate-700 text-sm">{t('Username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('Enter your username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="h-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 text-sm">{t('Password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('Enter your password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium" 
              disabled={loading}
            >
              {loading ? t('Signing in...') : t('Sign in')}
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
