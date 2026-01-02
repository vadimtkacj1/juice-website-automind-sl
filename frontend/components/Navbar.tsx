'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-end">
      <ul className="flex space-x-4 space-x-reverse">
        <li>
          <Link href="/">
            <p className="hover:text-gray-300">בית</p>
          </Link>
        </li>
        <li>
          <Link href="/menu">
            <p className="hover:text-gray-300">תפריט</p>
          </Link>
        </li>
        <li>
          <Link href="/shop">
            <p className="hover:text-gray-300">חנות</p>
          </Link>
        </li>
        <li>
          <Link href="/locations">
            <p className="hover:text-gray-300">מיקומים</p>
          </Link>
        </li>
        <li>
          <Link href="/contact">
            <p className="hover:text-gray-300">צור קשר</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

