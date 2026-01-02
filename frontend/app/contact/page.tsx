
'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Contact {
  id: number;
  type: string;
  value: string;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch('http://localhost:3000/admin/api/contacts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContacts(data.contacts);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchContacts();
  }, []);

  if (loading) {
    return <div className="text-center p-8">טוען פרטי יצירת קשר...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">שגיאה בטעינת פרטי יצירת קשר: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>צור קשר | Juice Website - אנחנו כאן בשבילכם</title>
        <meta name="description" content="צרו קשר עם Juice Website בכל שאלה, בקשה או משוב. מלאו את הטופס או השתמשו בפרטי הקשר שלנו ונשמח לעמוד לשירותכם." />
      </Head>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">צור קשר</h1>
      <p className="text-lg mb-8 text-center">אנחנו כאן כדי לעזור! אנא צרו איתנו קשר באמצעות הפרטים הבאים:</p>
      <section id="contact-info" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contacts.length === 0 ? (
          <p className="col-span-full text-center">אין פרטי יצירת קשר זמינים כרגע.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow-md overflow-hidden text-right">
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">${contact.type}</h3>
                <p className="text-gray-700">${contact.value}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

