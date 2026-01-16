import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProductModalData } from './useProductModalData';
import { ProductModalItem } from './types';
import { CartCustomIngredient } from '@/lib/cart-context';

export function useProductModalLogic(
  item: ProductModalItem | null, 
  isOpen: boolean,
  onAddToCart: (item: ProductModalItem & { volume?: string, customIngredients?: CartCustomIngredient[] }) => void,
  onClose: () => void
) {
  // Get data from your custom hook
  const { customIngredients, volumeOptions, additionalItems } = useProductModalData(item, isOpen);
  
  // States for selections
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedSingleByGroup, setSelectedSingleByGroup] = useState<Map<string, number>>(new Map());
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<Set<number>>(new Set());

  // Define isLoading: it is loading if the modal is open but volume options haven't loaded yet
  // Or if the item itself is null
  const isLoading = isOpen && item && volumeOptions.length === 0;

  // Reset modal state on item change
  useEffect(() => {
    if (item?.id) {
      setSelectedVolume(null);
      setSelectedIngredients(new Set());
      setSelectedSingleByGroup(new Map());
      setSelectedAdditionalItems(new Set());
    }
  }, [item?.id]);

  // Handle default volume selection
  useEffect(() => {
    if (volumeOptions.length > 0 && !selectedVolume) {
      const defaultVol = volumeOptions.find(v => v.is_default) || volumeOptions[0];
      setSelectedVolume(defaultVol.volume);
    }
  }, [volumeOptions, selectedVolume]);

  const handleIngredientToggle = useCallback((ingredientId: number, selectionType: 'single' | 'multiple' = 'multiple', category?: string, groupKey?: string) => {
    const ingredient = customIngredients.find(i => i.id === ingredientId);
    const selectionGroup = groupKey || ingredient?.ingredient_group || ingredient?.ingredient_category || 'default';
    
    if (selectionType === 'single') {
      setSelectedSingleByGroup(prevMap => {
        const newMap = new Map(prevMap);
        const currentSelected = newMap.get(selectionGroup);

        setSelectedIngredients(prevSet => {
          const newSet = new Set(prevSet);
          if (currentSelected && currentSelected !== ingredientId) newSet.delete(currentSelected);
          
          if (currentSelected === ingredientId) {
            newSet.delete(ingredientId);
            newMap.delete(selectionGroup);
          } else {
            newSet.add(ingredientId);
            newMap.set(selectionGroup, ingredientId);
          }
          return newSet;
        });
        return newMap;
      });
    } else {
      setSelectedIngredients(prev => {
        const newSet = new Set(prev);
        newSet.has(ingredientId) ? newSet.delete(ingredientId) : newSet.add(ingredientId);
        return newSet;
      });
    }
  }, [customIngredients]);

  const handleAdditionalItemToggle = useCallback((id: number) => {
    setSelectedAdditionalItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

  // Price calculations with string-to-number safety
  const currentBasePrice = useMemo(() => {
    if (!item) return 0;
    const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    
    if (selectedVolume && volumeOptions.length > 0) {
      const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
      if (selectedVolOption) return Number(selectedVolOption.price) || 0;
    }
    return numPrice;
  }, [item, selectedVolume, volumeOptions]);

  const discountPercent = useMemo(() => {
    if (!item) return 0;
    return typeof item.discount_percent === 'string' ? parseFloat(item.discount_percent) : (item.discount_percent || 0);
  }, [item]);

  const currentDiscountedPrice = useMemo(() => {
    return discountPercent > 0 ? currentBasePrice * (1 - discountPercent / 100) : currentBasePrice;
  }, [currentBasePrice, discountPercent]);

  const totalPrice = useMemo(() => {
    const ingredientsPrice = Array.from(selectedIngredients).reduce((total, id) => {
      const ing = customIngredients.find(i => i.id === id);
      const price = ing?.price_override !== undefined && ing.price_override !== null ? Number(ing.price_override) : Number(ing?.price || 0);
      return total + price;
    }, 0);

    const additionalPrice = Array.from(selectedAdditionalItems).reduce((total, id) => {
      const add = additionalItems.find(i => i.id === id);
      return total + (Number(add?.price) || 0);
    }, 0);

    return currentDiscountedPrice + ingredientsPrice + additionalPrice;
  }, [currentDiscountedPrice, selectedIngredients, customIngredients, selectedAdditionalItems, additionalItems]);

  // Calculate missing required groups in real-time
  const missingRequiredGroups = useMemo(() => {
    const missing: string[] = [];
    const grouped = customIngredients.reduce((acc, ing) => {
      const g = ing.ingredient_group || ing.ingredient_category || 'extra';
      if (!acc[g]) acc[g] = [];
      acc[g].push(ing);
      return acc;
    }, {} as Record<string, typeof customIngredients>);

    Object.entries(grouped).forEach(([groupName, ings]) => {
      if (ings.some(i => i.is_required) && !ings.some(i => selectedIngredients.has(i.id))) {
        missing.push(groupName);
      }
    });

    return missing;
  }, [customIngredients, selectedIngredients]);

  const canAddToCart = missingRequiredGroups.length === 0;

  const handleAddToCartClick = useCallback(() => {
    if (!item || !canAddToCart) return;

    // Add to cart immediately - no delay needed
    onAddToCart({
      ...item,
      price: currentDiscountedPrice,
      volume: selectedVolume || undefined,
      customIngredients: Array.from(selectedIngredients).map(id => {
        const ing = customIngredients.find(i => i.id === id);
        return { id, name: ing?.name || '', price: Number(ing?.price_override ?? ing?.price ?? 0) };
      })
    });

    // Close modal after adding to cart
    onClose();
  }, [item, canAddToCart, selectedIngredients, customIngredients, currentDiscountedPrice, selectedVolume, onClose, onAddToCart]);

  return {
    customIngredients,
    volumeOptions,
    additionalItems,
    selectedVolume,
    setSelectedVolume,
    selectedIngredients,
    selectedAdditionalItems,
    handleIngredientToggle,
    handleAdditionalItemToggle,
    totalPrice,
    handleAddToCartClick,
    currentBasePrice,
    currentDiscountedPrice,
    discountPercent,
    isLoading,
    missingRequiredGroups,
    canAddToCart
  };
}