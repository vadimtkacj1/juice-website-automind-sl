'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, Newspaper, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminNews() {
  const { t, language } = useAdminLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm(t('Are you sure you want to delete this news item?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news item:', error);
    }
  }

  async function toggleActive(newsItem: NewsItem) {
    try {
      await fetch(`/api/news/${newsItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newsItem,
          is_active: !newsItem.is_active,
        }),
      });
      fetchNews();
    } catch (error) {
      console.error('Error updating news item:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading news...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('News Management')}</h1>
        <p className="text-gray-500 mt-1">{t('Manage news articles and announcements')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>{t('All News')}</CardTitle>
                <CardDescription>{t('News items displayed on the website')}</CardDescription>
              </div>
            </div>
            <Link href="/admin/news/add">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                {t('Add News')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('No news items yet')}</p>
              <Link href="/admin/news/add">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  {t('Add Your First News Item')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t('Image')}</TableHead>
                    <TableHead>{t('Title')}</TableHead>
                    <TableHead>{t('Content')}</TableHead>
                    <TableHead className="w-20">{t('Status')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((item) => (
                    <TableRow key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{t(item.title)}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate">{t(item.content)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.is_active ? (
                            <>
                              <Eye className="h-3 w-3" />
                              {t('Active')}
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              {t('Hidden')}
                            </>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/news/edit/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
