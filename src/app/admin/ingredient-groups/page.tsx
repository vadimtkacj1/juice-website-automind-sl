'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, Trash2, Pencil, Check, X, 
  Settings2, Plus, LayoutGrid, Layers 
} from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

interface IngredientGroup {
  id: number;
  name_he: string;
  sort_order?: number;
  ingredients_count?: number;
}

export default function IngredientGroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<IngredientGroup[]>([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean; title: string; message: string; type?: 'info' | 'success' | 'error' | 'warning';
  }>({
    open: false, title: '', message: '', type: 'info',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch('/api/ingredient-groups');
      const data = await res.json();
      setGroups(Array.isArray(data.groups) ? data.groups : []);
    } catch {
      showError('טעינת קבוצות המרכיבים נכשלה.');
    } finally {
      setLoading(false);
    }
  }

  const showError = (message: string) => {
    setAlertDialog({ open: true, title: 'שגיאה', message, type: 'error' });
  };

  const showSuccess = (message: string) => {
    setAlertDialog({ open: true, title: 'הצלחה', message, type: 'success' });
  };

  async function createGroup() {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/ingredient-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_he: newName.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewName('');
      fetchGroups();
      showSuccess('הקבוצה נוצרה בהצלחה!');
    } catch {
      showError('יצירת הקבוצה נכשלה.');
    }
  }

  async function saveEdit() {
    if (!editing || !editing.name.trim()) return;
    try {
      const res = await fetch(`/api/ingredient-groups/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_he: editing.name.trim() }),
      });
      if (!res.ok) throw new Error();
      setEditing(null);
      fetchGroups();
      showSuccess('שם הקבוצה עודכן.');
    } catch {
      showError('עדכון שם הקבוצה נכשל.');
    }
  }

  async function deleteGroup(id: number) {
    if (!confirm('האם למחוק קבוצה זו?')) return;
    try {
      const res = await fetch(`/api/ingredient-groups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchGroups();
      showSuccess('הקבוצה נמחקה.');
    } catch {
      showError('מחיקת הקבוצה נכשלה.');
    }
  }

  const sortedGroups = [...groups].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900" dir="rtl">
      {/* Upper Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/ingredients">
              <Button variant="ghost" className="hover:bg-slate-100 -mr-2 text-slate-500">
                <ArrowRight className="h-5 w-5 ml-2" />
                חזרה
              </Button>
            </Link>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">קבוצות מרכיבים</h1>
              <p className="text-xs text-slate-500 font-medium">ניהול וארגון תוספות לתפריט</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">{groups.length} קבוצות</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Right Column: Create Section */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-28">
              <h2 className="text-lg font-bold mb-1">יצירת קבוצה</h2>
              <p className="text-sm text-slate-500 mb-6">הגדר כותרת חדשה למרכיבים שלך</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 mr-1">שם הקבוצה</label>
                  <Input
                    placeholder="למשל: בסיס לשייק, תוספות..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createGroup()}
                    className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl"
                  />
                </div>
                <Button 
                  onClick={createGroup} 
                  disabled={!newName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  <Plus className="h-5 w-5 ml-2" />
                  הוסף קבוצה לתפריט
                </Button>
              </div>
            </div>
          </div>

          {/* Left Column: Groups List */}
          <div className="lg:col-span-8">
            {sortedGroups.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LayoutGrid className="h-10 w-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">אין קבוצות עדיין</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                  נראה שעדיין לא יצרת קבוצות מרכיבים. התחל ביצירת הקבוצה הראשונה שלך מימין.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sortedGroups.map((group) => (
                  <div 
                    key={group.id} 
                    className={cn(
                      "group bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1",
                      editing?.id === group.id && "ring-2 ring-indigo-500 border-transparent shadow-lg"
                    )}
                  >
                    {editing?.id === group.id ? (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <Input
                          value={editing.name}
                          onChange={(e) => setEditing({ id: group.id, name: e.target.value })}
                          className="h-11 border-indigo-200 focus:ring-indigo-500 rounded-lg"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} className="bg-indigo-600 hover:bg-indigo-700 flex-1 rounded-lg">
                            <Check className="h-4 w-4 ml-1" /> שמור
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="flex-1 rounded-lg">
                            <X className="h-4 w-4 ml-1" /> בטל
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-100">
                              {group.name_he.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg leading-tight">{group.name_he}</h4>
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">מזהה: #{group.id}</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteGroup(group.id)}
                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                           <div className="flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                              {group.ingredients_count || 0} מרכיבים
                           </div>
                           <div className="text-xs text-slate-400 font-medium">סדר תצוגה: {group.sort_order || 0}</div>
                        </div>

                        <div className="mt-auto flex gap-2">
                          <Link href={`/admin/ingredient-groups/${group.id}`} className="flex-1">
                            <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl h-10 transition-colors">
                              <Settings2 className="h-3.5 w-3.5 ml-1.5" />
                              ניהול תוכן
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditing({ id: group.id, name: group.name_he })}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-10 px-3"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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