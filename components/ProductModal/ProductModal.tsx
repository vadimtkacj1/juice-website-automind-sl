'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from '../ProductModal.module.css';
import { CartAddon, CartCustomIngredient } from '@/lib/cart-context';
import ProductModalHeader from './ProductModalHeader';
import ProductModalImage from './ProductModalImage';
import ProductModalFeatures from './ProductModalFeatures';
import VolumeSelector from './VolumeSelector';
import AddonsSection from './AddonsSection';
import IngredientsSection from './IngredientsSection';
import ProductModalFooter from './ProductModalFooter';
import { useProductModalData } from './useProductModalData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { translateToHebrew } from '@/lib/translations';

interface ProductModalItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  volume?: string;
  image?: string;
  discount_percent: number;
  category_id?: number;
  [key: string]: any;
}

interface ProductModalProps {
  item: ProductModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ProductModalItem & { volume?: string, addons?: CartAddon[], customIngredients?: CartCustomIngredient[] }) => void;
}

export default function ProductModal({ item, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const { addons, customIngredients, volumeOptions } = useProductModalData(item, isOpen);
  
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Map<number, number>>(new Map());
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedIngredientsByCategory, setSelectedIngredientsByCategory] = useState<Map<string, number>>(new Map());
  const [showIngredientPrompt, setShowIngredientPrompt] = useState(false);
  const [pendingAddToCart, setPendingAddToCart] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  // Debug: Log when ingredients change
  useEffect(() => {
    console.log('Custom ingredients loaded:', customIngredients);
    console.log('Selected ingredients:', Array.from(selectedIngredients));
  }, [customIngredients, selectedIngredients]);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Show ingredient prompt when modal opens and ingredients are available
  useEffect(() => {
    if (isOpen && customIngredients.length > 0 && selectedIngredients.size === 0 && !hasShownPrompt) {
      // Only show prompt if there are ingredients, none are selected yet, and we haven't shown it already
      // Add a small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        setShowIngredientPrompt(true);
        setHasShownPrompt(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, customIngredients.length, selectedIngredients.size, hasShownPrompt]);

  // Reset selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAddons(new Map());
      setSelectedIngredients(new Set());
      setSelectedIngredientsByCategory(new Map());
      setSelectedVolume(null);
      setShowIngredientPrompt(false);
      setPendingAddToCart(false);
      setHasShownPrompt(false);
    }
  }, [isOpen]);

  const handleAddonQuantity = (addonId: number, delta: number) => {
    setSelectedAddons(prev => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(addonId) || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        newMap.delete(addonId);
      } else {
        newMap.set(addonId, newQty);
      }
      return newMap;
    });
  };

  const handleIngredientToggle = (ingredientId: number, selectionType: 'single' | 'multiple' = 'multiple', category?: string) => {
    console.log('handleIngredientToggle called:', { ingredientId, selectionType, category });
    const ingredient = customIngredients.find(i => i.id === ingredientId);
    console.log('Found ingredient:', ingredient);
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
          console.log('Updated selectedIngredients (single):', Array.from(newSet));
          return newSet;
        });
        
        if (currentSelected === ingredientId) {
          newMap.delete(ingredientCategory);
          setSelectedIngredients(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(ingredientId);
            console.log('Removed ingredient (single):', Array.from(newSet));
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
          console.log('Removed ingredient (multiple):', ingredientId, 'New set:', Array.from(newSet));
        } else {
          newSet.add(ingredientId);
          console.log('Added ingredient (multiple):', ingredientId, 'New set:', Array.from(newSet));
        }
        return newSet;
      });
    }
  };

  const handleAddToCartClick = () => {
    // Check if there are unselected ingredients configured for this category
    const unselectedIngredients = customIngredients.filter(
      ing => !selectedIngredients.has(ing.id)
    );

    // If there are unselected ingredients and prompt is not already showing, show it
    if (unselectedIngredients.length > 0 && !showIngredientPrompt) {
      setPendingAddToCart(true);
      setShowIngredientPrompt(true);
      return;
    }

    // Otherwise, proceed directly to add to cart
    proceedWithAddToCart();
  };

  const proceedWithAddToCart = (additionalIngredientIds?: number[]) => {
    if (!item) return;
    
    const addonsArray: CartAddon[] = Array.from(selectedAddons.entries()).map(([id, quantity]) => {
      const addon = addons.find(a => a.id === id);
      return {
        id,
        name: addon?.name || '',
        price: addon?.price || 0,
        quantity
      };
    });

    // Combine selected ingredients with any additional ones
    const allIngredientIds = new Set(selectedIngredients);
    if (additionalIngredientIds && additionalIngredientIds.length > 0) {
      // Merge additional ingredient IDs with currently selected ones
      additionalIngredientIds.forEach(id => allIngredientIds.add(id));
    }

    const ingredientsArray = Array.from(allIngredientIds).map(id => {
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

    // Calculate the correct base price based on selected volume
    let basePrice = item.price;
    if (selectedVolume && volumeOptions.length > 0) {
      const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
      if (selectedVolOption) {
        basePrice = selectedVolOption.price;
      }
    }
    
    // Apply discount if any
    const finalPrice = item.discount_percent > 0 
      ? basePrice * (1 - item.discount_percent / 100) 
      : basePrice;

    console.log('proceedWithAddToCart - selectedIngredients:', Array.from(selectedIngredients));
    console.log('proceedWithAddToCart - customIngredients available:', customIngredients);
    console.log('proceedWithAddToCart - allIngredientIds:', Array.from(allIngredientIds));
    console.log('proceedWithAddToCart - ingredientsArray:', ingredientsArray);
    
    const cartItem = {
      id: item.id,
      name: item.name,
      price: finalPrice,
      image: item.image,
      discount_percent: item.discount_percent,
      volume: selectedVolume || undefined,
      addons: addonsArray.length > 0 ? addonsArray : undefined,
      customIngredients: ingredientsArray.length > 0 ? ingredientsArray : undefined
    };
    
    console.log('Adding to cart:', cartItem);
    console.log('Cart item customIngredients:', cartItem.customIngredients);
    console.log('Cart item has ingredients?', cartItem.customIngredients && cartItem.customIngredients.length > 0);
    
    onAddToCart(cartItem);
    onClose();
  };

  const handleAddIngredients = () => {
    // Get all unselected ingredients
    const unselectedIngredients = customIngredients.filter(
      ing => !selectedIngredients.has(ing.id)
    );
    
    console.log('handleAddIngredients - unselectedIngredients:', unselectedIngredients);
    console.log('handleAddIngredients - current selectedIngredients:', Array.from(selectedIngredients));
    
    // Update selected ingredients state for UI consistency
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      unselectedIngredients.forEach(ing => {
        newSet.add(ing.id);
      });
      console.log('handleAddIngredients - updated selectedIngredients:', Array.from(newSet));
      return newSet;
    });

    // Also update selectedIngredientsByCategory for single selection types
    setSelectedIngredientsByCategory(prev => {
      const newMap = new Map(prev);
      unselectedIngredients.forEach(ing => {
        if (ing.selection_type === 'single') {
          const category = ing.ingredient_category || 'fruits';
          newMap.set(category, ing.id);
        }
      });
      return newMap;
    });
    
    setShowIngredientPrompt(false);
    setPendingAddToCart(false);
    
    // Proceed with add to cart, passing the additional ingredient IDs
    // We combine current selectedIngredients with the new ones to ensure all are included
    const additionalIngredientIds = unselectedIngredients.map(ing => ing.id);
    const allIngredientIds = new Set([...Array.from(selectedIngredients), ...additionalIngredientIds]);
    console.log('handleAddIngredients - allIngredientIds to add:', Array.from(allIngredientIds));
    proceedWithAddToCart(Array.from(allIngredientIds));
  };

  const handleSkipIngredients = () => {
    setShowIngredientPrompt(false);
    setPendingAddToCart(false);
    proceedWithAddToCart();
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    
    let basePrice = item.price;
    if (selectedVolume && volumeOptions.length > 0) {
      const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
      if (selectedVolOption) {
        basePrice = selectedVolOption.price;
      }
    }
    
    const discountedPrice = item.discount_percent > 0 
      ? basePrice * (1 - item.discount_percent / 100) 
      : basePrice;
    
    const addonsPrice = Array.from(selectedAddons.entries()).reduce((total, [id, quantity]) => {
      const addon = addons.find(a => a.id === id);
      return total + (addon?.price || 0) * quantity;
    }, 0);

    const ingredientsPrice = Array.from(selectedIngredients).reduce((total, id) => {
      const ingredient = customIngredients.find(i => i.id === id);
      const price = ingredient?.price_override !== undefined && ingredient.price_override !== null
        ? ingredient.price_override
        : (ingredient?.price || 0);
      return total + price;
    }, 0);

    return discountedPrice + addonsPrice + ingredientsPrice;
  };

  if (!isOpen || !item) {
    return null;
  }

  // Calculate prices for header
  let basePrice = item.price;
  if (selectedVolume && volumeOptions.length > 0) {
    const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
    if (selectedVolOption) {
      basePrice = selectedVolOption.price;
    }
  }
  const discountedPrice = item.discount_percent > 0 
    ? basePrice * (1 - item.discount_percent / 100) 
    : basePrice;

  return (
    <>
      {/* Backdrop */}
      <div className={styles['modal-backdrop']} onClick={onClose} />

      {/* Modal */}
      <div className={styles['product-modal']}>
        <div className={styles['modal-container']}>
          {/* Close Button */}
          <button className={styles['modal-close']} onClick={onClose}>
            <X size={24} />
          </button>

          {/* Image */}
          <ProductModalImage image={item.image} name={item.name} />

          {/* Content */}
          <div className={styles['modal-content']}>
            {/* Header */}
            <ProductModalHeader
              name={item.name}
              selectedVolume={selectedVolume}
              basePrice={basePrice}
              discountedPrice={discountedPrice}
              discountPercent={item.discount_percent}
            />

            {/* Description */}
            <div className={styles['modal-description']}>
              <p>
                {translateToHebrew(item.description) || 
                  translateToHebrew('Experience the perfect blend of quality and taste. Made with care using only the finest natural ingredients to bring you an exceptional experience.')}
              </p>
            </div>

            {/* Features */}
            <ProductModalFeatures />

            {/* Volume Selection */}
            <VolumeSelector
              volumeOptions={volumeOptions}
              selectedVolume={selectedVolume}
              onVolumeChange={setSelectedVolume}
              discountPercent={item.discount_percent}
            />

            {/* Addons */}
            <AddonsSection
              addons={addons}
              selectedAddons={selectedAddons}
              onQuantityChange={handleAddonQuantity}
            />

            {/* Custom Ingredients */}
            <IngredientsSection
              ingredients={customIngredients}
              selectedIngredients={selectedIngredients}
              onIngredientToggle={handleIngredientToggle}
            />

            {/* Footer */}
            <ProductModalFooter
              totalPrice={calculateTotalPrice()}
              onAddToCart={handleAddToCartClick}
            />
          </div>
        </div>
      </div>

      {/* Ingredient Prompt Dialog */}
      <Dialog 
        open={showIngredientPrompt} 
        onOpenChange={(open) => {
          setShowIngredientPrompt(open);
          if (!open) {
            setPendingAddToCart(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{translateToHebrew('Add Ingredients?')}</DialogTitle>
            <DialogDescription>
              {translateToHebrew('Would you like to add these ingredients to this juice?')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {customIngredients
                .filter(ing => !selectedIngredients.has(ing.id))
                .map(ingredient => {
                  const price = ingredient.price_override !== undefined && ingredient.price_override !== null
                    ? ingredient.price_override
                    : ingredient.price;
                  return (
                    <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{translateToHebrew(ingredient.name)}</span>
                      {price > 0 && (
                        <span className="text-sm text-gray-600">+₪{price.toFixed(0)}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleSkipIngredients}
              className="w-full sm:w-auto"
            >
              {translateToHebrew('No, Skip')}
            </Button>
            <Button
              onClick={handleAddIngredients}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
            >
              {translateToHebrew('Yes, Add All')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

