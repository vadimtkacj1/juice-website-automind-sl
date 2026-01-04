'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLanguageProvider, useAdminLanguage } from '@/lib/admin-language-context';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={language}>
      <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">{t('Admin Panel')}</CardTitle>
            <CardDescription className="text-center">
              {t('Enter your credentials to access the admin dashboard')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-center block">{t('Username')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('Enter your username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-center block">{t('Password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('Enter your password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold" 
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

