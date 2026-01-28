import { redirect } from 'next/navigation';

export default function MenuPage() {
  // Redirect to home page where categories are displayed
  redirect('/');
}