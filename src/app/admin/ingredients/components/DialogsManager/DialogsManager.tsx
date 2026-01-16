'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

/**
 * Re-defining the structure to match the parent state
 */
interface DialogsState {
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

interface DialogsManagerProps {
  dialogs: DialogsState;
  setDialogs: React.Dispatch<React.SetStateAction<DialogsState>>;
  ingredientId: number | null;
  categories: any[];
  menuItems: any[];
  t: (key: string) => string;
}

/**
 * FIX: Notice the { dialogs, ... } braces! 
 * Without them, the first argument is the entire "props" object.
 */
export default function DialogsManager({
  dialogs,
  setDialogs,
  ingredientId,
  categories,
  menuItems,
  t
}: DialogsManagerProps) {
  
  // State for attachments management
  const [attachedCategories, setAttachedCategories] = useState<any[]>([]);
  const [attachedMenuItems, setAttachedMenuItems] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  // Load attachments when the dialog opens
  useEffect(() => {
    if (dialogs.attachments && ingredientId) {
      loadAttachments();
    }
  }, [dialogs.attachments, ingredientId]);

  // Functions
  const loadAttachments = async () => {
    if (!ingredientId) return;
    
    setLoadingAttachments(true);
    try {
      const response = await fetch(`/api/custom-ingredients/${ingredientId}/attachments`);
      
      if (response.ok) {
        const data = await response.json();
        setAttachedCategories(data.categories || []);
        setAttachedMenuItems(data.menuItems || []);
      } else {
        throw new Error('Failed to load attachments');
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
      setDialogs(prev => ({ 
        ...prev, 
        alert: { 
          open: true, 
          title: t('Error'), 
          message: t('Failed to load attachments'), 
          type: 'error' 
        } 
      }));
    } finally {
      setLoadingAttachments(false);
    }
  };

  const detachFromCategory = async (categoryId: number) => {
    if (!ingredientId) return;
    
    try {
      const res = await fetch(`/api/custom-ingredients/${ingredientId}/attachments?category_id=${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to detach');
      
      setAttachedCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setDialogs(prev => ({ 
        ...prev, 
        alert: { 
          open: true, 
          title: t('Success'), 
          message: t('Ingredient removed successfully'), 
          type: 'success' 
        } 
      }));
    } catch (error) {
      setDialogs(prev => ({ 
        ...prev, 
        alert: { 
          open: true, 
          title: t('Error'), 
          message: t('Failed to detach'), 
          type: 'error' 
        } 
      }));
    }
  };

  const detachFromMenuItem = async (menuItemId: number) => {
    if (!ingredientId) return;
    
    try {
      const res = await fetch(`/api/custom-ingredients/${ingredientId}/attachments?menu_item_id=${menuItemId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to detach');
      
      setAttachedMenuItems(prev => prev.filter(item => item.id !== menuItemId));
      setDialogs(prev => ({ 
        ...prev, 
        alert: { 
          open: true, 
          title: t('Success'), 
          message: t('Ingredient removed successfully'), 
          type: 'success' 
        } 
      }));
    } catch (error) {
      setDialogs(prev => ({ 
        ...prev, 
        alert: { 
          open: true, 
          title: t('Error'), 
          message: t('Failed to detach'), 
          type: 'error' 
        } 
      }));
    }
  };

  const addToMenuItemHandler = async (menuItemId: number) => {
    if (!ingredientId) {
      console.error('No ingredient ID provided for menu item');
      return;
    }
    
    console.log(`Adding ingredient ${ingredientId} to menu item ${menuItemId}`);
    
    try {
      const requestBody = {
        configs: [{
          ingredient_id: ingredientId,
          selection_type: 'multiple',
          is_required: false
        }]
      };
      
      console.log('Sending request to menu item API:', requestBody);
      
      const res = await fetch(`/api/menu-items/${menuItemId}/custom-ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await res.text();
      console.log(`Menu item API Response: ${res.status} ${res.statusText}`, responseText);
      
      if (!res.ok) {
        let errorMessage = 'Failed to add';
        try {
          const error = JSON.parse(responseText);
          if (error.message?.includes('already exists')) {
            console.log('Ingredient already exists in menu item');
            setDialogs(prev => ({ 
              ...prev, 
              alert: { 
                open: true, 
                title: t('Already Added'), 
                message: t('This ingredient is already added to this menu item.'), 
                type: 'info' 
              } 
            }));
            return;
          }
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(`${res.status} ${res.statusText} - ${errorMessage}`);
      }
      
      console.log('Successfully added ingredient to menu item');
      setDialogs(prev => ({ 
        ...prev, 
        addToMenuItem: false,
        alert: { 
          open: true, 
          title: t('Success'), 
          message: t('Ingredient added to menu item successfully!'), 
          type: 'success' 
        } 
      }));
    } catch (error) {
      console.error('Error adding to menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDialogs(prev => ({
        ...prev,
        alert: {
          open: true,
          title: t('Error'),
          message: `${t('Failed to add ingredient to menu item.')}\n${errorMessage}`,
          type: 'error'
        }
      }));
    }
  };

  const addToCategoryHandler = async (categoryId: number) => {
    if (!ingredientId) {
      console.error('No ingredient ID provided');
      return;
    }
    
    console.log(`Adding ingredient ${ingredientId} to category ${categoryId}`);
    
    try {
      // First check current configurations
      console.log(`Fetching current configs for category ${categoryId}`);
      const current = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`);
      
      if (!current.ok) {
        throw new Error(`Failed to fetch current configs: ${current.status} ${current.statusText}`);
      }
      
      const currentData = await current.json();
      const existing = currentData.configs || [];
      console.log(`Found ${existing.length} existing configs:`, existing);
      
      // Check if ingredient is already attached
      const alreadyExists = existing.some((config: any) => 
        Number(config.custom_ingredient_id) === ingredientId || Number(config.ingredient_id) === ingredientId
      );
      
      if (alreadyExists) {
        console.log('Ingredient already exists in category');
        setDialogs(prev => ({ 
          ...prev, 
          alert: { 
            open: true, 
            title: t('Already Added'), 
            message: t('This ingredient is already attached to this category.'), 
            type: 'info' 
          } 
        }));
        return;
      }

      // Add new config
      const newConfig = {
        custom_ingredient_id: ingredientId,
        ingredient_id: ingredientId,
        selection_type: 'multiple',
        is_required: false,
        price_override: null
      };

      const updatedConfigs = [...existing, newConfig];
      console.log('Sending updated configs:', updatedConfigs);

      const res = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: updatedConfigs })
      });
      
      const responseText = await res.text();
      console.log(`API Response: ${res.status} ${res.statusText}`, responseText);
      
      if (!res.ok) {
        throw new Error(`Failed to add to category: ${res.status} ${res.statusText} - ${responseText}`);
      }
      
      console.log('Successfully added ingredient to category');
      setDialogs(prev => ({ 
        ...prev, 
        addToCategory: false,
        alert: { 
          open: true, 
          title: t('Success'), 
          message: t('Ingredient added to category successfully!'), 
          type: 'success' 
        } 
      }));
    } catch (error) {
      console.error('Error adding to category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDialogs(prev => ({
        ...prev,
        alert: {
          open: true,
          title: t('Error'),
          message: `${t('Failed to add ingredient to category.')}\n${errorMessage}`,
          type: 'error'
        }
      }));
    }
  };

  // Safety check: If dialogs is somehow missing, don't crash the app
  if (!dialogs) return null;

  return (
    <>
      {/* 1. Add to Category Dialog */}
      {dialogs.addToCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-w-[90vw]" dir="rtl">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('Add to Category')}</h2>
            <p className="text-base text-gray-600 mb-6">בחר קטגוריה להוספת המרכיב</p>
            <div className="max-h-[400px] overflow-y-auto mb-6 space-y-2">
              {categories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t('No categories found.')}</p>
              ) : (
                categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => addToCategoryHandler(category.id)}
                    className="w-full text-right p-4 hover:bg-blue-50 hover:border-blue-300 rounded-lg border-2 border-gray-200 transition-all flex justify-between items-center group"
                  >
                    <span className="font-semibold text-lg text-gray-800 group-hover:text-blue-900">{category.name}</span>
                    <span className={`text-base px-3 py-1 rounded-full font-medium ${
                      category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.is_active ? 'פעיל ✓' : 'לא פעיל'}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => setDialogs(prev => ({ ...prev, addToCategory: false }))}
                variant="outline"
                className="px-6 py-2"
              >
                ביטול
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add to Menu Item Dialog */}
      {dialogs.addToMenuItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-w-[90vw]" dir="rtl">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('Add to Menu Item')}</h2>
            <p className="text-base text-gray-600 mb-6">{t('Select a menu item to add this ingredient')}</p>
            <div className="max-h-[400px] overflow-y-auto mb-6 space-y-2">
              {menuItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t('No menu items found')}</p>
              ) : (
                menuItems.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => addToMenuItemHandler(item.id)}
                    className="w-full text-right p-4 hover:bg-blue-50 hover:border-blue-300 rounded-lg border-2 border-gray-200 transition-all flex justify-between items-center group"
                  >
                    <span className="font-semibold text-lg text-gray-800 group-hover:text-blue-900">{item.name}</span>
                    <span className="text-base px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">₪{item.price}</span>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => setDialogs(prev => ({ ...prev, addToMenuItem: false }))}
                variant="outline"
                className="px-6 py-2"
              >
                ביטול
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Manage Attachments Dialog */}
      {dialogs.attachments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-w-[90vw]" dir="rtl">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('Manage Attachments')}</h2>
            <p className="text-base text-gray-600 mb-6">{t('Detach this ingredient from categories or menu items')}</p>

            {loadingAttachments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">טוען...</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[400px] overflow-y-auto">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">קטגוריות מצורפות</h3>
                  {attachedCategories.length === 0 ? (
                    <p className="text-gray-500 text-base py-4">{t('No categories attached')}</p>
                  ) : (
                    <div className="space-y-2">
                      {attachedCategories.map((category: any) => (
                        <div key={category.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <span className="font-semibold text-lg text-gray-800">{category.name}</span>
                          <Button
                            onClick={() => detachFromCategory(category.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          >
                            {t('Detach')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">פריטי תפריט מצורפים</h3>
                  {attachedMenuItems.length === 0 ? (
                    <p className="text-gray-500 text-base py-4">{t('No menu items attached')}</p>
                  ) : (
                    <div className="space-y-2">
                      {attachedMenuItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg text-gray-800">{item.name}</span>
                            <span className="text-base px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">₪{item.price}</span>
                          </div>
                          <Button
                            onClick={() => detachFromMenuItem(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          >
                            {t('Detach')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                onClick={() => setDialogs(prev => ({ ...prev, attachments: false }))}
                variant="outline"
                className="px-6 py-2"
              >
                סגור
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Beautiful Alert Dialog */}
      <AlertDialog
        open={dialogs.alert?.open || false}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, alert: { ...prev.alert, open } }))}
        title={dialogs.alert?.title || ''}
        message={dialogs.alert?.message || ''}
        type={dialogs.alert?.type || 'info'}
      />

      {/* 3. Beautiful Confirmation Dialog */}
      <ConfirmDialog
        open={dialogs.confirm?.open || false}
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, confirm: { ...prev.confirm, open } }))}
        title={dialogs.confirm?.title || ''}
        description={dialogs.confirm?.description || ''}
        confirmText={t('Confirm')}
        cancelText={t('Cancel')}
        onConfirm={dialogs.confirm?.onConfirm || (() => {})}
        variant="destructive"
      />
    </>
  );
}