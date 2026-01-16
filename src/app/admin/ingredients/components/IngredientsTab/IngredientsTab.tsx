'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, Coffee, Pencil, Trash, Plus, Tag } from 'lucide-react';
import Link from 'next/link';

// 1. Define the shape of an Ingredient object
interface Ingredient {
  id: number;
  name: string;
  price: number;
  // Add other properties used in your component here
}

// 2. Define the interface for the component props
interface IngredientsTabProps {
  ingredients: Ingredient[];
  search: string;
  onSearchChange: (value: string) => void;
  onDelete: (id: number) => void;
  onManageAttachments: (id: number) => void;
  onAddLink: (id: number) => void;
  onAddToCategory: (id: number) => void;
  t: (key: string) => string;
}

export default function IngredientsTab({ 
  ingredients, 
  search, 
  onSearchChange, 
  onDelete,
  onManageAttachments, 
  onAddLink,
  onAddToCategory, 
  t 
}: IngredientsTabProps) {
  
  // 3. Explicitly type the filter parameter 'i' as Ingredient
  const filtered = ingredients.filter((i: Ingredient) => 
    i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toString().includes(search)
  );

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('All Ingredients')}</h2>
          <p className="text-slate-600 mt-1">נהל וערוך את כל המרכיבים במערכת</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            סה״כ: {filtered.length} מרכיבים
          </span>
          <Link href="/admin/ingredients/add">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm px-6">
              <Plus className="h-4 w-4 ml-2" />
              הוסף מרכיב
            </Button>
          </Link>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            רשימת מרכיבים ({filtered.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/50">
                <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">שם המרכיב</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">מחיר</TableHead>
                <TableHead className="text-center font-semibold text-slate-700 py-4 px-6">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Coffee className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-medium text-slate-900 mb-2">
                        {search ? 'לא נמצאו תוצאות' : 'אין מרכיבים עדיין'}
                      </h4>
                      <p className="text-slate-500 mb-6">
                        {search 
                          ? 'נסה מילות חיפוש אחרות או בדוק את הכתיב'
                          : 'התחל על ידי הוספת המרכיב הראשון שלך'
                        }
                      </p>
                      {search ? (
                        <Button 
                          onClick={() => onSearchChange('')}
                          variant="outline"
                          className="font-medium"
                        >
                          נקה חיפוש
                        </Button>
                      ) : (
                        <Link href="/admin/ingredients/add">
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                            <Plus className="h-4 w-4 ml-2" />
                            הוסף מרכיב ראשון
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ing: Ingredient) => (
                  <TableRow key={ing.id} className="hover:bg-purple-50/30 border-b border-slate-100 transition-colors">
                    <TableCell className="font-medium text-slate-900 py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {ing.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{ing.name}</div>
                          <div className="text-sm text-slate-500">מזהה: #{ing.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600 py-4 px-6 text-lg">
                      ₪{Number(ing.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onAddToCategory(ing.id)}
                          className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors"
                          title="הוסף לקטגוריה"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onManageAttachments(ing.id)}
                          className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
                          title="ניהול קישורים לקבוצות"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onAddLink(ing.id)}
                          className="h-9 w-9 p-0 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
                          title="קישור לפריט בתפריט"
                        >
                          <Coffee className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/ingredients/edit/${ing.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition-colors"
                            title="ערוך מרכיב"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(ing.id)}
                          className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                          title="מחק מרכיב"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}