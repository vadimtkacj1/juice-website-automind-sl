'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog } from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Check, Layers, Coffee, AlertCircle, Tag 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientGroup {
  id: number;
  name_he: string;
  ingredients_count?: number;
}

interface MenuCategory {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  category_name?: string;
}

interface GroupIngredientPreview {
  id: number;
  name: string;
}

export default function AttachGroups() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<IngredientGroup[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [groupIngredients, setGroupIngredients] = useState<GroupIngredientPreview[]>([]);
  const [groupIngredientsLoading, setGroupIngredientsLoading] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isRequired, setIsRequired] = useState(false);

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean; title: string; message: string; type?: 'info' | 'success' | 'error' | 'warning';
  }>({
    open: false, title: '', message: '', type: 'info'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setGroupIngredients([]);
      return;
    }
    loadGroupIngredients(selectedGroup);
  }, [selectedGroup]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [g, cat, itm] = await Promise.all([
        fetch('/api/ingredient-groups').then(r => r.json()),
        fetch('/api/menu-categories?include_inactive=true').then(r => r.json()),
        fetch('/api/menu-items?include_inactive=true').then(r => r.json()),
      ]);
      setGroups(g.groups || []);
      setCategories(cat.categories || []);
      setItems(itm.items || []);
    } catch {
      setAlertDialog({ open: true, title: 'שגיאה', message: 'טעינת הנתונים נכשלה', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function loadGroupIngredients(groupId: number) {
    setGroupIngredientsLoading(true);
    try {
      const data = await fetch(`/api/ingredient-groups/${groupId}/ingredients`).then((r) => r.json());
      setGroupIngredients(data.ingredients || []);
    } catch {
      setGroupIngredients([]);
    } finally {
      setGroupIngredientsLoading(false);
    }
  }

  // --- Functions for Attach ---
  async function attachToCategory() {
    if (!selectedGroup || !selectedCategory) return;
    try {
      const groupName = groups.find(g => g.id === selectedGroup)?.name_he || null;
      const groupIngRes = await fetch(`/api/ingredient-groups/${selectedGroup}/ingredients`).then(r => r.json());
      const ingredientIds = (groupIngRes.ingredients || []).map((x: any) => Number(x.id ?? x.custom_ingredient_id));

      if (ingredientIds.length === 0) {
        setAlertDialog({ open: true, title: 'קבוצה ריקה', message: 'בקבוצה זו אין מרכיבים.', type: 'info' });
        return;
      }

      const current = await fetch(`/api/menu-categories/${selectedCategory}/ingredient-configs`).then(r => r.json());
      const existing = current.configs || [];
      const byId = new Map();
      existing.forEach((c: any) => byId.set(Number(c.ingredient_id ?? c.custom_ingredient_id), c));

      ingredientIds.forEach((id: number) => {
        byId.set(id, {
          ...(byId.get(id) || {}),
          ingredient_id: id,
          selection_type: 'single',
          ingredient_group_id: selectedGroup,
          ingredient_group: groupName,
          is_required: isRequired,
        });
      });

      const res = await fetch(`/api/menu-categories/${selectedCategory}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: Array.from(byId.values()) })
      });
      if (!res.ok) throw new Error();
      setAlertDialog({ open: true, title: 'הצלחה', message: 'הקבוצה שויכה לקטגוריה בהצלחה!', type: 'success' });
    } catch {
      setAlertDialog({ open: true, title: 'שגיאה', message: 'השמירה נכשלה.', type: 'error' });
    }
  }

  async function attachToItem() {
    if (!selectedGroup || !selectedItem) return;
    try {
      const groupName = groups.find(g => g.id === selectedGroup)?.name_he || null;
      const groupIngRes = await fetch(`/api/ingredient-groups/${selectedGroup}/ingredients`).then(r => r.json());
      const ingredientIds = (groupIngRes.ingredients || []).map((x: any) => Number(x.id ?? x.custom_ingredient_id));

      const current = await fetch(`/api/menu-items/${selectedItem}/custom-ingredients`).then(r => r.json());
      const existing = current.ingredients || [];
      const byId = new Map();
      existing.forEach((c: any) => byId.set(Number(c.id ?? c.ingredient_id), c));

      ingredientIds.forEach((id: number) => {
        byId.set(id, {
          ...(byId.get(id) || {}),
          ingredient_id: id,
          selection_type: 'single',
          ingredient_group_id: selectedGroup,
          ingredient_group: groupName,
          is_required: isRequired,
        });
      });

      const res = await fetch(`/api/menu-items/${selectedItem}/custom-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: Array.from(byId.values()) })
      });
      if (!res.ok) throw new Error();
      setAlertDialog({ open: true, title: 'הצלחה', message: 'הקבוצה שויכה לפריט בהצלחה!', type: 'success' });
    } catch {
      setAlertDialog({ open: true, title: 'שגיאה', message: 'השמירה נכשלה.', type: 'error' });
    }
  }

  if (loading) return <div className="p-20 text-center"><LoadingSpinner /></div>;

  return (
    <div className="container mx-auto p-4 space-y-4 max-w-5xl" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">שיוך קבוצות מרכיבים</h1>
          <p className="text-slate-600 text-xs mt-0.5">חיבור קבוצות מרכיבים לקטגוריות או פריטים בתפריט</p>
        </div>
        <Link href="/admin/ingredients">
          <Button variant="outline" className="border-slate-300 hover:border-slate-400 font-medium rounded-lg">
            <ArrowLeft className="h-4 w-4 ml-2" />
            חזור
          </Button>
        </Link>
      </div>

      <div className="space-y-4">

        {/* שלב 1: הגדרות קבוצה */}
        <Card className="border shadow-sm bg-white rounded-lg overflow-visible">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200 rounded-t-lg py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
              בחירת קבוצה והגדרות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">איזו קבוצה ברצונך לשייך?</label>
                  <Select onValueChange={(v) => setSelectedGroup(Number(v))} value={selectedGroup ? String(selectedGroup) : ''}>
                    <SelectTrigger className="bg-white border-slate-300 h-10 text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                      <SelectValue placeholder="בחר קבוצת מרכיבים..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300 shadow-xl rounded-lg z-[100]">
                      {groups.map(g => (
                        <SelectItem key={g.id} value={String(g.id)} className="py-2 font-medium text-slate-900 rounded-md">
                          {g.name_he} ({g.ingredients_count} מרכיבים)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Toggle - Compact */}
                <div
                  onClick={() => setIsRequired(!isRequired)}
                  className={cn(
                    "cursor-pointer flex items-center gap-2.5 p-3 rounded-lg border-2 transition-all duration-200",
                    isRequired ? "border-purple-500 bg-purple-50" : "border-slate-300 bg-white hover:border-slate-400"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                    isRequired ? "bg-purple-600 border-purple-600" : "bg-white border-slate-400"
                  )}>
                    {isRequired && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-900">בחירת חובה</span>
                </div>
              </div>

              {/* תצוגת מרכיבים - Compact */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  מרכיבים בקבוצה
                </label>
                <div className="min-h-[100px] p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5 content-start">
                  {groupIngredients.length > 0 ? (
                    groupIngredients.map((ing) => (
                      <div
                        key={ing.id}
                        className="bg-white border border-slate-300 px-2 py-1 rounded text-slate-800 text-xs font-medium flex items-center gap-1.5"
                      >
                        <div className="w-1 h-1 rounded-full bg-purple-500" />
                        {ing.name}
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 py-4">
                      <AlertCircle className="h-4 w-4 mb-1 opacity-30" />
                      <p className="text-xs italic">בחר קבוצה</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* שלב 2: שיוך יעד */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* קטגוריה */}
          <Card className="border shadow-sm bg-white rounded-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 rounded-t-lg py-2.5 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-indigo-900">
                <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2א</div>
                שיוך לקטגוריה שלמה
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
              <Select onValueChange={(v) => setSelectedCategory(Number(v))} value={selectedCategory ? String(selectedCategory) : ''}>
                <SelectTrigger className="bg-white border-slate-300 h-10 text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="בחר קטגוריה..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300 shadow-xl rounded-lg">
                  {categories.map(c => (
                    <SelectItem key={c.id} value={String(c.id)} className="font-medium py-2 rounded-md">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={attachToCategory}
                disabled={!selectedGroup || !selectedCategory || groupIngredients.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white h-9 font-medium text-sm rounded-lg transition-colors"
              >
                בצע שיוך לקטגוריה
              </Button>
            </CardContent>
          </Card>

          {/* פריט בודד */}
          <Card className="border shadow-sm bg-white rounded-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-200 rounded-t-lg py-2.5 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-emerald-900">
                <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2ב</div>
                שיוך לפריט ספציפי
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
              <Select onValueChange={(v) => setSelectedItem(Number(v))} value={selectedItem ? String(selectedItem) : ''}>
                <SelectTrigger className="bg-white border-slate-300 h-10 text-slate-900 font-medium rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <SelectValue placeholder="בחר פריט מהתפריט..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300 shadow-xl rounded-lg">
                  {items.map(i => (
                    <SelectItem key={i.id} value={String(i.id)} className="font-medium py-2 rounded-md">
                      {i.name} <span className="text-slate-500 text-xs mr-1 font-normal">({i.category_name})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={attachToItem}
                disabled={!selectedGroup || !selectedItem || groupIngredients.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white h-9 font-medium text-sm rounded-lg transition-colors"
              >
                בצע שיוך לפריט
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
}