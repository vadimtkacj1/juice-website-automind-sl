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
  const { customIngredients, volumeOptions, additionalItems } = useProductModalData(item, isOpen);
  
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedIngredientsByCategory, setSelectedIngredientsByCategory] = useState<Map<string, number>>(new Map());
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<Set<number>>(new Set());

  // Reset modal state when item changes
  useEffect(() => {
    if (item) {
      // Reset all selections when a new item is selected
      setSelectedVolume(null);
      setSelectedIngredients(new Set());
      setSelectedIngredientsByCategory(new Map());
      setSelectedAdditionalItems(new Set());
    }
  }, [item?.id]);

  // Set default volume when volume options are loaded
  useEffect(() => {
    if (volumeOptions.length > 0 && !selectedVolume) {
      const defaultVol = volumeOptions.find(v => v.is_default);
      if (defaultVol) {
        setSelectedVolume(defaultVol.volume);
      } else {
        setSelectedVolume(volumeOptions[0].volume);
      }
    } else if (volumeOptions.length === 0) {
      // No volume options available
      setSelectedVolume(null);
    }
  }, [volumeOptions, selectedVolume]);

  const handleIngredientToggle = useCallback((ingredientId: number, selectionType: 'single' | 'multiple' = 'multiple', category?: string) => {
    const ingredient = customIngredients.find(i => i.id === ingredientId);
    const ingredientCategory = category || ingredient?.ingredient_category || 'fruits';
    
    if (selectionType === 'single') {
      setSelectedIngredientsByCategory(prev => {
        const newMap = new Map(prev);
        const currentSelected = newMap.get(ingredientCategory);
        
        setSelectedIngredients(prevSet => {
          const newSet = new Set(prevSet);
          if (currentSelected) {
            newSet.delete(currentSelected);
          }
          if (currentSelected !== ingredientId) {
            newSet.add(ingredientId);
          }
          return newSet;
        });
        
        if (currentSelected === ingredientId) {
          newMap.delete(ingredientCategory);
          setSelectedIngredients(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(ingredientId);
            return newSet;
          });
        } else {
          newMap.set(ingredientCategory, ingredientId);
        }
        return newMap;
      });
    } else {
      setSelectedIngredients(prev => {
        const newSet = new Set(prev);
        const wasSelected = newSet.has(ingredientId);
        if (wasSelected) {
          newSet.delete(ingredientId);
        } else {
          newSet.add(ingredientId);
        }
        return newSet;
      });
    }
  }, [customIngredients]);

  const handleAdditionalItemToggle = useCallback((id: number) => {
    setSelectedAdditionalItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Calculated values
  const currentBasePrice = useMemo(() => {
    if (!item) return 0;
    
    // Ensure we have numbers
    const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    
    let basePrice = numPrice;
    if (selectedVolume && volumeOptions.length > 0) {
      const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
      if (selectedVolOption) {
        basePrice = selectedVolOption.price || 0;
      }
    }
    return basePrice;
  }, [item, selectedVolume, volumeOptions]);

  const discountPercent = useMemo(() => {
    if (!item) return 0;
    return typeof item.discount_percent === 'string' 
      ? parseFloat(item.discount_percent) 
      : (item.discount_percent || 0);
  }, [item]);

  const currentDiscountedPrice = useMemo(() => {
    return discountPercent > 0 
      ? currentBasePrice * (1 - discountPercent / 100) 
      : currentBasePrice;
  }, [currentBasePrice, discountPercent]);

  const totalPrice = useMemo(() => {
    const ingredientsPrice = Array.from(selectedIngredients).reduce((total, id) => {
      const ingredient = customIngredients.find(i => i.id === id);
      const price = ingredient?.price_override !== undefined && ingredient.price_override !== null
        ? ingredient.price_override
        : (ingredient?.price || 0);
      return total + price;
    }, 0);

    const additionalItemsPrice = Array.from(selectedAdditionalItems).reduce((total, id) => {
      const additionalItem = additionalItems.find(i => i.id === id);
      return total + (additionalItem?.price || 0);
    }, 0);

    return currentDiscountedPrice + ingredientsPrice + additionalItemsPrice;
  }, [currentDiscountedPrice, selectedIngredients, customIngredients, selectedAdditionalItems, additionalItems]);

  const handleAddToCartClick = useCallback(() => {
    if (!item) return;
    
    // Ingredients
    const ingredientsArray = Array.from(selectedIngredients).map(id => {
      const ingredient = customIngredients.find(i => i.id === id);
      const price = ingredient?.price_override !== undefined && ingredient.price_override !== null
        ? ingredient.price_override
        : (ingredient?.price || 0);
      return {
        id,
        name: ingredient?.name || '',
        price
      };
    });

    // Additional items
    const additionalItemsArray = Array.from(selectedAdditionalItems).map(id => {
      const additionalItem = additionalItems.find(i => i.id === id);
      return {
        id,
        name: additionalItem?.name || '',
        price: additionalItem?.price || 0
      };
    });

    const cartItem = {
      id: item.id,
      name: item.name,
      price: currentDiscountedPrice, // Using the discounted base price logic
      image: item.image,
      discount_percent: item.discount_percent,
      volume: selectedVolume || undefined,
      customIngredients: ingredientsArray.length > 0 ? ingredientsArray : undefined,
      additionalItems: additionalItemsArray.length > 0 ? additionalItemsArray : undefined
    };
    
    onClose();
    
    setTimeout(() => {
      onAddToCart(cartItem);
    }, 300);
  }, [item, selectedIngredients, customIngredients, selectedAdditionalItems, additionalItems, currentDiscountedPrice, selectedVolume, onClose, onAddToCart]);

  return {
    customIngredients,
    volumeOptions,
    additionalItems,
    selectedVolume,
    setSelectedVolume,
    selectedIngredients,
    selectedIngredientsByCategory,
    selectedAdditionalItems,
    handleIngredientToggle,
    handleAdditionalItemToggle,
    totalPrice,
    handleAddToCartClick,
    currentBasePrice,
    currentDiscountedPrice,
    discountPercent
  };
}
