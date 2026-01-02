'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Newspaper } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useParams } from 'next/navigation';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export default function EditNewsItem() {
  const { t, language } = useAdminLanguage();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewsItem>({
    id: 0,
    title: '',
    content: '',
    image: '',
    is_active: true,
    created_at: '',
  });

  useEffect(() => {
    if (id) {
      fetchNewsItemData(Number(id));
    }
  }, [id]);

  async function fetchNewsItemData(newsItemId: number) {
    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsItemId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data.newsItem);
      } else {
        console.error('Failed to fetch news item data');
        router.push('/admin/news');
      }
    } catch (error) {
      console.error('Error fetching news item data:', error);
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/news');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update news item');
      }
    } catch (error) {
      console.error('Error updating news item:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading && formData.id === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading news item data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Edit News Item')}</h1>
          <p className="text-gray-500 mt-1">{t('Modify an existing news article')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" dir={language}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* News Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>{t('News Details')}</CardTitle>
                  <CardDescription>{t('Basic information about the news item')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t('Title *')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('e.g., Exciting New Flavors!')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">{t('Content *')}</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('Write the news content here...')}
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Media & Visibility')}</CardTitle>
              <CardDescription>{t('News image and display status')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={formData.image || ''}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="news"
                label={t('News Image')}
              />

              <div className="flex items-center gap-3 pt-4 border-t">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  {t('Show this news item on the website')}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/news">
            <Button type="button" variant="outline">{t('Cancel')}</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? t('Updating...') : t('Update News Item')}
          </Button>
        </div>
      </form>
    </div>
  );
}
