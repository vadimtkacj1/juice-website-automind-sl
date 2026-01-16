'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminLanguage } from '@/lib/admin-language-context';
import LoadingSpinner from '@/components/LoadingSpinner';

// Sub-components
import PageHeader from './components/PageHeader/PageHeader';
import TabSwitcher from './components/TabSwitcher/TabSwitcher';
import IngredientsTab from './components/IngredientsTab/IngredientsTab';
import GroupsTab from './components/GroupsTab/GroupsTab';
import DialogsManager from './components/DialogsManager/DialogsManager';

/**
 * Interface defining the structure of the dialogs' state.
 * This ensures type safety when passing these states to child components.
 */
export interface DialogsState {
  addToCategory: boolean;
  addToMenuItem: boolean;
  attachments: boolean;
  confirm: { 
    open: boolean; 
    title: string; 
    description: string; 
    onConfirm: () => void 
  };
  alert: { 
    open: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error' | 'warning' 
  };
}

export default function AdminIngredientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();

  // --- Data State ---
  // Using <any[]> to prevent TypeScript from inferring "never[]" (empty array that can't be updated)
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // --- UI & Search State ---
  const [activeTab, setActiveTab] = useState<'ingredients' | 'groups'>('ingredients');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // --- Dialog & Selection State ---
  const [ingredientToAdd, setIngredientToAdd] = useState<number | null>(null);
  const [dialogs, setDialogs] = useState<DialogsState>({
    addToCategory: false,
    addToMenuItem: false,
    attachments: false,
    confirm: { open: false, title: '', description: '', onConfirm: () => {} },
    alert: { open: false, title: '', message: '', type: 'info' }
  });

  /**
   * Initial data fetch: Ingredients, Groups, and Categories.
   */
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchIngredients(), fetchGroups(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  /**
   * URL Parameter sync. 
   * Opens the "Add to Category" dialog if 'addToCategory' ID is present in the URL.
   */
  useEffect(() => {
    const addToCategory = searchParams?.get('addToCategory');
    if (addToCategory) {
      const id = parseInt(addToCategory);
      if (!isNaN(id)) {
        setIngredientToAdd(id);
        setDialogs(prev => ({ ...prev, addToCategory: true }));
        // Clean up the URL after processing the parameter
        router.replace('/admin/ingredients', { scroll: false });
      }
    }
  }, [searchParams, router]);

  // --- API Functions ---

  const fetchIngredients = async () => {
    const res = await fetch('/api/custom-ingredients?include_inactive=true');
    const data = await res.json();
    setIngredients(data.ingredients || []);
  };

  const fetchGroups = async () => {
    const res = await fetch('/api/ingredient-groups');
    const data = await res.json();
    setGroups(Array.isArray(data.groups) ? data.groups : []);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/menu-categories?include_inactive=true');
    const data = await res.json();
    setCategories(data.categories || []);
  };

  const fetchMenuItems = async () => {
    const res = await fetch('/api/menu-items?include_inactive=true');
    const data = await res.json();
    setMenuItems(data.items || []);
  };

  // --- Action Handlers ---

  /**
   * Creates a new ingredient group.
   */
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch('/api/ingredient-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_he: newGroupName.trim(), sort_order: groups.length }),
      });
      if (!res.ok) throw new Error();
      
      setNewGroupName('');
      fetchGroups();
      setDialogs(p => ({ 
        ...p, 
        alert: { open: true, title: t('Success'), message: t('Group created!'), type: 'success' } 
      }));
    } catch {
      setDialogs(p => ({ 
        ...p, 
        alert: { open: true, title: t('Error'), message: 'Failed to create group', type: 'error' } 
      }));
    }
  };

  /**
   * Triggers a confirmation dialog for ingredient deletion.
   */
  const handleDeleteIngredient = (id: number) => {
    setDialogs(prev => ({
      ...prev,
      confirm: {
        open: true,
        title: t('Delete'),
        description: t('This cannot be undone.'),
        onConfirm: async () => {
          await fetch(`/api/custom-ingredients/${id}`, { method: 'DELETE' });
          fetchIngredients();
          setDialogs(p => ({ ...p, confirm: { ...p.confirm, open: false } }));
        }
      }
    }));
  };

  // Render loading state while initial data is being fetched
  if (loading) {
    return (
      <div className="p-20 text-center">
        <LoadingSpinner size="lg" text={t('Loading...')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader t={t} />

        <div className="mt-8">
          <TabSwitcher 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            t={t} 
          />

          <div className="mt-8">
            {/* Main Content: Conditional rendering based on active tab */}
            {activeTab === 'ingredients' ? (
              <IngredientsTab 
                ingredients={ingredients}
                search={ingredientSearch}
                onSearchChange={setIngredientSearch}
                onDelete={handleDeleteIngredient}
                onAddLink={(id: any) => { 
                  setIngredientToAdd(id); 
                  fetchMenuItems(); 
                  setDialogs(p => ({ ...p, addToMenuItem: true })); 
                }}
                onAddToCategory={(id: any) => {
                  setIngredientToAdd(id);
                  setDialogs(p => ({ ...p, addToCategory: true }));
                }}
                onManageAttachments={(id: any) => { 
                  setIngredientToAdd(id); 
                  setDialogs(p => ({ ...p, attachments: true })); 
                }}
                t={t}
              />
            ) : (
              <GroupsTab 
                groups={groups}
                search={groupSearch}
                onSearchChange={setGroupSearch}
                newGroupName={newGroupName}
                onNewGroupNameChange={setNewGroupName}
                onCreateGroup={handleCreateGroup}
                t={t}
              />
            )}
          </div>
        </div>

        {/* Global Manager for Modals and Dialogs */}
        <DialogsManager 
          dialogs={dialogs}
          setDialogs={setDialogs}
          ingredientId={ingredientToAdd}
          categories={categories}
          menuItems={menuItems}
          t={t}
        />
      </div>
    </div>
  );
}