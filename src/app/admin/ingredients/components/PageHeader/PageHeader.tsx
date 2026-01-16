import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageHeaderProps {
  t: (key: string) => string; // Define the type for your translation function
}

export default function PageHeader({ t }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 pb-6 border-slate-100">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">מרכיבים וקבוצות</h1>
        <p className="text-slate-500 font-bold uppercase text-xs mt-1">ניהול המלאי וסידור התפריט</p>
      </div>
      <Link href="/admin/ingredients/add">
        <Button className="bg-slate-900 text-white rounded-none font-black h-12 px-8 uppercase">
          הוסף מרכיב
          <Plus className="h-5 w-5 mr-2" /> {/* Left-side icon for RTL */}
        </Button>
      </Link>
    </div>
  );
}