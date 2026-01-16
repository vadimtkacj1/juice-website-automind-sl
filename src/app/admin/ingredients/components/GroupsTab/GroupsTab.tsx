'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

// 1. Define what an Ingredient Group looks like
interface IngredientGroup {
  id: number;
  name_he: string;
  sort_order?: number;
  ingredients_count?: number;
}

// 2. Define the props the component receives
interface GroupsTabProps {
  groups: IngredientGroup[];
  search: string;
  onSearchChange: (value: string) => void;
  newGroupName: string;
  onNewGroupNameChange: (value: string) => void;
  onCreateGroup: () => Promise<void> | void;
  t: (key: string) => string;
}

export default function GroupsTab({ 
  groups, 
  search, 
  onSearchChange, 
  newGroupName, 
  onNewGroupNameChange, 
  onCreateGroup, 
  t 
}: GroupsTabProps) {
  
  // TypeScript now knows 'g' is an IngredientGroup
  const filtered = groups.filter((g: IngredientGroup) => 
    g.name_he.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ניהול קבוצות מרכיבים</h2>
          <p className="text-slate-600 mt-1">ארגן את המרכיבים שלך בקבוצות לוגיות</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            סה״כ: {filtered.length} קבוצות
          </span>
          <Link href="/admin/ingredient-groups/attach">
            <Button variant="outline" className="font-medium">
              שיוך קבוצות
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              יצירת קבוצה חדשה
            </label>
            <div className="flex gap-3">
              <input 
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                placeholder="שם הקבוצה החדשה..."
                value={newGroupName}
                onChange={(e) => onNewGroupNameChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onCreateGroup()}
              />
              <Button 
                onClick={onCreateGroup} 
                disabled={!newGroupName.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                צור קבוצה
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white border rounded-xl">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            רשימת קבוצות ({filtered.length})
          </h3>
        </div>
        
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-xl font-medium text-slate-900 mb-2">
                {search ? 'לא נמצאו תוצאות' : 'אין קבוצות עדיין'}
              </h4>
              <p className="text-slate-500 mb-6">
                {search ? 'נסה מילות חיפוש אחרות' : 'צור קבוצה ראשונה כדי להתחיל לארגן את המרכיבים'}
              </p>
              {search && (
                <Button 
                  onClick={() => onSearchChange('')}
                  variant="outline"
                  className="font-medium"
                >
                  נקה חיפוש
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((group: IngredientGroup) => (
                <div key={group.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">
                        {group.name_he.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {group.name_he}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-slate-500">
                          מזהה: #{group.id}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {group.ingredients_count || 0} מרכיבים
                        </span>
                        {group.sort_order !== undefined && (
                          <span className="text-sm text-slate-500">
                            סדר: {group.sort_order}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/admin/ingredient-groups/${group.id}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
                      ניהול קבוצה
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}