
'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  availability: boolean;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:3000/admin/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center p-8">טוען תפריט...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">שגיאה בטעינת תפריט: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>תפריט המיצים שלנו | מגוון רחב של מיצים טבעיים</title>
        <meta name="description" content="חקור את תפריט המיצים העשיר שלנו, הכולל מגוון שילובים ייחודיים ובריאים של פירות וירקות טריים. מצא את המיץ המושלם עבורך!" />
      </Head>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">התפריט שלנו</h1>
      <section id="menu-items" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.length === 0 ? (
          <p className="col-span-full text-center">אין פריטים זמינים בתפריט כרגע.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden text-right">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">${product.name}</h3>
                <p className="text-gray-700 mb-2">${product.description}</p>
                <p className="text-blue-600 font-semibold">מחיר: ${product.price} &#x20AA;</p>
                <p className="text-gray-500">זמינות: ${product.availability ? 'כן' : 'לא'}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

