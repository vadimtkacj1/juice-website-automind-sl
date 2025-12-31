'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash, Settings, DollarSign, GripVertical } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import ImageUpload from '@/components/ImageUpload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Ingredient {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredient_category: 'boosters' | 'fruits' | 'toppings';
  is_available: boolean;
  sort_order: number;
}

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
}

interface CategoryIngredientConfig {
  category_id: number;
  category_name: string;
  ingredient_id: number;
  ingredient_name: string;
  selection_type: 'single' | 'multiple';
  price_override?: number;
  volume_prices?: Record<string, number>; // Prices for each category volume, e.g., {"0.5": 2.00, "1": 4.00}
}

interface VolumeOption {
  id?: number;
  volume: string;
  price: number;
  is_default: boolean;
  sort_order: number;
}

function SortableRow({
  ingredient,
  onEdit,
  onDelete,
}: {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ingredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="font-medium w-12">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{ingredient.sort_order}</TableCell>
      <TableCell className="font-medium">{ingredient.name}</TableCell>
      <TableCell>{ingredient.description || '-'}</TableCell>
      <TableCell>${ingredient.price.toFixed(2)}</TableCell>
      <TableCell>{ingredient.is_available ? 'Yes' : 'No'}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(ingredient)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(ingredient.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'boosters' | 'fruits' | 'toppings'>('fruits');
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [showCategoryConfigDialog, setShowCategoryConfigDialog] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryIngredientConfig[]>([]);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [categoryIngredientCounts, setCategoryIngredientCounts] = useState<Record<number, number>>({});
  const [volumeOptions, setVolumeOptions] = useState<VolumeOption[]>([]);
  const [ingredientVolumes, setIngredientVolumes] = useState<Record<number, VolumeOption[]>>({});
  const [categoryVolumes, setCategoryVolumes] = useState<VolumeOption[]>([]); // Volumes for the selected category
  const isFetchingRef = useRef(false);
  const hasInitialFetchRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    description: '',
    price: '0',
    image: '',
    ingredient_category: 'fruits' as 'boosters' | 'fruits' | 'toppings',
    is_available: true,
    sort_order: '0',
  });
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

  const fetchData = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    try {
      const [ingredientsRes, categoriesRes] = await Promise.all([
        fetch('/api/custom-ingredients?include_inactive=true'),
        fetch('/api/menu-categories?include_inactive=true')
      ]);
      const ingredientsData = await ingredientsRes.json();
      const categoriesData = await categoriesRes.json();
      setIngredients(ingredientsData.ingredients || []);
      setMenuCategories(categoriesData.categories || []);
      
      // Fetch ingredient counts for each category
      const counts: Record<number, number> = {};
      await Promise.all(
        (categoriesData.categories || []).map(async (category: MenuCategory) => {
          try {
            const res = await fetch(`/api/menu-categories/${category.id}/ingredient-configs?include_inactive=true`);
            const data = await res.json();
            counts[category.id] = (data.configs || []).length;
          } catch (error) {
            counts[category.id] = 0;
          }
        })
      );
      setCategoryIngredientCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only fetch once on initial mount
    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategoryConfigs(categoryId: number) {
    try {
      // Fetch category volumes first
      const volumesRes = await fetch(`/api/menu-categories/${categoryId}/volumes`);
      const volumesData = await volumesRes.json();
      setCategoryVolumes(volumesData.volumes || []);

      const res = await fetch(`/api/menu-categories/${categoryId}/ingredient-configs?include_inactive=true`);
      const data = await res.json();
      // Map custom_ingredient_id to ingredient_id for consistency
      const mappedConfigs = (data.configs || []).map((config: any) => {
        // Parse volume_prices JSON if it exists
        let volume_prices: Record<string, number> | undefined = undefined;
        if (config.volume_prices) {
          try {
            volume_prices = typeof config.volume_prices === 'string' 
              ? JSON.parse(config.volume_prices) 
              : config.volume_prices;
          } catch (e) {
            volume_prices = undefined;
          }
        }
        
        return {
          category_id: config.category_id,
          category_name: config.category_name,
          ingredient_id: config.custom_ingredient_id, // Map custom_ingredient_id to ingredient_id
          ingredient_name: config.ingredient_name,
          selection_type: config.selection_type,
          price_override: config.price_override,
          volume_prices: volume_prices,
        };
      });
      setCategoryConfigs(mappedConfigs);
    } catch (error) {
      console.error('Error fetching category configs:', error);
    }
  }

  async function handleOpenIngredientDialog(ingredient?: Ingredient) {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setIngredientForm({
        name: ingredient.name,
        description: ingredient.description || '',
        price: ingredient.price.toString(),
        image: ingredient.image || '',
        ingredient_category: ingredient.ingredient_category,
        is_available: ingredient.is_available,
        sort_order: ingredient.sort_order.toString(),
      });
      // Fetch volume options for this ingredient
      try {
        const res = await fetch(`/api/custom-ingredients/${ingredient.id}/volumes`);
        const data = await res.json();
        setVolumeOptions(data.volumes || []);
      } catch (error) {
        console.error('Error fetching volumes:', error);
        setVolumeOptions([]);
      }
    } else {
      setEditingIngredient(null);
      setIngredientForm({
        name: '',
        description: '',
        price: '0',
        image: '',
        ingredient_category: activeTab,
        is_available: true,
        sort_order: '0',
      });
      setVolumeOptions([]);
    }
    setShowIngredientDialog(true);
  }

  function addVolumeOption() {
    setVolumeOptions([...volumeOptions, {
      volume: '',
      price: parseFloat(ingredientForm.price) || 0,
      is_default: volumeOptions.length === 0,
      sort_order: volumeOptions.length
    }]);
  }

  function removeVolumeOption(index: number) {
    const newVolumes = volumeOptions.filter((_, i) => i !== index);
    // If we removed the default, make the first one default
    if (newVolumes.length > 0 && volumeOptions[index].is_default) {
      newVolumes[0].is_default = true;
    }
    setVolumeOptions(newVolumes);
  }

  function updateVolumeOption(index: number, field: keyof VolumeOption, value: any) {
    const newVolumes = [...volumeOptions];
    if (field === 'is_default' && value) {
      // Only one default allowed
      newVolumes.forEach((v, i) => {
        v.is_default = i === index;
      });
    } else {
      newVolumes[index] = { ...newVolumes[index], [field]: value };
    }
    setVolumeOptions(newVolumes);
  }

  async function handleOpenCategoryConfigDialog(category: MenuCategory) {
    setSelectedCategory(category);
    await fetchCategoryConfigs(category.id);
    setShowCategoryConfigDialog(true);
  }

  function addCategoryVolume() {
    setCategoryVolumes([...categoryVolumes, {
      volume: '',
      price: 0,
      is_default: categoryVolumes.length === 0,
      sort_order: categoryVolumes.length
    }]);
  }

  function removeCategoryVolume(index: number) {
    const newVolumes = categoryVolumes.filter((_, i) => i !== index);
    if (newVolumes.length > 0 && categoryVolumes[index].is_default) {
      newVolumes[0].is_default = true;
    }
    setCategoryVolumes(newVolumes);
    
    // Remove prices for this volume from all ingredient configs
    const removedVolume = categoryVolumes[index].volume;
    if (removedVolume) {
      setCategoryConfigs(categoryConfigs.map(config => {
        if (config.volume_prices && config.volume_prices[removedVolume]) {
          const newPrices = { ...config.volume_prices };
          delete newPrices[removedVolume];
          return { ...config, volume_prices: Object.keys(newPrices).length > 0 ? newPrices : undefined };
        }
        return config;
      }));
    }
  }

  function updateCategoryVolume(index: number, field: keyof VolumeOption, value: any) {
    const newVolumes = [...categoryVolumes];
    if (field === 'is_default' && value) {
      newVolumes.forEach((v, i) => {
        v.is_default = i === index;
      });
    } else {
      newVolumes[index] = { ...newVolumes[index], [field]: value };
    }
    setCategoryVolumes(newVolumes);
  }

  async function saveCategoryVolumes() {
    if (!selectedCategory) return;
    
    try {
      const response = await fetch(`/api/menu-categories/${selectedCategory.id}/volumes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volumes: categoryVolumes })
      });

      if (!response.ok) {
        throw new Error('Failed to save category volumes');
      }
    } catch (error) {
      console.error('Error saving category volumes:', error);
    }
  }

  async function handleSaveIngredient() {
    if (!ingredientForm.name.trim()) {
      setAlertDialog({
        open: true,
        title: 'Validation Error',
        message: 'Ingredient name is required.',
        type: 'error',
      });
      return;
    }

    try {
      const url = editingIngredient
        ? `/api/custom-ingredients/${editingIngredient.id}`
        : '/api/custom-ingredients';
      const method = editingIngredient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ingredientForm.name,
          description: ingredientForm.description || null,
          price: parseFloat(ingredientForm.price) || 0,
          image: ingredientForm.image || null,
          ingredient_category: ingredientForm.ingredient_category,
          is_available: ingredientForm.is_available,
          sort_order: parseInt(ingredientForm.sort_order) || 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save ingredient');
      }

      const responseData = await response.json();
      const ingredientId = editingIngredient ? editingIngredient.id : responseData.id;
      
      // Save volume options
      if (ingredientId) {
        const volumesResponse = await fetch(`/api/custom-ingredients/${ingredientId}/volumes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volumes: volumeOptions })
        });

        if (!volumesResponse.ok) {
          const error = await volumesResponse.json();
          throw new Error(error.error || 'Failed to save volume options');
        }
      }

      setShowIngredientDialog(false);
      setEditingIngredient(null);
      setVolumeOptions([]);
      fetchData();
      setAlertDialog({
        open: true,
        title: 'Success',
        message: `Ingredient ${editingIngredient ? 'updated' : 'created'} successfully!`,
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        message: error.message || 'Failed to save ingredient',
        type: 'error',
      });
    }
  }

  async function handleDeleteIngredient(id: number) {
    setConfirmDialog({
      open: true,
      title: 'Delete Ingredient',
      description: 'Are you sure you want to delete this ingredient? This will remove it from all juices.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/custom-ingredients/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete ingredient');
          }

          fetchData();
          setAlertDialog({
            open: true,
            title: 'Success',
            message: 'Ingredient deleted successfully!',
            type: 'success',
          });
        } catch (error: any) {
          setAlertDialog({
            open: true,
            title: 'Error',
            message: error.message || 'Failed to delete ingredient',
            type: 'error',
          });
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  }

  async function handleSaveCategoryConfig() {
    if (!selectedCategory) return;

    try {
      // Save category volumes first
      await saveCategoryVolumes();

      // Prepare configs with volume_prices as JSON string
      const configsToSave = categoryConfigs.map(config => ({
        ...config,
        volume_prices: config.volume_prices ? JSON.stringify(config.volume_prices) : null
      }));

      const configRes = await fetch(`/api/menu-categories/${selectedCategory.id}/ingredient-configs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: configsToSave }),
      });

      if (!configRes.ok) {
        throw new Error('Failed to save category configuration');
      }

      const result = await configRes.json();
      // Update the count for this category
      setCategoryIngredientCounts(prev => ({
        ...prev,
        [selectedCategory.id]: categoryConfigs.length
      }));
      setShowCategoryConfigDialog(false);
      fetchData();
      setAlertDialog({
        open: true,
        title: 'Success',
        message: `Successfully saved ${categoryConfigs.length} ingredient(s) to ${selectedCategory?.name}. Customers will now see these ingredients when selecting items from this category.`,
        type: 'success',
      });
    } catch (error: any) {
      setAlertDialog({
        open: true,
        title: 'Error',
        message: error.message || 'Failed to save category configuration',
        type: 'error',
      });
    }
  }

  async function handleAddIngredientToCategory(ingredient: Ingredient) {
    if (!selectedCategory) {
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'No category selected. Please select a category first.',
        type: 'error',
      });
      return;
    }
    
    const existing = categoryConfigs.find(c => c.ingredient_id === ingredient.id);
    if (existing) {
      setAlertDialog({
        open: true,
        title: 'Already Added',
        message: `${ingredient.name} is already attached to this category.`,
        type: 'info',
      });
      return;
    }
    
    // Fetch volume options for this ingredient
    let volumes: VolumeOption[] = [];
    try {
      const volRes = await fetch(`/api/custom-ingredients/${ingredient.id}/volumes`);
      const volData = await volRes.json();
      volumes = volData.volumes || [];
      setIngredientVolumes(prev => ({
        ...prev,
        [ingredient.id]: volumes
      }));
    } catch (error) {
      console.error('Error fetching volumes:', error);
    }
    
    // Initialize volume_prices for this ingredient based on category volumes
    const initialVolumePrices: Record<string, number> = {};
    categoryVolumes.forEach(vol => {
      initialVolumePrices[vol.volume] = ingredient.price; // Use ingredient base price as default
    });

    // Add ingredient with multiple selection by default (allows customers to select multiple ingredients)
    setCategoryConfigs([
      ...categoryConfigs,
      {
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        selection_type: 'multiple', // Default to multiple so customers can select many ingredients
        price_override: undefined,
        volume_prices: Object.keys(initialVolumePrices).length > 0 ? initialVolumePrices : undefined,
      },
    ]);
  }

  function handleRemoveIngredientFromCategory(ingredientId: number) {
    setCategoryConfigs(categoryConfigs.filter(c => c.ingredient_id !== ingredientId));
  }

  function handleUpdateCategoryConfig(ingredientId: number, field: 'selection_type' | 'price_override' | 'volume_prices', value: any) {
    setCategoryConfigs(
      categoryConfigs.map(c =>
        c.ingredient_id === ingredientId ? { ...c, [field]: value } : c
      )
    );
  }

  function handleUpdateIngredientVolumePrice(ingredientId: number, volume: string, price: number | undefined) {
    setCategoryConfigs(
      categoryConfigs.map(c => {
        if (c.ingredient_id === ingredientId) {
          const newPrices = { ...(c.volume_prices || {}) };
          if (price !== undefined && price !== null && !isNaN(price)) {
            newPrices[volume] = price;
          } else {
            delete newPrices[volume];
          }
          return { ...c, volume_prices: Object.keys(newPrices).length > 0 ? newPrices : undefined };
        }
        return c;
      })
    );
  }

  async function handleDragEnd(event: DragEndEvent, category: 'boosters' | 'fruits' | 'toppings') {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const categoryIngredients = ingredients
      .filter(i => i.ingredient_category === category)
      .sort((a, b) => a.sort_order - b.sort_order);

    const oldIndex = categoryIngredients.findIndex(i => i.id === active.id);
    const newIndex = categoryIngredients.findIndex(i => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedIngredients = arrayMove(categoryIngredients, oldIndex, newIndex);

    // Update sort_order for all ingredients in this category
    setIsUpdatingOrder(true);
    try {
      const updatePromises = reorderedIngredients.map((ingredient, index) => {
        return fetch(`/api/custom-ingredients/${ingredient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ingredient.name,
            description: ingredient.description || null,
            price: ingredient.price,
            image: ingredient.image || null,
            ingredient_category: ingredient.ingredient_category,
            is_available: ingredient.is_available,
            sort_order: index,
          }),
        });
      });

      await Promise.all(updatePromises);
      
      // Update local state
      const updatedIngredients = ingredients.map(ing => {
        const reordered = reorderedIngredients.find(r => r.id === ing.id);
        if (reordered) {
          return { ...ing, sort_order: reorderedIngredients.indexOf(reordered) };
        }
        return ing;
      });
      setIngredients(updatedIngredients);
    } catch (error: any) {
      console.error('Error updating sort order:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'Failed to update ingredient order. Please try again.',
        type: 'error',
      });
      // Refresh data to revert to server state
      fetchData();
    } finally {
      setIsUpdatingOrder(false);
    }
  }

  const filteredIngredients = ingredients
    .filter(i => i.ingredient_category === activeTab)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ingredient Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage boosters, fruits, and toppings. Attach them to menu categories and set prices.
          </p>
        </div>
        <Button 
          onClick={() => handleOpenIngredientDialog()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="fruits">Fruits</TabsTrigger>
          <TabsTrigger value="boosters">Boosters</TabsTrigger>
          <TabsTrigger value="toppings">Toppings</TabsTrigger>
        </TabsList>

        <TabsContent value="fruits">
          <Card>
            <CardHeader>
              <CardTitle>Fruits</CardTitle>
              <CardDescription>Manage fruit ingredients. Drag and drop to reorder.</CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'fruits')}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No fruits found. Click "Add Ingredient" button above to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <SortableContext
                        items={filteredIngredients.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredIngredients.map((ingredient) => (
                          <SortableRow
                            key={ingredient.id}
                            ingredient={ingredient}
                            onEdit={handleOpenIngredientDialog}
                            onDelete={handleDeleteIngredient}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boosters">
          <Card>
            <CardHeader>
              <CardTitle>Boosters</CardTitle>
              <CardDescription>Manage booster ingredients. Drag and drop to reorder.</CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'boosters')}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No boosters found. Click "Add Ingredient" button above to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <SortableContext
                        items={filteredIngredients.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredIngredients.map((ingredient) => (
                          <SortableRow
                            key={ingredient.id}
                            ingredient={ingredient}
                            onEdit={handleOpenIngredientDialog}
                            onDelete={handleDeleteIngredient}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toppings">
          <Card>
            <CardHeader>
              <CardTitle>Toppings</CardTitle>
              <CardDescription>Manage topping ingredients. Drag and drop to reorder.</CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, 'toppings')}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No toppings found. Click "Add Ingredient" button above to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <SortableContext
                        items={filteredIngredients.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredIngredients.map((ingredient) => (
                          <SortableRow
                            key={ingredient.id}
                            ingredient={ingredient}
                            onEdit={handleOpenIngredientDialog}
                            onDelete={handleDeleteIngredient}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Category Configurations</CardTitle>
          <CardDescription>Attach ingredients to menu categories. All items in a category will have access to these ingredients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Attached Ingredients</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                menuCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {categoryIngredientCounts[category.id] || 0} ingredient{(categoryIngredientCounts[category.id] || 0) !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCategoryConfigDialog(category)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ingredient Dialog */}
      <Dialog open={showIngredientDialog} onOpenChange={setShowIngredientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
            </DialogTitle>
            <DialogDescription>
              {editingIngredient
                ? 'Update ingredient details'
                : 'Create a new ingredient'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={ingredientForm.name}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, name: e.target.value })
                }
                placeholder="e.g., Strawberry, Protein Powder, Chia Seeds"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ingredientForm.description}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Base Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={ingredientForm.price}
                  onChange={(e) =>
                    setIngredientForm({ ...ingredientForm, price: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Ingredient Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={ingredientForm.ingredient_category}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      ingredient_category: e.target.value as any,
                    })
                  }
                >
                  <option value="fruits">Fruits</option>
                  <option value="boosters">Boosters</option>
                  <option value="toppings">Toppings</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  You can change this anytime. This only affects how ingredients are grouped in the admin panel. You can still attach any ingredient to any menu category.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={ingredientForm.sort_order}
                  onChange={(e) =>
                    setIngredientForm({ ...ingredientForm, sort_order: e.target.value })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first. Controls display order in customer selection.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={ingredientForm.is_available}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      is_available: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_available">Available</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={ingredientForm.image}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, image: e.target.value })
                }
                placeholder="Image URL or use upload below"
              />
              <ImageUpload
                value={ingredientForm.image}
                onChange={(url) =>
                  setIngredientForm({ ...ingredientForm, image: url })
                }
                folder="ingredients"
              />
            </div>

            {/* Volume/Weight Options */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label>Volume/Weight Options</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Define volume or weight options (e.g., 100g, 250g, 1kg, 0.5L). Customers can choose from these when selecting this ingredient.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addVolumeOption}
                  variant="outline"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Volume
                </Button>
              </div>
              {volumeOptions.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground border rounded-md">
                  <p>No volume options defined.</p>
                  <p className="text-xs mt-1">Click "Add Volume" to create options like "100g", "250g", "1kg", etc.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {volumeOptions.map((vol, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 p-3 border rounded-lg bg-gray-50">
                      <div className="col-span-4">
                        <Label htmlFor={`vol-${index}`} className="text-xs">Volume/Weight *</Label>
                        <Input
                          id={`vol-${index}`}
                          value={vol.volume}
                          onChange={(e) => updateVolumeOption(index, 'volume', e.target.value)}
                          placeholder="e.g., 100g, 250g, 1kg"
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`vol-price-${index}`} className="text-xs">Price ($) *</Label>
                        <Input
                          id={`vol-price-${index}`}
                          type="number"
                          step="0.01"
                          value={vol.price}
                          onChange={(e) => updateVolumeOption(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`vol-sort-${index}`} className="text-xs">Sort Order</Label>
                        <Input
                          id={`vol-sort-${index}`}
                          type="number"
                          value={vol.sort_order}
                          onChange={(e) => updateVolumeOption(index, 'sort_order', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                      <div className="col-span-2 flex items-end">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`vol-default-${index}`}
                            checked={vol.is_default}
                            onChange={(e) => updateVolumeOption(index, 'is_default', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`vol-default-${index}`} className="text-xs cursor-pointer">
                            Default
                          </Label>
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button
                          type="button"
                          onClick={() => removeVolumeOption(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIngredientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIngredient}>
              {editingIngredient ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Configuration Dialog */}
      <Dialog open={showCategoryConfigDialog} onOpenChange={setShowCategoryConfigDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Ingredients for {selectedCategory?.name}</DialogTitle>
            <DialogDescription>
              Attach ingredients to this category and configure their settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Available Ingredients</Label>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    You can add multiple ingredients. Click "Add" for each one you want to include.
                  </p>
                  {ingredients.filter(
                    (ing) => !categoryConfigs.find((c) => c.ingredient_id === ing.id)
                  ).length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const availableIngredients = ingredients.filter(
                          (ing) => !categoryConfigs.find((c) => c.ingredient_id === ing.id)
                        );
                        const newConfigs = availableIngredients.map(ing => {
                          // Initialize volume_prices for each ingredient
                          const initialVolumePrices: Record<string, number> = {};
                          categoryVolumes.forEach(vol => {
                            initialVolumePrices[vol.volume] = ing.price; // Use ingredient base price as default
                          });
                          
                          return {
                            category_id: selectedCategory!.id,
                            category_name: selectedCategory!.name,
                            ingredient_id: ing.id,
                            ingredient_name: ing.name,
                            selection_type: 'multiple' as 'single' | 'multiple',
                            price_override: undefined,
                            volume_prices: Object.keys(initialVolumePrices).length > 0 ? initialVolumePrices : undefined,
                          };
                        });
                        setCategoryConfigs([...categoryConfigs, ...newConfigs]);
                      }}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add All Available
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
                {ingredients
                  .filter(
                    (ing) =>
                      !categoryConfigs.find((c) => c.ingredient_id === ing.id)
                  )
                  .sort((a, b) => {
                    // Sort by category first, then by name
                    if (a.ingredient_category !== b.ingredient_category) {
                      return a.ingredient_category.localeCompare(b.ingredient_category);
                    }
                    return a.name.localeCompare(b.name);
                  })
                  .map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded"
                    >
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({ingredient.ingredient_category}) - ${ingredient.price.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('Adding ingredient:', ingredient);
                          handleAddIngredientToCategory(ingredient);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        title={`Add ${ingredient.name} to ${selectedCategory?.name}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                {ingredients.filter(
                  (ing) => !categoryConfigs.find((c) => c.ingredient_id === ing.id)
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All ingredients are already attached
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Attached Ingredients ({categoryConfigs.length})</Label>
                <p className="text-xs text-muted-foreground">
                  All ingredients listed here will be available when customers select items from this category
                </p>
              </div>
              <div className="mt-2 space-y-4">
                {categoryConfigs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No ingredients attached. Add ingredients from the list above.
                  </p>
                ) : (
                  categoryConfigs.map((config) => {
                    const ingredient = ingredients.find((i) => i.id === config.ingredient_id);
                    return (
                      <Card key={config.ingredient_id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{config.ingredient_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Category: {ingredient?.ingredient_category}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveIngredientFromCategory(config.ingredient_id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Selection Type</Label>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  value={config.selection_type}
                                  onChange={(e) =>
                                    handleUpdateCategoryConfig(
                                      config.ingredient_id,
                                      'selection_type',
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="multiple">Multiple Choice (Recommended)</option>
                                  <option value="single">Single Choice (Choose One)</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {config.selection_type === 'multiple' 
                                    ? 'Customers can select multiple ingredients from this category'
                                    : 'Customers can only select one ingredient from this category'}
                                </p>
                              </div>
                              <div>
                                <Label>Base Price Override ($) - Optional</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={config.price_override || ''}
                                  onChange={(e) =>
                                    handleUpdateCategoryConfig(
                                      config.ingredient_id,
                                      'price_override',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder={`Default: $${ingredient?.price.toFixed(2) || '0.00'}`}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Base price if volume prices are not set
                                </p>
                              </div>
                            </div>
                            
                            {/* Price per Volume */}
                            {categoryVolumes.length > 0 && (
                              <div>
                                <Label>Price per Volume/Weight</Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Set the price for this ingredient for each category volume option:
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  {categoryVolumes.map((vol) => {
                                    const currentPrice = config.volume_prices?.[vol.volume];
                                    return (
                                      <div key={vol.volume} className="flex items-center gap-2">
                                        <Label className="w-20 text-sm">{vol.volume}:</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={currentPrice !== undefined ? currentPrice : ''}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            handleUpdateIngredientVolumePrice(
                                              config.ingredient_id,
                                              vol.volume,
                                              value && value !== '' ? parseFloat(value) : undefined
                                            );
                                          }}
                                          placeholder={`$${ingredient?.price.toFixed(2) || '0.00'}`}
                                          className="flex-1"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  If a price is not set for a volume, the base price override (or ingredient base price) will be used.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategoryConfig}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />

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

