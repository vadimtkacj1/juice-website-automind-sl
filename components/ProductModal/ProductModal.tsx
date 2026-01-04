'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../ProductModal.module.css';
import { CartAdditionalItem, CartCustomIngredient } from '@/lib/cart-context';
import ProductModalHeader from './ProductModalHeader';
import ProductModalImage from './ProductModalImage';
import ProductModalFeatures from './ProductModalFeatures';
import VolumeSelector from './VolumeSelector';
import IngredientsSection from './IngredientsSection';
import AdditionalItemsSection from './AdditionalItemsSection';
import ProductModalFooter from './ProductModalFooter';
import { useProductModalData } from './useProductModalData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { translateToHebrew } from '@/lib/translations';

interface ProductModalItem {
  id: number;
  name: string;
  description?: string;
  price: number | string; // Can be string from MySQL DECIMAL
  volume?: string;
  image?: string;
  discount_percent: number | string; // Can be string from MySQL DECIMAL
  category_id?: number;
  [key: string]: any;
}

interface ProductModalProps {
  item: ProductModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ProductModalItem & { volume?: string, customIngredients?: CartCustomIngredient[] }) => void;
}

interface OrderPrompt {
  id: number;
  title: string;
  description?: string;
  prompt_type: string;
  is_active: boolean;
  sort_order: number;
  show_on_all_products: boolean;
  products?: OrderPromptProduct[];
}

interface OrderPromptProduct {
  id: number;
  prompt_id: number;
  menu_item_id?: number;
  product_name?: string;
  product_price: number;
  volume_option?: string;
  sort_order: number;
}

export default function ProductModal({ item, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const { customIngredients, volumeOptions, additionalItems } = useProductModalData(item, isOpen);
  
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedIngredientsByCategory, setSelectedIngredientsByCategory] = useState<Map<string, number>>(new Map());
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<Set<number>>(new Set());
  const [orderPrompts, setOrderPrompts] = useState<OrderPrompt[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showOrderPrompt, setShowOrderPrompt] = useState(false);
  const [selectedPromptProducts, setSelectedPromptProducts] = useState<Set<number>>(new Set());

  // Reset modal state when item changes
  useEffect(() => {
    if (item) {
      // Reset all selections when a new item is selected
      setSelectedVolume(null);
      setSelectedIngredients(new Set());
      setSelectedIngredientsByCategory(new Map());
      setSelectedAdditionalItems(new Set());
      setShowOrderPrompt(false);
      setSelectedPromptProducts(new Set());
      setCurrentPromptIndex(0);
    }
  }, [item?.id]); // Reset when item ID changes

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
    if (!isOpen) return;
    
    // Store current scroll position BEFORE any changes
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    
    // Prevent body scroll - use simpler approach that doesn't affect viewport
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyLeft = document.body.style.left;
    const originalBodyRight = document.body.style.right;
    const originalBodyWidth = document.body.style.width;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    
    // Store for cleanup
    (document.body as any).__modalScrollY = scrollY;
    (document.body as any).__modalOriginalStyles = {
      bodyOverflow: originalBodyOverflow,
      htmlOverflow: originalHtmlOverflow,
      bodyPosition: originalBodyPosition,
      bodyTop: originalBodyTop,
      bodyLeft: originalBodyLeft,
      bodyRight: originalBodyRight,
      bodyWidth: originalBodyWidth,
    };
    
    return () => {
      // Restore original styles
      const stored = (document.body as any).__modalOriginalStyles;
      const scrollY = (document.body as any).__modalScrollY || 0;
      
      document.body.style.position = stored?.bodyPosition || '';
      document.body.style.top = stored?.bodyTop || '';
      document.body.style.left = stored?.bodyLeft || '';
      document.body.style.right = stored?.bodyRight || '';
      document.body.style.width = stored?.bodyWidth || '';
      document.body.style.overflow = stored?.bodyOverflow || '';
      document.documentElement.style.overflow = stored?.htmlOverflow || '';
      
      // Restore scroll position
      if (scrollY) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
      
      delete (document.body as any).__modalScrollY;
      delete (document.body as any).__modalOriginalStyles;
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


  // Fetch order prompts when modal opens
  useEffect(() => {
    if (isOpen && item) {
      fetchOrderPrompts();
    }
  }, [isOpen, item]);

  // Fetch order prompts
  const fetchOrderPrompts = async () => {
    try {
      const response = await fetch('/api/order-prompts');
      if (response.ok) {
        const data = await response.json();
        // Filter prompts that should show for this product
        const relevantPrompts = (data.prompts || []).filter((prompt: OrderPrompt) => {
          if (!prompt.is_active) return false;
          if (prompt.show_on_all_products) return true;
          // If not showing on all products, check if this product is in the prompt's products
          if (prompt.products && prompt.products.length > 0) {
            return prompt.products.some((p: OrderPromptProduct) => p.menu_item_id === item?.id);
          }
          return false;
        });
        setOrderPrompts(relevantPrompts);
      }
    } catch (error) {
      console.error('Error fetching order prompts:', error);
    }
  };

  // Reset selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAdditionalItems(new Set());
      setSelectedIngredients(new Set());
      setSelectedIngredientsByCategory(new Map());
      setSelectedVolume(null);
      setOrderPrompts([]);
      setCurrentPromptIndex(0);
      setShowOrderPrompt(false);
      setSelectedPromptProducts(new Set());
    }
  }, [isOpen]);


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
    // Ingredients are optional - allow adding to cart without selecting any
    // Users can add items directly without being forced to select ingredients
    proceedWithAddToCart();
  };

  const proceedWithAddToCart = (additionalIngredientIds?: number[]) => {
    if (!item) return;
    
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

    // Get selected additional items
    const additionalItemsArray = Array.from(selectedAdditionalItems).map(id => {
      const additionalItem = additionalItems.find(i => i.id === id);
      return {
        id,
        name: additionalItem?.name || '',
        price: additionalItem?.price || 0
      };
    });

    // Calculate the correct base price based on selected volume
    let basePrice: number | string = item.price;
    if (selectedVolume && volumeOptions.length > 0) {
      const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
      if (selectedVolOption) {
        basePrice = selectedVolOption.price;
      }
    }
    
    // Ensure we have numbers (MySQL DECIMAL often returns as strings)
    const numPrice = typeof basePrice === 'string' ? parseFloat(basePrice) : (basePrice || 0);
    const numDiscount = typeof item.discount_percent === 'string' 
      ? parseFloat(item.discount_percent) 
      : (item.discount_percent || 0);
    const finalPrice = numDiscount > 0 
      ? numPrice * (1 - numDiscount / 100) 
      : numPrice;

    console.log('proceedWithAddToCart - selectedIngredients:', Array.from(selectedIngredients));
    console.log('proceedWithAddToCart - customIngredients available:', customIngredients);
    console.log('proceedWithAddToCart - allIngredientIds:', Array.from(allIngredientIds));
    console.log('proceedWithAddToCart - ingredientsArray:', ingredientsArray);
    console.log('proceedWithAddToCart - selectedAdditionalItems:', Array.from(selectedAdditionalItems));
    console.log('proceedWithAddToCart - additionalItemsArray:', additionalItemsArray);
    
    const cartItem = {
      id: item.id,
      name: item.name,
      price: finalPrice,
      image: item.image,
      discount_percent: item.discount_percent,
      volume: selectedVolume || undefined,
      customIngredients: ingredientsArray.length > 0 ? ingredientsArray : undefined,
      additionalItems: additionalItemsArray.length > 0 ? additionalItemsArray : undefined
    };
    
    console.log('Adding to cart:', cartItem);
    console.log('Cart item customIngredients:', cartItem.customIngredients);
    console.log('Cart item has ingredients?', cartItem.customIngredients && cartItem.customIngredients.length > 0);
    
    // Close all dialogs and modals first
    setShowOrderPrompt(false);
    
    // Close modal
    onClose();
    
    // Small delay to ensure modal and dialogs are closed, then add to cart
    setTimeout(() => {
      onAddToCart(cartItem);
      // Cart will open automatically via cart context (setIsCartOpen(true))
    }, 300);
  };


  // Handle order prompt product selection
  const handleTogglePromptProduct = (productId: number) => {
    setSelectedPromptProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Handle order prompt actions
  const handleOrderPromptNext = () => {
    const currentPrompt = orderPrompts[currentPromptIndex];
    if (!currentPrompt) return;

    // Add selected products to cart
    if (selectedPromptProducts.size > 0 && currentPrompt.products) {
      currentPrompt.products
        .filter(p => selectedPromptProducts.has(p.id))
        .forEach(product => {
          const promptCartItem = {
            id: product.menu_item_id || 0,
            name: product.product_name || translateToHebrew('Additional Item'),
            price: product.product_price,
            image: undefined,
            discount_percent: 0,
            volume: product.volume_option || undefined,
          };
          onAddToCart(promptCartItem as any);
        });
    }

    // Move to next prompt or close
    if (currentPromptIndex < orderPrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setSelectedPromptProducts(new Set());
    } else {
      setShowOrderPrompt(false);
      onClose();
    }
  };

  const handleOrderPromptSkip = () => {
    // Move to next prompt or close
    if (currentPromptIndex < orderPrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setSelectedPromptProducts(new Set());
    } else {
      setShowOrderPrompt(false);
      onClose();
    }
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    
    // Ensure we have numbers (MySQL DECIMAL often returns as strings)
    const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    const numDiscount = typeof item.discount_percent === 'string' 
      ? parseFloat(item.discount_percent) 
      : (item.discount_percent || 0);
    
    let basePrice = numPrice;
    if (selectedVolume && volumeOptions.length > 0) {
      const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
      if (selectedVolOption) {
        basePrice = typeof selectedVolOption.price === 'string' 
          ? parseFloat(selectedVolOption.price) 
          : (selectedVolOption.price || 0);
      }
    }
    
    const discountedPrice = numDiscount > 0 
      ? basePrice * (1 - numDiscount / 100) 
      : basePrice;
    
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

    return discountedPrice + ingredientsPrice + additionalItemsPrice;
  };

  if (!isOpen || !item) {
    return null;
  }

  // Calculate prices for header
  // Ensure we have numbers (MySQL DECIMAL often returns as strings)
  const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
  const numDiscount = typeof item.discount_percent === 'string' 
    ? parseFloat(item.discount_percent) 
    : (item.discount_percent || 0);
  
  let basePrice = numPrice;
  if (selectedVolume && volumeOptions.length > 0) {
    const selectedVolOption = volumeOptions.find(v => v.volume === selectedVolume);
    if (selectedVolOption) {
      basePrice = typeof selectedVolOption.price === 'string' 
        ? parseFloat(selectedVolOption.price) 
        : (selectedVolOption.price || 0);
    }
  }
  const discountedPrice = numDiscount > 0 
    ? basePrice * (1 - numDiscount / 100) 
    : basePrice;

  // Render modal content
  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className={styles['modal-backdrop']} 
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className={styles['product-modal']}>
        <div className={styles['modal-container']} onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button 
            className={styles['modal-close']} 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Content - Left Side */}
          <div className={styles['modal-content']}>
            {/* Header */}
            <ProductModalHeader
              name={item.name}
              selectedVolume={selectedVolume}
              basePrice={basePrice}
              discountedPrice={discountedPrice}
              discountPercent={numDiscount}
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
              discountPercent={numDiscount}
            />

            {/* Custom Ingredients */}
            <IngredientsSection
              ingredients={customIngredients}
              selectedIngredients={selectedIngredients}
              onIngredientToggle={handleIngredientToggle}
            />

            {/* Additional Items */}
            <AdditionalItemsSection
              additionalItems={additionalItems}
              selectedItems={selectedAdditionalItems}
              onToggle={(id) => {
                setSelectedAdditionalItems(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(id)) {
                    newSet.delete(id);
                  } else {
                    newSet.add(id);
                  }
                  return newSet;
                });
              }}
            />

            {/* Footer */}
            <ProductModalFooter
              totalPrice={calculateTotalPrice()}
              onAddToCart={handleAddToCartClick}
            />
          </div>

          {/* Image - Right Side */}
          <ProductModalImage image={item.image} name={item.name} />
        </div>
      </div>

      {/* Order Prompt Dialog */}
      {orderPrompts.length > 0 && (
        <Dialog 
          open={showOrderPrompt} 
          onOpenChange={(open) => {
            if (!open) {
              setShowOrderPrompt(false);
              onClose();
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {translateToHebrew(orderPrompts[currentPromptIndex]?.title || 'Additional Items')}
              </DialogTitle>
              {orderPrompts[currentPromptIndex]?.description && (
                <DialogDescription>
                  {translateToHebrew(orderPrompts[currentPromptIndex].description)}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="py-4">
              {orderPrompts[currentPromptIndex]?.products && orderPrompts[currentPromptIndex].products!.length > 0 ? (
                <div className="space-y-2">
                  {orderPrompts[currentPromptIndex].products!.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleTogglePromptProduct(product.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedPromptProducts.has(product.id)
                          ? 'bg-purple-50 border-purple-500'
                          : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex-1">
                        <span className="font-medium block">
                          {translateToHebrew(product.product_name || 'Product')}
                        </span>
                        {product.volume_option && (
                          <span className="text-sm text-gray-600">
                            {translateToHebrew(product.volume_option)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-purple-600">
                          ₪{product.product_price.toFixed(0)}
                        </span>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPromptProducts.has(product.id)
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedPromptProducts.has(product.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {translateToHebrew('No products available in this prompt.')}
                </p>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleOrderPromptSkip}
                className="w-full sm:w-auto"
              >
                {translateToHebrew('Skip')}
              </Button>
              <Button
                onClick={handleOrderPromptNext}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
              >
                {currentPromptIndex < orderPrompts.length - 1
                  ? translateToHebrew('Next')
                  : translateToHebrew('Done')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  // Use Portal to render modal directly in body, bypassing any parent containers
  if (typeof window !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  // Fallback for SSR
  return null;
}

