'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartAddon {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartCustomIngredient {
  id: number;
  name: string;
  price: number;
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
  addons?: CartAddon[];
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      console.log('Loaded cart from localStorage:', parsedCart);
      parsedCart.forEach((item: CartItem, index: number) => {
        console.log(`Cart item ${index}:`, item.name, 'has ingredients?', item.customIngredients && item.customIngredients.length > 0, 'ingredients:', item.customIngredients);
      });
      setCart(parsedCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving cart to localStorage:', cart);
    cart.forEach((item, index) => {
      console.log(`Saving cart item ${index}:`, item.name, 'has ingredients?', item.customIngredients && item.customIngredients.length > 0, 'ingredients:', item.customIngredients);
    });
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    console.log('addToCart called with:', item);
    console.log('customIngredients:', item.customIngredients);
    console.log('additionalItems:', item.additionalItems);
    setCart((prevCart) => {
      // Create a unique key for this item based on id, volume, addons, custom ingredients, and additional items
      const itemKey = JSON.stringify({
        id: item.id,
        volume: item.volume || null,
        addons: item.addons?.map(a => ({ id: a.id, quantity: a.quantity })).sort((a, b) => a.id - b.id) || [],
        customIngredients: item.customIngredients?.map(i => i.id).sort((a, b) => a - b) || [],
        additionalItems: item.additionalItems?.map(i => i.id).sort((a, b) => a - b) || []
      });

        const existingItem = prevCart.find((cartItem) => {
          const cartItemKey = JSON.stringify({
            id: cartItem.id,
            volume: cartItem.volume || null,
            addons: cartItem.addons?.map(a => ({ id: a.id, quantity: a.quantity })).sort((a, b) => a.id - b.id) || [],
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
            addons: cartItem.addons?.map(a => ({ id: a.id, quantity: a.quantity })).sort((a, b) => a.id - b.id) || [],
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
      addons: item.addons?.map(a => ({ id: a.id, quantity: a.quantity })).sort((a, b) => a.id - b.id) || [],
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
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      const addonsPrice = (item.addons || []).reduce((addonTotal, addon) => 
        addonTotal + addon.price * addon.quantity * item.quantity, 0
      );
      const ingredientsPrice = (item.customIngredients || []).reduce((ingredientTotal, ingredient) => 
        ingredientTotal + ingredient.price * item.quantity, 0
      );
      return total + itemPrice + addonsPrice + ingredientsPrice;
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

