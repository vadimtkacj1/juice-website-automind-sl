'use client';

import { useCart } from '@/lib/cart-context';
import { X, Minus, Plus, ShoppingBag, Trash2, Loader2, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { translateToHebrew } from '@/lib/translations';
import styles from './Cart.module.css';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    closeCart,
    getItemKey,
  } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'contact'>('cart');
  
  // Contact form state
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Reset step when cart opens/closes
  useEffect(() => {
    if (!isCartOpen) {
      setStep('cart');
      setError(null);
    }
  }, [isCartOpen]);

  function validatePhone(value: string): boolean {
    // Basic phone validation - at least 9 digits
    const phoneRegex = /^[\d\s\-+()]{9,}$/;
    return phoneRegex.test(value);
  }

  function validateEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function handleProceedToContact() {
    if (cart.length === 0) return;
    setStep('contact');
    setError(null);
  }

  function handleBackToCart() {
    setStep('cart');
    setPhoneError('');
    setEmailError('');
  }

  async function handleCheckout() {
    // Validate contact info
    let hasError = false;

    if (!phone.trim()) {
      setPhoneError(translateToHebrew('Phone number is required'));
      hasError = true;
    } else if (!validatePhone(phone)) {
      setPhoneError(translateToHebrew('Please enter a valid phone number'));
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (!email.trim()) {
      setEmailError(translateToHebrew('Email is required'));
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(translateToHebrew('Please enter a valid email'));
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            addons: item.addons,
            customIngredients: item.customIngredients || [],
            additionalItems: item.additionalItems || [],
          })),
          customer: {
            phone: phone.trim(),
            email: email.trim(),
            deliveryAddress: deliveryAddress.trim(),
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success && (data.redirectUrl || data.paymentUrl)) {
        // Redirect to payment page or success page
        window.location.href = data.redirectUrl || data.paymentUrl;
      } else if (data.orderNumber) {
        // Fallback redirect
        window.location.href = `/checkout/success?order=${data.orderNumber}`;
      }
    } catch (err) {
      setError(translateToHebrew('Failed to start checkout. Please try again.'));
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Prevent body scroll when cart is open and scroll to top
  useEffect(() => {
    if (isCartOpen) {
      // Scroll to top when cart opens
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Ensure cart is visible by bringing it to front
      const cartElement = document.querySelector('[class*="cartModal"]');
      if (cartElement) {
        (cartElement as HTMLElement).style.zIndex = '10051';
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.cartBackdrop} onClick={closeCart} />

      {/* Cart Modal */}
      <div className={styles.cartModal}>
        <div className={styles.cartContainer}>
          {/* Header */}
          <div className={styles.cartHeader}>
            <div className={styles.cartHeaderTitle}>
              {step === 'contact' ? (
                <button className={styles.cartBackBtn} onClick={handleBackToCart}>
                  <ArrowLeft size={24} />
                </button>
              ) : (
                <div className={styles.cartIconWrap}>
                  <ShoppingBag className="cart-icon" />
                  {getTotalItems() > 0 && (
                    <span className={styles.cartCount}>{getTotalItems()}</span>
                  )}
                </div>
              )}
              <h2>{step === 'cart' ? translateToHebrew('Your Cart') : translateToHebrew('Contact Details')}</h2>
            </div>
            <button onClick={closeCart} className={styles.cartCloseBtn}>
              <X size={24} />
            </button>
          </div>

          {step === 'cart' ? (
            <>
              {/* Cart Items */}
              <div className={styles.cartItems}>
                {cart.length === 0 ? (
                  <div className={styles.cartEmpty}>
                    <div className={styles.cartEmptyIcon}>
                      <ShoppingBag size={64} />
                    </div>
                    <h3>{translateToHebrew('Your cart is empty')}</h3>
                    <p>{translateToHebrew('Add some items from the menu!')}</p>
                    <button onClick={closeCart} className={styles.cartBrowseBtn}>
                      {translateToHebrew('Browse Menu')}
                    </button>
                  </div>
                ) : (
                  <div className={styles.cartItemsList}>
                    {cart.map((item, index) => {
                      // Calculate item total including addons, custom ingredients, and additional items
                      const addonsTotal = (item.addons || []).reduce((total, addon) => 
                        total + addon.price * addon.quantity, 0
                      );
                      const ingredientsTotal = (item.customIngredients || []).reduce((total, ingredient) => 
                        total + ingredient.price, 0
                      );
                      const additionalItemsTotal = (item.additionalItems || []).reduce((total, addItem) => 
                        total + addItem.price, 0
                      );
                      const itemTotal = item.price + addonsTotal + ingredientsTotal + additionalItemsTotal;
                      
                      return (
                        <div key={`${item.id}-${index}`} className={styles.cartItem}>
                          {item.image ? (
                            <div className={styles.cartItemImage}>
                              <img src={item.image} alt={item.name} />
                            </div>
                          ) : (
                            <div className={styles.cartItemPlaceholder}>
                              <ShoppingBag size={24} />
                            </div>
                          )}

                          <div className={styles.cartItemInfo}>
                            <h4>
                              {item.name}
                              {item.volume && <span className="cart-item-volume"> - {item.volume}</span>}
                            </h4>
                            
                            {/* Addons */}
                            {item.addons && item.addons.length > 0 && (
                              <div className={styles.cartItemAddons}>
                                {item.addons.map(addon => (
                                  <div key={addon.id} className={styles.cartItemAddon}>
                                    <span className={styles.cartItemAddonName}>
                                      + {translateToHebrew(addon.name)} (x{addon.quantity})
                                    </span>
                                    <span className={styles.cartItemAddonPrice}>
                                      +₪{(addon.price * addon.quantity).toFixed(0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Custom Ingredients */}
                            {item.customIngredients && item.customIngredients.length > 0 && (
                              <div className={styles.cartItemIngredients}>
                                <span className={styles.cartItemIngredientsLabel}>{translateToHebrew('With')}: </span>
                                <span className={styles.cartItemIngredientsList}>
                                  {item.customIngredients.map((ingredient, idx) => (
                                    <span key={ingredient.id}>
                                      {ingredient.name}
                                      {ingredient.price > 0 && ` (+₪${ingredient.price.toFixed(0)})`}
                                      {idx < item.customIngredients!.length - 1 && ', '}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            )}

                            {/* Additional Items */}
                            {item.additionalItems && item.additionalItems.length > 0 && (
                              <div className={styles.cartItemAddons}>
                                {item.additionalItems.map(addItem => (
                                  <div key={addItem.id} className={styles.cartItemAddon}>
                                    <span className={styles.cartItemAddonName}>
                                      + {translateToHebrew(addItem.name)}
                                    </span>
                                    <span className={styles.cartItemAddonPrice}>
                                      +₪{addItem.price.toFixed(0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className={styles.cartItemPrice}>
                              ₪{itemTotal.toFixed(0)} {item.quantity > 1 && `× ${item.quantity}`}
                            </p>
                          </div>

                          <div className={styles.cartItemControls}>
                            <div className={styles.cartQtyControls}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, getItemKey(item))}
                                className={styles.cartQtyBtn}
                              >
                                <Minus size={16} />
                              </button>
                              <span className={styles.cartQty}>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, getItemKey(item))}
                                className={styles.cartQtyBtn}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, getItemKey(item))}
                              className={styles.cartRemoveBtn}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer - Cart Step */}
              {cart.length > 0 && (
                <div className={styles.cartFooter}>
                  <div className={styles.cartTotal}>
                    <span>{translateToHebrew('Total')}</span>
                    <span className={styles.cartTotalPrice}>₪{getTotalPrice().toFixed(0)}</span>
                  </div>
                  <button 
                    className={styles.cartCheckoutBtn}
                    onClick={handleProceedToContact}
                  >
                    {translateToHebrew('Continue to Checkout')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Contact Form */}
              <div className={styles.cartItems}>
                  <div className={styles.contactForm}>
                  <div className={styles.contactInfoText}>
                    <p>{translateToHebrew('Please provide your contact details so we can send you the order confirmation and reach out if needed.')}</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">
                      <Phone size={18} />
                      {translateToHebrew('Phone Number')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder={translateToHebrew('+972 50 123 4567')}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      className={phoneError ? styles.error : ''}
                    />
                    {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      <Mail size={18} />
                      {translateToHebrew('Email Address')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder={translateToHebrew('your@email.com')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={emailError ? styles.error : ''}
                    />
                    {emailError && <span className={styles.fieldError}>{emailError}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="deliveryAddress">
                      📍 {translateToHebrew('Delivery Address')} *
                    </label>
                    <textarea
                      id="deliveryAddress"
                      placeholder={translateToHebrew('Enter full delivery address (street, building, apartment, etc.)')}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={3}
                      required
                      className={styles.deliveryAddressTextarea}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className={styles.orderSummary}>
                    <h4>{translateToHebrew('Order Summary')}</h4>
                    <div className={styles.summaryItems}>
                      {cart.map((item, itemIndex) => {
                        console.log(`Order Summary - Item ${itemIndex}:`, item.name, 'customIngredients:', item.customIngredients);
                        // Calculate item total including addons, ingredients, and additional items
                        const addonsTotal = (item.addons || []).reduce((total, addon) => 
                          total + addon.price * addon.quantity, 0
                        );
                        const ingredientsTotal = (item.customIngredients || []).reduce((total, ingredient) => 
                          total + ingredient.price, 0
                        );
                        const additionalItemsTotal = (item.additionalItems || []).reduce((total, addItem) => 
                          total + addItem.price, 0
                        );
                        const itemTotal = item.price + addonsTotal + ingredientsTotal + additionalItemsTotal;
                        const itemTotalWithQuantity = itemTotal * item.quantity;
                        
                        return (
                          <div key={`${item.id}-${itemIndex}`} className={styles.summaryItemGroup}>
                            <div className={styles.summaryItem}>
                              <span>{item.quantity}x {item.name}{item.volume ? ` (${item.volume})` : ''}</span>
                              <span>₪{itemTotalWithQuantity.toFixed(0)}</span>
                            </div>
                            
                            {/* Addons as sub-items */}
                            {item.addons && item.addons.length > 0 && (
                              <div className={styles.summarySubItems}>
                                {item.addons.map((addon) => (
                                  <div key={addon.id} className={styles.summarySubItem}>
                                    <span>  + {addon.name} (x{addon.quantity})</span>
                                    <span>+₪{(addon.price * addon.quantity * item.quantity).toFixed(0)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Custom Ingredients as sub-items */}
                            {item.customIngredients && item.customIngredients.length > 0 && (
                              <div className={styles.summarySubItems}>
                                {item.customIngredients.map((ingredient) => (
                                  <div key={ingredient.id} className={styles.summarySubItem}>
                                    <span>  + {translateToHebrew(ingredient.name)}</span>
                                    <span>+₪{(ingredient.price * item.quantity).toFixed(0)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Additional Items as sub-items */}
                            {item.additionalItems && item.additionalItems.length > 0 && (
                              <div className={styles.summarySubItems}>
                                {item.additionalItems.map((addItem) => (
                                  <div key={addItem.id} className={styles.summarySubItem}>
                                    <span>  + {translateToHebrew(addItem.name)}</span>
                                    <span>+₪{(addItem.price * item.quantity).toFixed(0)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Contact Step */}
              <div className={styles.cartFooter}>
                {error && (
                  <div className={styles.cartError}>
                    {error}
                  </div>
                )}
                <div className={styles.cartTotal}>
                  <span>{translateToHebrew('Total')}</span>
                  <span className={styles.cartTotalPrice}>₪{getTotalPrice().toFixed(0)}</span>
                </div>
                <button 
                  className={styles.cartCheckoutBtn}
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className={styles.cartSpinner} size={20} />
                      {translateToHebrew('Processing')}...
                    </>
                  ) : (
                    translateToHebrew('Place Order')
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
