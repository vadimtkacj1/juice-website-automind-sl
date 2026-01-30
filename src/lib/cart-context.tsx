'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Helper functions for localStorage
// Using localStorage instead of cookies to avoid "Request Header Or Cookie Too Large" errors
// Cookies are sent with every HTTP request and can cause nginx errors when cart is large

function setStorage(name: string, value: string) {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(name, value);
    console.log(`Cart saved to localStorage (${value.length} bytes)`);
    return true;
  } catch (e) {
    console.error('Error saving to localStorage:', e);
    return false;
  }
}

function getStorage(name: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(name);
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return null;
  }
}

function deleteStorage(name: string) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(name);
    console.log('Cart removed from localStorage');
  } catch (e) {
    console.error('Error removing from localStorage:', e);
  }
}

export interface CartCustomIngredient {
  id: number;
  name: string;
  price: number;
  volume?: string; // Volume option selected for this ingredient
}

export interface CartAdditionalItem {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  volume?: string; // Selected volume (e.g., "0.5L", "1L")
  customIngredients?: CartCustomIngredient[]; // Array of custom ingredient objects
  additionalItems?: CartAdditionalItem[]; // Array of additional items (e.g., bigger glass, more kg)
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number, itemKey?: string) => void;
  updateQuantity: (id: number, quantity: number, itemKey?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  getItemKey: (item: CartItem) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from cookies on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        // Don't load cart on success page (it should be cleared after payment)
        if (typeof window !== 'undefined' && window.location.pathname === '/checkout/success') {
          console.log('🚫 [Cart Context] On success page - skipping cart load from storage');
          return;
        }
        
        const storageCart = getStorage('cart');
        if (storageCart) {
          const savedCart = JSON.parse(storageCart);
          if (Array.isArray(savedCart) && savedCart.length > 0) {
            console.log('📥 [Cart Context] Loaded cart from storage:', savedCart.length, 'items');
            savedCart.forEach((item: CartItem, index: number) => {
              console.log(`   Cart item ${index}:`, item.name, 'has ingredients?', item.customIngredients && item.customIngredients.length > 0, 'ingredients:', item.customIngredients);
            });
            setCart(savedCart);
          }
        }
      } catch (e) {
        console.error('❌ [Cart Context] Error loading cart from storage:', e);
      }
    };
    
    // Small delay to ensure window is ready
    const timer = setTimeout(loadCart, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save cart to cookies whenever it changes
  useEffect(() => {
    // Skip initial empty cart load
    if (cart.length === 0) {
      // Only clear if we're sure it's intentional (not initial load)
      const timer = setTimeout(() => {
        deleteStorage('cart');
      }, 100);
      return () => clearTimeout(timer);
    }

    console.log('Saving cart to storage:', cart);
    cart.forEach((item, index) => {
      console.log(`Saving cart item ${index}:`, item.name, 'has ingredients?', item.customIngredients && item.customIngredients.length > 0, 'ingredients:', item.customIngredients);
    });

    const cartJson = JSON.stringify(cart);

    // Save to localStorage only (no cookies to avoid nginx header size errors)
    try {
      setStorage('cart', cartJson);
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    console.log('addToCart called with:', item);
    console.log('customIngredients:', item.customIngredients);
    console.log('additionalItems:', item.additionalItems);
    setCart((prevCart) => {
      // Create a unique key for this item based on id, volume, custom ingredients, and additional items
      const itemKey = JSON.stringify({
        id: item.id,
        volume: item.volume || null,
        customIngredients: item.customIngredients?.map(i => i.id).sort((a, b) => a - b) || [],
        additionalItems: item.additionalItems?.map(i => i.id).sort((a, b) => a - b) || []
      });

        const existingItem = prevCart.find((cartItem) => {
          const cartItemKey = JSON.stringify({
            id: cartItem.id,
            volume: cartItem.volume || null,
            customIngredients: cartItem.customIngredients?.map(i => i.id).sort((a, b) => a - b) || [],
            additionalItems: cartItem.additionalItems?.map(i => i.id).sort((a, b) => a - b) || []
          });
          return cartItemKey === itemKey;
        });

      if (existingItem) {
        const updatedCart = prevCart.map((cartItem) => {
          const cartItemKey = JSON.stringify({
            id: cartItem.id,
            volume: cartItem.volume || null,
            customIngredients: cartItem.customIngredients?.map(i => i.id).sort((a, b) => a - b) || [],
            additionalItems: cartItem.additionalItems?.map(i => i.id).sort((a, b) => a - b) || []
          });
          return cartItemKey === itemKey
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem;
        });
        console.log('Updated existing item in cart. New cart:', updatedCart);
        return updatedCart;
      }
      const newCart = [...prevCart, { ...item, quantity: 1 }];
      console.log('Added new item to cart. New cart:', newCart);
      return newCart;
    });
    setIsCartOpen(true);
  };

  // Helper function to create unique key for cart items
  const getItemKey = (item: CartItem) => {
    return JSON.stringify({
      id: item.id,
      volume: item.volume || null,
      customIngredients: item.customIngredients?.map(i => i.id).sort((a, b) => a - b) || [],
      additionalItems: item.additionalItems?.map(i => i.id).sort((a, b) => a - b) || []
    });
  };

  const removeFromCart = (id: number, itemKey?: string) => {
    if (itemKey) {
      // Remove by unique key if provided
      setCart((prevCart) => prevCart.filter((item) => getItemKey(item) !== itemKey));
    } else {
      // Fallback: remove by id only (for backward compatibility)
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = (id: number, quantity: number, itemKey?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, itemKey);
      return;
    }
    if (itemKey) {
      // Update by unique key if provided
      setCart((prevCart) =>
        prevCart.map((item) =>
          getItemKey(item) === itemKey ? { ...item, quantity } : item
        )
      );
    } else {
      // Fallback: update by id only (for backward compatibility)
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    console.log('🧹 [Cart Context] clearCart() called');
    console.log('🧹 [Cart Context] Current cart before clearing:', cart);
    setCart([]);
    console.log('🧹 [Cart Context] Cart state set to empty array');
    // Clear localStorage
    try {
      deleteStorage('cart');
      console.log('✅ [Cart Context] Cart storage cleared successfully');
    } catch (e) {
      console.error('❌ [Cart Context] Error clearing cart from storage:', e);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemPrice = Number(item.price) * Number(item.quantity);
      const ingredientsPrice = (item.customIngredients || []).reduce((ingredientTotal, ingredient) => 
        Number(ingredientTotal) + Number(ingredient.price) * Number(item.quantity), 0
      );
      const additionalItemsPrice = (item.additionalItems || []).reduce((addTotal, addItem) =>
        Number(addTotal) + Number(addItem.price) * Number(item.quantity), 0
      );
      return Number(total) + itemPrice + ingredientsPrice + additionalItemsPrice;
    }, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        openCart,
        closeCart,
        getItemKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

