'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, Mail, Phone, MessageSquare, Users } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAdminLanguage } from '@/lib/admin-language-context';

interface Contact {
  id: number;
  type: string;
  value: string;
}

export default function AdminContacts() {
  const { t, language } = useAdminLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm(t('Are you sure you want to delete this contact?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading contacts...')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir={language}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('Contacts Management')}</h1>
        <p className="text-gray-500 mt-1">{t('Manage contact information and methods')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>{t('All Contacts')}</CardTitle>
                <CardDescription>{t('Contact methods and information')}</CardDescription>
              </div>
            </div>
            <Link href="/admin/contacts/add">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Contact')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('No contacts yet')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Type')}</TableHead>
                    <TableHead>{t('Value')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContactIcon(contact.type)}
                          <span className="font-medium capitalize">{t(contact.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{contact.value}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/contacts/edit/${contact.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(contact.id)}
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

