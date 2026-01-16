'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, GripVertical, Save, Trash2, Plus, 
  X, Link2, Coffee
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Ingredient {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name_he: string;
}

/**
 * Utility to reorder items in an array after a drag-and-drop action
 */
function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const copy = [...arr];
  const [removed] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, removed);
  return copy;
}

export default function IngredientGroupDetailsPage() {
  const params = useParams();
  const groupId = Number((params as any)?.id);

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [attachedCategories, setAttachedCategories] = useState<any[]>([]);
  const [attachedMenuItems, setAttachedMenuItems] = useState<any[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean; title: string; message: string; type?: 'info' | 'success' | 'error' | 'warning';
  }>({ open: false, title: '', message: '', type: 'info' });

  // --- Data Loading ---
  useEffect(() => {
    if (!Number.isFinite(groupId)) return;
    loadData();
  }, [groupId]);

  async function loadData() {
    setLoading(true);
    try {
      const [groupRes, allRes, selectedRes, categoriesRes, menuItemsRes] = await Promise.all([
        fetch(`/api/ingredient-groups/${groupId}`),
        fetch('/api/custom-ingredients?include_inactive=true'),
        fetch(`/api/ingredient-groups/${groupId}/ingredients`),
        fetch('/api/menu-categories?include_inactive=true'),
        fetch('/api/menu-items?include_inactive=true'),
      ]);

      const groupData = await groupRes.json();
      setGroup(groupData.group || null);

      const allData = await allRes.json();
      setAllIngredients(Array.isArray(allData.ingredients) ? allData.ingredients : []);

      const selectedData = await selectedRes.json();
      setSelected(Array.isArray(selectedData.ingredients) ? selectedData.ingredients : []);

      const categoriesData = await categoriesRes.json();
      setCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);

      const menuItemsData = await menuItemsRes.json();
      setMenuItems(Array.isArray(menuItemsData.items) ? menuItemsData.items : []);

      // Load attached categories and menu items
      await loadAttachments();
    } catch {
      setAlertDialog({ 
        open: true, 
        title: 'שגיאה', 
        message: 'טעינת נתוני הקבוצה נכשלה.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }

  // --- Logic & Filtering ---
  const selectedIds = useMemo(() => new Set(selected.map((i) => i.id)), [selected]);

  const availableIngredients = useMemo(() => {
    return allIngredients.filter((i) => !selectedIds.has(i.id));
  }, [allIngredients, selectedIds]);

  const addIngredient = (ing: Ingredient) => {
    setSelected((prev) => [...prev, ing]);
  };

  const removeIngredient = (id: number) => {
    setSelected((prev) => prev.filter((x) => x.id !== id));
    setDragIndex(null);
  };

  // --- Drag and Drop Handlers ---
  const onDragStart = (index: number) => setDragIndex(index);
  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setSelected((prev) => moveItem(prev, dragIndex, index));
    setDragIndex(null);
  };

  // --- Persistence ---
  async function saveChanges() {
    setSaving(true);
    try {
      const ingredient_ids = selected.map((i) => i.id);
      const res = await fetch(`/api/ingredient-groups/${groupId}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_ids }),
      });
      if (!res.ok) throw new Error();
      setAlertDialog({ 
        open: true, 
        title: 'הצלחה', 
        message: 'השינויים נשמרו בהצלחה!', 
        type: 'success' 
      });
    } catch {
      setAlertDialog({ 
        open: true, 
        title: 'שגיאה', 
        message: 'שמירת השינויים נכשלה.', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  }

  // --- Load Attachments ---
  async function loadAttachments() {
    if (!group) return;
    
    try {
      // Check all categories for this group
      const categoriesWithGroup: any[] = [];
      for (const category of categories) {
        try {
          const res = await fetch(`/api/menu-categories/${category.id}/ingredient-configs`);
          const data = await res.json();
          const configs = data.configs || [];
          
          const hasGroup = configs.some((config: any) => 
            Number(config.ingredient_group_id) === groupId
          );
          
          if (hasGroup) {
            categoriesWithGroup.push(category);
          }
        } catch {
          // Skip if error loading category configs
        }
      }
      setAttachedCategories(categoriesWithGroup);

      // Check all menu items for this group
      const menuItemsWithGroup: any[] = [];
      for (const menuItem of menuItems) {
        try {
          const res = await fetch(`/api/menu-items/${menuItem.id}/custom-ingredients`);
          const data = await res.json();
          const ingredients = data.ingredients || [];
          
          const hasGroup = ingredients.some((ingredient: any) => 
            Number(ingredient.ingredient_group_id) === groupId
          );
          
          if (hasGroup) {
            menuItemsWithGroup.push(menuItem);
          }
        } catch {
          // Skip if error loading menu item ingredients
        }
      }
      setAttachedMenuItems(menuItemsWithGroup);
    } catch {
      // Error loading attachments
    }
  }

  // --- Group Attachment Functions ---
  async function attachToCategory(categoryId: number) {
    if (!group || selected.length === 0) return;
    
    try {
      const groupName = group.name_he;
      const ingredientIds = selected.map(ing => ing.id);

      const current = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`).then(r => r.json());
      const existing = current.configs || [];
      const byId = new Map();
      existing.forEach((c: any) => byId.set(Number(c.custom_ingredient_id), c));

      ingredientIds.forEach((id: number) => {
        byId.set(id, {
          ...(byId.get(id) || {}),
          custom_ingredient_id: id,
          ingredient_id: id, // Keep both for compatibility
          selection_type: 'single',
          ingredient_group_id: groupId,
          ingredient_group: groupName,
          is_required: false,
        });
      });

      const res = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: Array.from(byId.values()) })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Category attach error:', errorText);
        throw new Error(errorText);
      }
      
      setAlertDialog({ 
        open: true, 
        title: 'הצלחה', 
        message: 'הקבוצה שויכה לקטגוריה בהצלחה!', 
        type: 'success' 
      });
      await loadAttachments();
    } catch (error) {
      console.error('Attach to category error:', error);
      setAlertDialog({ 
        open: true, 
        title: 'שגיאה', 
        message: 'שיוך הקבוצה נכשל.', 
        type: 'error' 
      });
    }
  }

  async function attachToMenuItem(menuItemId: number) {
    if (!group || selected.length === 0) return;
    
    try {
      const groupName = group.name_he;
      const ingredientIds = selected.map(ing => ing.id);

      const current = await fetch(`/api/menu-items/${menuItemId}/custom-ingredients`).then(r => r.json());
      const existing = current.ingredients || [];
      const byId = new Map();
      existing.forEach((c: any) => byId.set(Number(c.id ?? c.ingredient_id), c));

      ingredientIds.forEach((id: number) => {
        byId.set(id, {
          ...(byId.get(id) || {}),
          ingredient_id: id,
          selection_type: 'single',
          ingredient_group_id: groupId,
          ingredient_group: groupName,
          is_required: false,
        });
      });

      const res = await fetch(`/api/menu-items/${menuItemId}/custom-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: Array.from(byId.values()) })
      });
      
      if (!res.ok) throw new Error();
      
      setAlertDialog({ 
        open: true, 
        title: 'הצלחה', 
        message: 'הקבוצה שויכה לפריט בהצלחה!', 
        type: 'success' 
      });
      await loadAttachments();
    } catch {
      setAlertDialog({ 
        open: true, 
        title: 'שגיאה', 
        message: 'שיוך הקבוצה נכשל.', 
        type: 'error' 
      });
    }
  }

  // --- Group Detachment Functions ---
  async function detachFromCategory(categoryId: number) {
    if (!group) return;
    
    try {
      const res = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`);
      const data = await res.json();
      const configs = data.configs || [];
      
      // Remove all ingredients from this group
      const updatedConfigs = configs.filter((config: any) => 
        Number(config.ingredient_group_id) !== groupId
      );
      
      const updateRes = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: updatedConfigs })
      });
      
      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error('Category detach error:', errorText);
        throw new Error(errorText);
      }
      
      setAlertDialog({ 
        open: true, 
        title: 'הצלחה', 
        message: 'הקבוצה נותקה מהקטגוריה בהצלחה!', 
        type: 'success' 
      });
      await loadAttachments();
    } catch (error) {
      console.error('Detach from category error:', error);
      setAlertDialog({ 
        open: true, 
        title: 'שגיאה', 
        message: 'ניתוק הקבוצה נכשל.', 
        type: 'error' 
      });
    }
  }

  async function detachFromMenuItem(menuItemId: number) {
    if (!group) return;
    
    try {
      const res = await fetch(`/api/menu-items/${menuItemId}/custom-ingredients`);
      const data = await res.json();
      const ingredients = data.ingredients || [];
      
      // Remove all ingredients from this group
      const updatedIngredients = ingredients.filter((ingredient: any) => 
        Number(ingredient.ingredient_group_id) !== groupId
      );
      
      const updateRes = await fetch(`/api/menu-items/${menuItemId}/custom-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: updatedIngredients })
      });
      
      if (!updateRes.ok) throw new Error();
      
      setAlertDialog({ 
        open: true, 
        title: 'הצלחה', 
        message: 'הקבוצה נותקה מהפריט בהצלחה!', 
        type: 'success' 
      });
      await loadAttachments();
    } catch {
      setAlertDialog({ 
        open: true, 
        title: 'שגיאה', 
        message: 'ניתוק הקבוצה נכשל.', 
        type: 'error' 
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 mt-4 font-medium">טוען פרטי קבוצה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/ingredient-groups">
              <Button variant="outline" className="font-medium rounded-lg border-slate-300 hover:border-slate-400">
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזור לרשימה
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {group?.name_he || 'פרטי קבוצה'}
              </h1>
              <p className="text-slate-600 mt-1">ניהול מרכיבים בקבוצה</p>
            </div>
          </div>
          <Button 
            onClick={saveChanges} 
            disabled={saving} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-lg shadow-sm disabled:opacity-50"
          >
            {saving ? 'שומר שינויים...' : 'שמור שינויים'}
          </Button>
        </div>

        {/* Attachment Section */}
        {(selected.length > 0 || attachedCategories.length > 0 || attachedMenuItems.length > 0) && (
          <div className="bg-white rounded-xl border shadow-sm mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200 rounded-t-xl">
              <h2 className="text-lg font-semibold text-slate-900">שיוך קבוצה לתפריט</h2>
              <p className="text-sm text-slate-600 mt-1">קשר את הקבוצה הזו לקטגוריות או פריטי תפריט</p>
            </div>
            <div className="p-6 space-y-8">
              
              {/* Currently Attached */}
              {(attachedCategories.length > 0 || attachedMenuItems.length > 0) && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-purple-600" />
                    הקבוצה כרגע מחוברת אל:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attached Categories */}
                    {attachedCategories.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">קטגוריות:</h4>
                        <div className="space-y-2">
                          {attachedCategories.map(category => (
                            <div key={category.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Coffee className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-900">{category.name}</span>
                              </div>
                              <button
                                onClick={() => detachFromCategory(category.id)}
                                className="p-1 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="נתק מהקטגוריה"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Attached Menu Items */}
                    {attachedMenuItems.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">פריטי תפריט:</h4>
                        <div className="space-y-2">
                          {attachedMenuItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div>
                                <div className="font-medium text-green-900">{item.name}</div>
                                <div className="text-xs text-green-700">{item.category_name}</div>
                              </div>
                              <button
                                onClick={() => detachFromMenuItem(item.id)}
                                className="p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="נתק מהפריט"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachment Options - Only show if group has ingredients */}
              {selected.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-slate-600" />
                    שיוך קבוצה לפריטים חדשים:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categories */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-blue-600" />
                        שיוך לקטגוריה
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories
                          .filter(cat => !attachedCategories.some(attached => attached.id === cat.id))
                          .map(category => (
                          <button
                            key={category.id}
                            onClick={() => attachToCategory(category.id)}
                            className="w-full text-right p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium"
                          >
                            {category.name}
                          </button>
                        ))}
                        {categories.filter(cat => !attachedCategories.some(attached => attached.id === cat.id)).length === 0 && (
                          <p className="text-sm text-slate-500 italic p-3">כל הקטגוריות כבר מחוברות</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-green-600" />
                        שיוך לפריט ספציפי
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {menuItems
                          .filter(item => !attachedMenuItems.some(attached => attached.id === item.id))
                          .map(item => (
                          <button
                            key={item.id}
                            onClick={() => attachToMenuItem(item.id)}
                            className="w-full text-right p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors text-sm"
                          >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-slate-500 text-xs">{item.category_name}</div>
                          </button>
                        ))}
                        {menuItems.filter(item => !attachedMenuItems.some(attached => attached.id === item.id)).length === 0 && (
                          <p className="text-sm text-slate-500 italic p-3">כל הפריטים כבר מחוברים</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Selected Items Panel */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                מרכיבים נבחרים ({selected.length})
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                גרור ושחרר כדי לשנות סדר
              </p>
            </div>

            <div className="min-h-[500px]">
              {selected.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <GripVertical className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">אין מרכיבים נבחרים</h3>
                  <p className="text-sm">הוסף מרכיבים מהרשימה הזמינה</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selected.map((ing, idx) => (
                    <div
                      key={`sel-${ing.id}`}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                      onDragEnd={() => setDragIndex(null)}
                      className={cn(
                        "flex items-center justify-between p-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
                        dragIndex === idx 
                          ? "bg-purple-100 border-l-4 border-purple-500 shadow-md" 
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-slate-400" />
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {idx + 1}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">{ing.name}</span>
                          <div className="text-sm text-slate-500">מזהה: #{ing.id}</div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeIngredient(ing.id)}
                        className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                        title="הסר מהקבוצה"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Items Panel */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">מרכיבים זמינים</h2>
              <p className="text-sm text-slate-600 mt-1">בחר מרכיבים להוספה לקבוצה</p>
            </div>


            {/* Available Items List */}
            <div className="max-h-[480px] overflow-y-auto p-4">
              {availableIngredients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">אין מרכיבים זמינים</h3>
                  <p className="text-sm">כל המרכיבים כבר נוספו לקבוצה</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableIngredients.map((ing) => (
                    <div 
                      key={`avail-${ing.id}`} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-xs">
                            {ing.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">{ing.name}</span>
                          <div className="text-xs text-slate-500">#{ing.id}</div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => addIngredient(ing)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="h-3 w-3 ml-1" />
                        הוסף
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alert Dialog */}
        <AlertDialog
          open={alertDialog.open}
          onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
        />
      </div>
    </div>
  );
}