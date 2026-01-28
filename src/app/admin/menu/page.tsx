'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Percent, FolderOpen, Coffee, GripVertical } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description?: string;
  price: number;
  volume?: string;
  image?: string;
  discount_percent: number;
  is_available: boolean;
  sort_order?: number;
}

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useAdminLanguage();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<number[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<Record<number, MenuItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [updatingPriceId, setUpdatingPriceId] = useState<number | null>(null);
  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newDiscount, setNewDiscount] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    sort_order: '0',
    is_active: true
  });
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showAddIngredientDialog, setShowAddIngredientDialog] = useState(false);
  const [ingredientToAdd, setIngredientToAdd] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'error' | 'warning';
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const addIngredient = searchParams?.get('addIngredient');
    if (addIngredient) {
      const ingredientId = parseInt(addIngredient);
      if (!isNaN(ingredientId)) {
        setIngredientToAdd(ingredientId);
        setShowAddIngredientDialog(true);
        // Remove the parameter from URL
        router.replace('/admin/menu', { scroll: false });
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    const sortedCategories = [...categories].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );
    setCategoryOrder(sortedCategories.map((c) => c.id));

    const grouped: Record<number, MenuItem[]> = {};
    sortedCategories.forEach((cat) => {
      grouped[cat.id] = [];
    });
    items.forEach((item) => {
      if (!grouped[item.category_id]) {
        grouped[item.category_id] = [];
      }
      grouped[item.category_id].push(item);
    });
    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    });
    setItemsByCategory(grouped);
  }, [categories, items]);

  async function fetchData() {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch('/api/menu-items?include_inactive=true'),
        fetch('/api/menu-categories?include_inactive=true')
      ]);
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      setItems(itemsData.items || []);
      setCategories(catsData.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  function buildItemOrderPayload(state: Record<number, MenuItem[]>) {
    return Object.entries(state).flatMap(([catId, list]) =>
      list.map((item, index) => ({
        id: item.id,
        category_id: Number(catId),
        sort_order: index,
      }))
    );
  }

  function flattenItemsWithSort(state: Record<number, MenuItem[]>) {
    return Object.entries(state).flatMap(([catId, list]) =>
      list.map((item, index) => ({
        ...item,
        category_id: Number(catId),
        category_name:
          categories.find((c) => c.id === Number(catId))?.name || item.category_name,
        sort_order: index,
      }))
    );
  }

  async function persistCategoryOrder(orderIds: number[]) {
    const payload = orderIds.map((id, index) => ({ id, sort_order: index }));
    try {
      await fetch('/api/menu-categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: payload }),
      });
    } catch (error) {
      console.error('Error saving category order:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('Failed to save category order.'),
        type: 'error',
      });
    }
  }

  async function persistItemOrderPayload(payload: Array<{ id: number; category_id: number; sort_order: number }>) {
    try {
      await fetch('/api/menu-items/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: payload }),
      });
    } catch (error) {
      console.error('Error saving item order:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('Failed to save item order.'),
        type: 'error',
      });
    }
  }

  async function handleDeleteItem(id: number) {
    setConfirmDialog({
      open: true,
      title: t('Delete Menu Item'),
      description: t('Are you sure you want to delete this menu item? This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchData();
            setAlertDialog({
              open: true,
              title: t('Success'),
              message: t('Menu item deleted successfully.'),
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: t('Error'),
              message: data.error || t('Failed to delete menu item.'),
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: t('An error occurred while deleting the menu item.'),
            type: 'error',
          });
        }
      },
    });
  }

  async function handleDeleteCategory(id: number) {
    setConfirmDialog({
      open: true,
      title: t('Delete Category'),
      description: t('Are you sure you want to delete this category? Make sure to remove all items from this category first. This action cannot be undone.'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/menu-categories/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchData();
            setAlertDialog({
              open: true,
              title: t('Success'),
              message: t('Category deleted successfully.'),
              type: 'success',
            });
          } else {
            const data = await response.json();
            setAlertDialog({
              open: true,
              title: t('Error'),
              message: data.error || t('Error deleting category.'),
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: t('An error occurred while deleting the category.'),
            type: 'error',
          });
        }
      },
    });
  }

  function updateItemInState(target: MenuItem, patch: Partial<MenuItem>) {
    setItems((prev) => prev.map((it) => (it.id === target.id ? { ...it, ...patch } : it)));
    setItemsByCategory((prev) => {
      const next = { ...prev };
      const list = next[target.category_id] || [];
      next[target.category_id] = list.map((it) => (it.id === target.id ? { ...it, ...patch } : it));
      return next;
    });
  }

  async function toggleItemAvailability(item: MenuItem) {
    const nextAvailability = !item.is_available;
    setUpdatingAvailabilityId(item.id);
    updateItemInState(item, { is_available: nextAvailability });

    try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: nextAvailability })
      });
      if (!response.ok) {
        const data = await response.json();
        updateItemInState(item, { is_available: item.is_available });
        setAlertDialog({
          open: true,
          title: t('Error'),
          message: data.error || t('Failed to update item.'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      updateItemInState(item, { is_available: item.is_available });
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('Failed to update item.'),
        type: 'error',
      });
    }

    setUpdatingAvailabilityId(null);
  }

  async function updateItemPrice(item: MenuItem, price: number) {
    if (isNaN(price) || price < 0) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Price must be a positive number.'),
        type: 'warning',
      });
      return;
    }

    const previousPrice = item.price;
    setUpdatingPriceId(item.id);
    updateItemInState(item, { price });

    try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) {
        const data = await response.json();
        updateItemInState(item, { price: previousPrice });
        setAlertDialog({
          open: true,
          title: t('Error'),
          message: data.error || t('Failed to update price.'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating price:', error);
      updateItemInState(item, { price: previousPrice });
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('Failed to update price.'),
        type: 'error',
      });
    }

    setUpdatingPriceId(null);
  }

  function openDiscountDialog(item: MenuItem) {
    if (showDiscountForm && selectedItem?.id === item.id) {
      setShowDiscountForm(false);
      setSelectedItem(null);
      setNewDiscount('');
    } else {
      setSelectedItem(item);
      setNewDiscount(item.discount_percent.toString());
      setShowDiscountForm(true);
    }
  }

  async function updateDiscount() {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/menu-items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_percent: parseFloat(newDiscount) || 0 })
      });
      if (response.ok) {
        fetchData();
        setShowDiscountForm(false);
        setSelectedItem(null);
        setNewDiscount('');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
    }
  }

  function handleCategoryDrag(activeId: number, overId: number) {
    if (activeId === overId) return;
    setCategoryOrder((prev) => {
      const newOrder = arrayMove(prev, prev.indexOf(activeId), prev.indexOf(overId));
      persistCategoryOrder(newOrder);
      return newOrder;
    });
  }

  function handleItemDrag(activeData: any, overData: any) {
    if (!activeData) return;
    const fromCategory = activeData.categoryId;
    const itemId = activeData.itemId;
    let toCategory = fromCategory;
    let overItemId: number | null = null;

    if (overData?.type === 'item') {
      toCategory = overData.categoryId;
      overItemId = overData.itemId;
    } else if (overData?.type === 'container') {
      toCategory = overData.categoryId;
    } else {
      return;
    }

    // Restrict moving items to within the same category only
    if (toCategory !== fromCategory) return;

    const currentState = { ...itemsByCategory };
    const sourceList = [...(currentState[fromCategory] || [])];
    const targetList = fromCategory === toCategory ? sourceList : [...(currentState[toCategory] || [])];

    const activeIndex = sourceList.findIndex((it) => it.id === itemId);
    if (activeIndex === -1) return;

    const [moved] = sourceList.splice(activeIndex, 1);

    let insertIndex =
      overItemId !== null ? targetList.findIndex((it) => it.id === overItemId) : targetList.length;
    if (insertIndex === -1) insertIndex = targetList.length;

    targetList.splice(insertIndex, 0, {
      ...moved,
      category_id: toCategory,
      category_name: categories.find((c) => c.id === toCategory)?.name || moved.category_name,
    });

    const nextState = {
      ...currentState,
      [fromCategory]: fromCategory === toCategory ? targetList : sourceList,
      [toCategory]: targetList,
    };

    const payload = buildItemOrderPayload(nextState);
    const flattened = flattenItemsWithSort(nextState);

    setItemsByCategory(nextState);
    setItems(flattened);
    persistItemOrderPayload(payload);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    const activeType = active?.data?.current?.type;
    const overType = over?.data?.current?.type;

    if (activeType === 'category' && overType === 'category') {
      handleCategoryDrag(active.data.current.categoryId, over.data.current.categoryId);
      return;
    }

    if (activeType === 'item') {
      handleItemDrag(active.data.current, over.data.current);
    }

    if (activeType === 'item-row' && overType === 'item-row') {
      handleItemRowDrag(active.data.current, over.data.current);
    }
  }

  function handleItemRowDrag(activeData: any, overData: any) {
    if (!activeData || !overData) return;

    const fromCategory = activeData.categoryId;
    const toCategory = overData.categoryId;

    // keep reorder within same category
    if (fromCategory !== toCategory) return;

    const itemId = activeData.itemId;
    const overItemId = overData.itemId;
    if (itemId === overItemId) return;

    const currentState = { ...itemsByCategory };
    const list = [...(currentState[fromCategory] || [])];
    const activeIndex = list.findIndex((it) => it.id === itemId);
    const overIndex = list.findIndex((it) => it.id === overItemId);
    if (activeIndex === -1 || overIndex === -1) return;

    const reordered = arrayMove(list, activeIndex, overIndex);
    const nextState = { ...currentState, [fromCategory]: reordered };

    const payload = buildItemOrderPayload(nextState);
    const flattened = flattenItemsWithSort(nextState);

    setItemsByCategory(nextState);
    setItems(flattened);
    persistItemOrderPayload(payload);
  }

  const orderedCategories = categoryOrder
    .map((id) => categories.find((c) => c.id === id))
    .filter(Boolean) as MenuCategory[];

  function SortableCategoryCard({
    category,
    children,
    itemCount,
    onDelete,
  }: {
    category: MenuCategory;
    children: ReactNode;
    itemCount: number;
    onDelete: () => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `cat-${category.id}`,
      data: { type: 'category', categoryId: category.id },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <button
              className="p-2 rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 cursor-grab active:cursor-grabbing"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">{t(category.name)}</p>
              {category.description && (
                <p className="text-xs text-slate-500 mt-0.5">{t(category.description)}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {t('Items')}: {itemCount}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium',
                category.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {category.is_active ? t('Active') : t('Inactive')}
            </span>
            <Link href={`/admin/menu/categories/edit/${category.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3 space-y-2">{children}</div>
      </div>
    );
  }

  function SortableCategoryRow({
    category,
    itemCount,
    onDelete,
  }: {
    category: MenuCategory;
    itemCount: number;
    onDelete: () => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `cat-row-${category.id}`,
      data: { type: 'category', categoryId: category.id },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.85 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-slate-200 bg-white rounded-lg px-3 py-3 flex items-center gap-3 shadow-sm"
      >
        <button
          className="p-2 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {category.image && (
          <img
            src={category.image}
            alt={category.name}
            className="w-12 h-12 rounded-md object-cover border border-slate-200"
          />
        )}
        {!category.image && (
          <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
            <FolderOpen className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{t(category.name)}</p>
          {category.description && (
            <p className="text-xs text-slate-500 truncate">{t(category.description)}</p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            {t('Items')}: {itemCount}
          </p>
        </div>
        <span
          className={cn(
            'px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap',
            category.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          )}
        >
          {category.is_active ? t('Active') : t('Inactive')}
        </span>
        <Link href={`/admin/menu/categories/edit/${category.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  function SortableMenuItemCard({
    item,
    onToggleAvailability,
    onDiscount,
    onDelete,
    onUpdatePrice,
    isPriceSaving,
    isAvailabilitySaving,
  }: {
    item: MenuItem;
    onToggleAvailability: () => void;
    onDiscount: () => void;
    onDelete: () => void;
    onUpdatePrice: (newPrice: number) => Promise<void> | void;
    isPriceSaving: boolean;
    isAvailabilitySaving: boolean;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `item-${item.id}`,
      data: { type: 'item', itemId: item.id, categoryId: item.category_id },
    });
    const [priceValue, setPriceValue] = useState(item.price.toString());

    useEffect(() => {
      setPriceValue(item.price.toString());
    }, [item.price]);

    const handlePriceSave = async () => {
      const parsed = parseFloat(priceValue);
      if (isNaN(parsed) || parsed < 0) {
        setPriceValue(item.price.toString());
        return;
      }
      await onUpdatePrice(parsed);
    };

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.85 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'border border-slate-200 rounded-lg bg-white px-3 py-2 shadow-sm',
          isDragging ? 'ring-2 ring-indigo-200' : ''
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-[auto,1.4fr,1fr,0.9fr,0.9fr,auto] items-center gap-3 md:gap-2">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 cursor-grab active:cursor-grabbing"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-md object-cover border border-slate-200"
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{t(item.name)}</p>
            {item.volume && <p className="text-xs text-slate-500">{item.volume}</p>}
          </div>

          <div className="text-sm font-medium text-slate-700 truncate">
            {t(item.category_name)}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">₪</span>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              onBlur={handlePriceSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePriceSave();
                }
              }}
              className="h-9 w-[100px] text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 min-w-[72px]"
              onClick={handlePriceSave}
              disabled={isPriceSaving}
            >
              {isPriceSaving ? `${t('Save')}...` : t('Save')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDiscount}
              className={cn(
                'px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap',
                item.discount_percent > 0
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              )}
            >
              {item.discount_percent > 0 ? `-${item.discount_percent}%` : '0%'}
            </button>
            <button
              onClick={onToggleAvailability}
              disabled={isAvailabilitySaving}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap',
                item.is_available
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                isAvailabilitySaving ? 'opacity-70 cursor-not-allowed' : ''
              )}
            >
              {item.is_available ? t('Available') : t('Unavailable')}
            </button>
          </div>

          <div className="flex items-center justify-end gap-1">
            <Link href={`/admin/menu/edit/${item.id}/ingredients`}>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-purple-600 hover:text-purple-700" title={t('Configure ingredients')}>
                {t('Ingredients')}
              </Button>
            </Link>
            <Link href={`/admin/menu/edit/${item.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function SortableMenuItemRow({
    item,
    onToggleAvailability,
    onDiscount,
    onDelete,
    onUpdatePrice,
    isPriceSaving,
    isAvailabilitySaving,
  }: {
    item: MenuItem;
    onToggleAvailability: () => void;
    onDiscount: () => void;
    onDelete: () => void;
    onUpdatePrice: (newPrice: number) => Promise<void> | void;
    isPriceSaving: boolean;
    isAvailabilitySaving: boolean;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `item-row-${item.id}`,
      data: { type: 'item-row', itemId: item.id, categoryId: item.category_id },
    });
    const [priceValue, setPriceValue] = useState(item.price.toString());

    useEffect(() => {
      setPriceValue(item.price.toString());
    }, [item.price]);

    const handlePriceSave = async () => {
      const parsed = parseFloat(priceValue);
      if (isNaN(parsed) || parsed < 0) {
        setPriceValue(item.price.toString());
        return;
      }
      await onUpdatePrice(parsed);
    };

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.85 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'border border-slate-200 rounded-lg bg-white px-3 py-2 shadow-sm',
          isDragging ? 'ring-2 ring-indigo-200' : ''
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-[auto,1.4fr,1fr,0.9fr,0.9fr,auto] items-center gap-3 md:gap-2">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 cursor-grab active:cursor-grabbing"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-md object-cover border border-slate-200"
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{t(item.name)}</p>
            {item.volume && <p className="text-xs text-slate-500">{item.volume}</p>}
          </div>

          <div className="text-sm font-medium text-slate-700 truncate">{t(item.category_name)}</div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">₪</span>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              onBlur={handlePriceSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePriceSave();
                }
              }}
              className="h-9 w-[100px] text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 min-w-[72px]"
              onClick={handlePriceSave}
              disabled={isPriceSaving}
            >
              {isPriceSaving ? `${t('Save')}...` : t('Save')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDiscount}
              className={cn(
                'px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap',
                item.discount_percent > 0
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              )}
            >
              {item.discount_percent > 0 ? `-${item.discount_percent}%` : '0%'}
            </button>
            <button
              onClick={onToggleAvailability}
              disabled={isAvailabilitySaving}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap',
                item.is_available
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                isAvailabilitySaving ? 'opacity-70 cursor-not-allowed' : ''
              )}
            >
              {item.is_available ? t('Available') : t('Unavailable')}
            </button>
          </div>

          <div className="flex items-center justify-end gap-1">
            <Link href={`/admin/menu/edit/${item.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  function CategoryDropZone({ categoryId, hasItems }: { categoryId: number; hasItems?: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
      id: `drop-${categoryId}`,
      data: { type: 'container', categoryId },
    });

    return (
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-lg border border-dashed px-3 py-3 text-xs text-center text-slate-400 transition-colors',
          isOver ? 'border-indigo-400 bg-indigo-50/50 text-indigo-600' : 'border-slate-200',
          hasItems ? 'mt-2' : ''
        )}
      >
        {hasItems ? t('Drop to place at the end') : t('Drop items here')}
      </div>
    );
  }

  function openCategoryDialog(category?: MenuCategory) {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        sort_order: (category.sort_order || 0).toString(),
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        image: '',
        sort_order: '0',
        is_active: true
      });
    }
    setShowCategoryForm(true);
  }

  async function saveCategory() {
    if (!categoryForm.name.trim()) {
      setAlertDialog({
        open: true,
        title: t('Validation Error'),
        message: t('Category name is required.'),
        type: 'warning',
      });
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/menu-categories/${editingCategory.id}` 
        : '/api/menu-categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        image: categoryForm.image.trim() || null,
        sort_order: parseInt(categoryForm.sort_order) || 0,
        ...(editingCategory ? { is_active: categoryForm.is_active } : {})
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        fetchData();
        setShowCategoryForm(false);
        setEditingCategory(null);
        setAlertDialog({
          open: true,
          title: t('Success'),
          message: editingCategory ? t('Category updated successfully.') : t('Category created successfully.'),
          type: 'success',
        });
      } else {
        const data = await response.json();
        setAlertDialog({
          open: true,
          title: t('Error'),
          message: data.error || t('Error saving category.'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('An error occurred while saving the category.'),
        type: 'error',
      });
    }
  }

  async function handleAddIngredientToItem(itemId: number) {
    if (!ingredientToAdd) return;

    try {
      // First, get current ingredients for this item
      const currentResponse = await fetch(`/api/menu-items/${itemId}/custom-ingredients`);
      const currentData = await currentResponse.json();
      const currentIngredientIds = (currentData.ingredients || []).map((ing: any) => ing.id);
      
      // Add the new ingredient if it's not already there
      if (!currentIngredientIds.includes(ingredientToAdd)) {
        const newIngredientIds = [...currentIngredientIds, ingredientToAdd];
        
        const response = await fetch(`/api/menu-items/${itemId}/custom-ingredients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredient_ids: newIngredientIds })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Ingredient added successfully:', result);
          
          // REFRESH DATA HERE (Fixed from fetchMenu to fetchData)
          fetchData();
          
          setShowAddIngredientDialog(false);
          setIngredientToAdd(null);
          setAlertDialog({
            open: true,
            title: t('Success'),
            message: t('Ingredient added to menu item successfully!'),
            type: 'success',
          });
        } else {
          const data = await response.json();
          setAlertDialog({
            open: true,
            title: t('Error'),
            message: data.error || t('Failed to add ingredient to menu item.'),
            type: 'error',
          });
        }
      } else {
        setShowAddIngredientDialog(false);
        setIngredientToAdd(null);
        setAlertDialog({
          open: true,
          title: t('Info'),
          message: t('This ingredient is already added to this menu item.'),
          type: 'info',
        });
      }
    } catch (error) {
      console.error('Error adding ingredient to item:', error);
      setAlertDialog({
        open: true,
        title: t('Error'),
        message: t('An error occurred while adding the ingredient.'),
        type: 'error',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text={t('Loading menu...')} />
      </div>
    );
  }

  const stats = [
    { title: t('Categories'), value: categories.length, icon: FolderOpen, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: t('Total Items'), value: items.length, icon: Coffee, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: t('Available'), value: items.filter(i => i.is_available).length, icon: Coffee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: t('On Sale'), value: items.filter(i => i.discount_percent > 0).length, icon: Percent, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('Menu Management')}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{t('Categories, items, prices and discounts')}</p>
      </div>

      {/* Tabs */}
      <div className="flex">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('items')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'items'
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-200'
                : 'text-slate-600 hover:text-indigo-600'
            )}
          >
            {t('Menu Items')}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'categories'
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-200'
                : 'text-slate-600 hover:text-indigo-600'
            )}
          >
            {t('Categories')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-xl`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.75} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-medium">
                {activeTab === 'items' ? t('Menu Items') : t('Categories')}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {activeTab === 'items'
                  ? t('Drag categories and items to reorder. Add items inside a category.')
                  : t('Drag categories to reorder. Use edit to manage details.')}
              </p>
            </div>
            <div className="flex gap-2">
              {activeTab === 'items' ? (
                <>
                  <Link href="/admin/menu/add">
                    <Button variant="outline" className="h-9 px-4 border-slate-200">
                      <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                      {t('Add Item')}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/admin/menu/categories/add">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4">
                    <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                    {t('Add Category')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activeTab === 'items' ? (
            items.length === 0 ? (
              <div className="text-center text-slate-500 py-12 space-y-4">
                <p className="text-sm">{t('No items yet. Add a category and an item to get started.')}</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Link href="/admin/menu/categories/add">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4">
                      <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                      {t('Add Category')}
                    </Button>
                  </Link>
                  <Link href="/admin/menu/add">
                    <Button variant="outline" className="h-9 px-4 border-slate-200">
                      <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                      {t('Add Item')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                items={items.map((item) => `item-row-${item.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {items.map((item) => (
                      <SortableMenuItemRow
                        key={`item-row-${item.id}`}
                        item={item}
                        onToggleAvailability={() => toggleItemAvailability(item)}
                        onDiscount={() => openDiscountDialog(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onUpdatePrice={(value) => updateItemPrice(item, value)}
                        isPriceSaving={updatingPriceId === item.id}
                        isAvailabilitySaving={updatingAvailabilityId === item.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )
          ) : orderedCategories.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-sm">{t('No categories yet')}</p>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={orderedCategories.map((cat) => `cat-row-${cat.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedCategories.map((cat) => {
                    const categoryItems = itemsByCategory[cat.id] || [];
                    return (
                      <SortableCategoryRow
                        key={`cat-row-${cat.id}`}
                        category={cat}
                        itemCount={categoryItems.length}
                        onDelete={() => handleDeleteCategory(cat.id)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Discount Form */}
      {showDiscountForm && selectedItem && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">{t('Set Discount')}</CardTitle>
            <p className="text-sm text-slate-500">{t('Discount for:')} {selectedItem?.name ? t(selectedItem.name) : ''}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-slate-500">{t('Current Price')}</Label>
                <p className="text-xl font-semibold text-slate-900 mt-1">₪{selectedItem?.price}</p>
              </div>
              <div>
                <Label htmlFor="discount" className="text-xs text-slate-500">{t('Discount (%)')}</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              {parseFloat(newDiscount) > 0 && selectedItem && (
                <div>
                  <Label className="text-xs text-slate-500">{t('Discounted Price')}</Label>
                  <p className="text-xl font-semibold text-emerald-600 mt-1">
                    ₪{(selectedItem.price * (1 - parseFloat(newDiscount) / 100)).toFixed(0)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowDiscountForm(false);
                setSelectedItem(null);
                setNewDiscount('');
              }} className="border-slate-200">
                {t('Cancel')}
              </Button>
              <Button onClick={updateDiscount} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {t('Save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Form */}
      {showCategoryForm && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              {editingCategory ? t('Edit Category') : t('New Category')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cat-name" className="text-xs text-slate-500">{t('Name')} *</Label>
                <Input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder={t('Fresh Juices')}
                  required
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cat-desc" className="text-xs text-slate-500">{t('Description')}</Label>
                <Input
                  id="cat-desc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder={t('Category description (optional)')}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <ImageUpload
                  value={categoryForm.image}
                  onChange={(url) => setCategoryForm({ ...categoryForm, image: url })}
                  folder="categories"
                  label={t('Category Image')}
                />
              </div>
              <div>
                <Label htmlFor="cat-sort" className="text-xs text-slate-500">{t('Sort Order')}</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
                <p className="text-xs text-slate-400 mt-1">{t('Lower numbers appear first')}</p>
              </div>
              {editingCategory && (
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label htmlFor="cat-active" className="cursor-pointer text-sm">
                    {t('Active')}
                  </Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }} className="border-slate-200">
                {t('Cancel')}
              </Button>
              <Button onClick={saveCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingCategory ? t('Update') : t('Create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />

      {/* Dialog for selecting menu item to add ingredient */}
      <Dialog open={showAddIngredientDialog} onOpenChange={setShowAddIngredientDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Select Menu Item')}</DialogTitle>
            <DialogDescription>
              {t('Select a menu item to add the ingredient to')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-slate-400 py-8">{t('No menu items found')}</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddIngredientToItem(item.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{t(item.name)}</p>
                      <p className="text-xs text-slate-500">{t(item.category_name)}</p>
                    </div>
                    <Coffee className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddIngredientDialog(false);
                setIngredientToAdd(null);
              }}
            >
              {t('Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}