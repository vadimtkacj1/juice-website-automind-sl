'use client';

import { useCart } from '@/lib/cart-context';
import { X, Minus, Plus, ShoppingBag, Trash2, Loader2, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { translateToHebrew } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import styles from './Cart.module.css';

export default function Cart() {
  const router = useRouter();
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
    // Navigate to the secure checkout page
    closeCart();
    router.push('/checkout');
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
  console.log(cart)
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
                      // Calculate item total including custom ingredients and additional items
                      const ingredientsTotal = (item.customIngredients || []).reduce((total, ingredient) => 
                        total + ingredient.price, 0
                      );
                      const additionalItemsTotal = (item.additionalItems || []).reduce((total, addItem) => 
                        total + addItem.price, 0
                      );
                      const itemTotal = Number(item.price) + Number(ingredientsTotal) + Number(additionalItemsTotal);
                      
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
                            
                            {/* Custom Ingredients */}
                            {item.customIngredients && item.customIngredients.length > 0 && (
                              <div className={styles.cartItemIngredients}>
                                <span className={styles.cartItemIngredientsLabel}>{translateToHebrew('With')}: </span>
                                <span className={styles.cartItemIngredientsList}>
                                  {item.customIngredients.map((ingredient, idx) => (
                                    <span key={ingredient.id}>
                                      {ingredient.name}
                                      {ingredient.price > 0 && ` (+₪${(typeof ingredient.price === 'number' ? ingredient.price : parseFloat(String(ingredient.price)) || 0).toFixed(0)})`}
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
                                      +₪{(typeof addItem.price === 'number' ? addItem.price : parseFloat(String(addItem.price)) || 0).toFixed(0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

               <p className={styles.cartItemPrice}>
  ₪{Number(itemTotal)} {item.quantity > 1 && `× ${item.quantity}`}
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
                      dir="ltr"
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
                      dir="ltr"
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
                        // Calculate item total including ingredients and additional items
                        const ingredientsTotal = (item.customIngredients || []).reduce((total, ingredient) => 
                          total + ingredient.price, 0
                        );
                        const additionalItemsTotal = (item.additionalItems || []).reduce((total, addItem) => 
                          total + addItem.price, 0
                        );
                        const itemTotal = Number(item.price) + Number(ingredientsTotal) + Number(additionalItemsTotal);
                        const itemTotalWithQuantity = Number(itemTotal * Number(item.quantity))
                        
                        return (
                          <div key={`${item.id}-${itemIndex}`} className={styles.summaryItemGroup}>
                            <div className={styles.summaryItem}>
                              <span>{item.quantity}x {item.name}{item.volume ? ` (${item.volume})` : ''}</span>
                              <span>₪{itemTotalWithQuantity}</span>
                            </div>
                            
                            {/* Custom Ingredients as sub-items */}
                            {item.customIngredients && item.customIngredients.length > 0 && (
                              <div className={styles.summarySubItems}>
                                {item.customIngredients.map((ingredient) => (
                                  <div key={ingredient.id} className={styles.summarySubItem}>
                                    <span>  + {translateToHebrew(ingredient.name)}</span>
                                    <span>+₪{Number(ingredient.price) * Number(item.quantity)}</span>
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
                                    <span>+₪{Number(addItem.price * item.quantity)}</span>
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

      <style jsx>{`
        .cart-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(29, 26, 64, 0.6);
          backdrop-filter: blur(4px);
          z-index: 999998;
          animation: fadeIn 0.3s ease-out;
          will-change: opacity;
        }

        .cart-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 20px;
          pointer-events: auto;
          will-change: transform, opacity;
        }

        .cart-container {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          background: #fff;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(29, 26, 64, 0.25);
          pointer-events: auto;
          animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15);
        }

        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          background: var(--secondary, #93f3aa);
          border-bottom: none;
        }

        .cart-header-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cart-header-title h2 {
          font-family: "Heebo", sans-serif;
          font-weight: 900;
          font-size: 28px;
          color: var(--dark, #1d1a40);
          margin: 0;
        }

        .cart-back-btn {
          width: 48px;
          height: 48px;
          background: rgba(29, 26, 64, 0.1);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cart-back-btn:hover {
          background: rgba(29, 26, 64, 0.2);
          transform: translateX(-3px);
        }

        .cart-back-btn :global(svg) {
          color: var(--dark, #1d1a40);
        }

        .cart-icon-wrap {
          position: relative;
          width: 48px;
          height: 48px;
          background: var(--dark, #1d1a40);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-icon-wrap :global(svg) {
          color: white;
          width: 24px;
          height: 24px;
        }

        .cart-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--pink, #fe7bff);
          color: var(--dark, #1d1a40);
          font-size: 12px;
          font-weight: 900;
          min-width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-close-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(29, 26, 64, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cart-close-btn:hover {
          background: rgba(29, 26, 64, 0.2);
          transform: rotate(90deg);
        }

        .cart-close-btn :global(svg) {
          color: var(--dark, #1d1a40);
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #fafbfd;
        }

        /* Contact Form Styles */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .contact-info-text {
          background: white;
          padding: 16px 20px;
          border-radius: 16px;
          border-left: 4px solid var(--primary, #7322ff);
        }

        .contact-info-text p {
          margin: 0;
          font-size: 14px;
          color: var(--text-gray, #70758c);
          line-height: 1.6;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--dark, #1d1a40);
        }

        .form-group label :global(svg) {
          color: var(--primary, #7322ff);
        }

        .form-group input {
          padding: 16px 20px;
          border: 2px solid var(--gray-bg, #eaedf6);
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary, #7322ff);
          box-shadow: 0 0 0 4px rgba(115, 34, 255, 0.1);
        }

        .form-group input.error {
          border-color: #dc2626;
        }

        .form-group input::placeholder {
          color: #a0a5b8;
        }

        .field-error {
          font-size: 13px;
          color: #dc2626;
          margin-top: 4px;
        }

        .order-summary {
          background: white;
          padding: 20px;
          border-radius: 16px;
          margin-top: 8px;
        }

        .order-summary h4 {
          font-family: "Heebo", sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--dark, #1d1a40);
          margin: 0 0 16px;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-item-group {
          margin-bottom: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--dark, #1d1a40);
          font-weight: 600;
        }

        .summary-item span:last-child {
          font-weight: 600;
          color: var(--dark, #1d1a40);
        }

        .summary-sub-items {
          margin-top: 4px;
          margin-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-sub-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-gray, #70758c);
        }

        .summary-sub-item span:last-child {
          font-weight: 500;
          color: var(--text-gray, #70758c);
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .cart-empty-icon {
          width: 100px;
          height: 100px;
          background: var(--gray-bg, #eaedf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .cart-empty-icon :global(svg) {
          color: var(--text-gray, #70758c);
        }

        .cart-empty h3 {
          font-family: "Heebo", sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--dark, #1d1a40);
          margin: 0 0 8px;
        }

        .cart-empty p {
          color: var(--text-gray, #70758c);
          margin: 0 0 24px;
        }

        .cart-browse-btn {
          background: var(--primary, #7322ff);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
        }

        .cart-browse-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(115, 34, 255, 0.3);
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 16px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(29, 26, 64, 0.06);
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          transform: translateX(4px);
        }

        .cart-item-image {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--gray-bg, #eaedf6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cart-item-placeholder :global(svg) {
          color: var(--text-gray, #70758c);
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-info h4 {
          font-weight: 700;
          font-size: 16px;
          color: var(--dark, #1d1a40);
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-addons {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 8px 0 4px;
        }

        .cart-item-addon {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-gray, #70758c);
        }

        .cart-item-addon-name {
          font-weight: 500;
        }

        .cart-item-addon-price {
          font-weight: 600;
          color: var(--primary, #7322ff);
        }

        .cart-item-ingredients {
          font-size: 13px;
          color: var(--text-gray, #70758c);
          margin: 4px 0;
        }

        .cart-item-ingredients-label {
          font-weight: 600;
        }

        .cart-item-ingredients-list {
          font-weight: 400;
        }

        .cart-item-price {
          font-weight: 800;
          font-size: 18px;
          color: var(--primary, #7322ff);
          margin: 4px 0 0;
        }

        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-qty-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--gray-bg, #eaedf6);
          padding: 6px;
          border-radius: 100px;
        }

        .cart-qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cart-qty-btn:hover {
          background: var(--primary, #7322ff);
        }

        .cart-qty-btn:hover :global(svg) {
          color: white;
        }

        .cart-qty {
          font-weight: 800;
          font-size: 16px;
          min-width: 28px;
          text-align: center;
          color: var(--dark, #1d1a40);
        }

        .cart-remove-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cart-remove-btn :global(svg) {
          color: var(--text-gray, #70758c);
        }

        .cart-remove-btn:hover {
          background: #fee2e2;
        }

        .cart-remove-btn:hover :global(svg) {
          color: #dc2626;
        }

        .cart-footer {
          padding: 24px 28px;
          background: white;
          border-top: 2px solid var(--gray-bg, #eaedf6);
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .cart-total span:first-child {
          font-size: 18px;
          color: var(--text-gray, #70758c);
        }

        .cart-total-price {
          font-family: "Heebo", sans-serif;
          font-weight: 900;
          font-size: 36px;
          color: var(--dark, #1d1a40);
        }

        .cart-checkout-btn {
          width: 100%;
          background: var(--primary, #7322ff);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cart-checkout-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(115, 34, 255, 0.35);
        }

        .cart-checkout-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cart-checkout-btn :global(.cart-spinner) {
          animation: spin 1s linear infinite;
        }

        .cart-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 16px;
          text-align: center;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }

        @media (max-width: 560px) {
          .cart-container {
            max-height: 90vh;
            border-radius: 24px;
          }

          .cart-header {
            padding: 20px;
          }

          .cart-header-title h2 {
            font-size: 24px;
          }

          .cart-item {
            padding: 12px;
          }

          .cart-item-image,
          .cart-item-placeholder {
            width: 52px;
            height: 52px;
          }

          .cart-qty-controls {
            padding: 4px;
          }

          .cart-qty-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </>
  );
}
