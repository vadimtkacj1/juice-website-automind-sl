'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Helper functions for cookies
// Cookies have a 4KB limit, so we'll use localStorage as fallback for large carts
const MAX_COOKIE_SIZE = 4000; // 4KB limit for cookies

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof window === 'undefined') return false;
  
  // Check if value is too large for cookie
  const encodedValue = encodeURIComponent(value);
  if (encodedValue.length > MAX_COOKIE_SIZE) {
    console.warn('Cart data too large for cookie, using localStorage instead');
    try {
      localStorage.setItem(name, value);
      // Set a flag cookie to indicate we're using localStorage
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}_storage=localStorage;expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      return false; // Indicate we used localStorage
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodedValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  // Clear localStorage flag if using cookie
  try {
    localStorage.removeItem(`${name}_storage`);
  } catch (e) {
    // Ignore
  }
  return true; // Indicate we used cookie
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  // Check if we're using localStorage instead
  const storageFlag = getCookieValue(`${name}_storage`);
  if (storageFlag === 'localStorage') {
    try {
      const stored = localStorage.getItem(name);
      if (stored) {
        console.log('Loaded cart from localStorage (too large for cookie)');
        return stored;
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
  }
  
  return getCookieValue(name);
}

function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  document.cookie = `${name}_storage=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  try {
    localStorage.removeItem(name);
    localStorage.removeItem(`${name}_storage`);
  } catch (e) {
    // Ignore
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
        const cookieCart = getCookie('cart');
        if (cookieCart) {
          const savedCart = JSON.parse(cookieCart);
          if (Array.isArray(savedCart) && savedCart.length > 0) {
            console.log('Loaded cart from storage:', savedCart);
            savedCart.forEach((item: CartItem, index: number) => {
              console.log(`Cart item ${index}:`, item.name, 'has ingredients?', item.customIngredients && item.customIngredients.length > 0, 'ingredients:', item.customIngredients);
            });
            setCart(savedCart);
          }
        }
      } catch (e) {
        console.error('Error loading cart from storage:', e);
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
        deleteCookie('cart');
      }, 100);
      return () => clearTimeout(timer);
    }
    
    console.log('Saving cart to storage:', cart);
    cart.forEach((item, index) => {
      console.log(`Saving cart item ${index}:`, item.name, 'has ingredients?', item.customIngredients && item.customIngredients.length > 0, 'ingredients:', item.customIngredients);
    });
    
    const cartJson = JSON.stringify(cart);
    
    // Save to cookies (with localStorage fallback for large carts)
    try {
      const savedToCookie = setCookie('cart', cartJson, 30); // Save for 30 days
      if (savedToCookie) {
        console.log('Cart saved to cookie');
      } else {
        console.log('Cart saved to localStorage (too large for cookie)');
      }
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
    setCart([]);
    // Clear cookie
    try {
      deleteCookie('cart');
    } catch (e) {
      console.error('Error clearing cart from cookies:', e);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      const ingredientsPrice = (item.customIngredients || []).reduce((ingredientTotal, ingredient) => 
        ingredientTotal + ingredient.price * item.quantity, 0
      );
      const additionalItemsPrice = (item.additionalItems || []).reduce((addTotal, addItem) =>
        addTotal + addItem.price * item.quantity, 0
      );
      return total + itemPrice + ingredientsPrice + additionalItemsPrice;
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

