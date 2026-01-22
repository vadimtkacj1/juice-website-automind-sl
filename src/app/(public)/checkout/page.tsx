'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { translateToHebrew } from '@/lib/translations';
import { useLoading } from '@/lib/loading-context';
import { CreditCard, Loader2, ArrowRight, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import dynamic from 'next/dynamic';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const { setLoading: setGlobalLoading } = useLoading();
  
  // Customer state management
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryAddress: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Redirect to menu if the cart becomes empty
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      router.push('/menu');
    }
  }, [cart, router, isProcessing]);
  
  // Form validation logic
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = translateToHebrew('name is required');
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = translateToHebrew('email is required');
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = translateToHebrew('please enter a valid email address');
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = translateToHebrew('phone number is required');
    } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(customerInfo.phone)) {
      newErrors.phone = translateToHebrew('please enter a valid phone number');
    }

    if (!customerInfo.deliveryAddress.trim()) {
      newErrors.deliveryAddress = translateToHebrew('delivery address is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission and PayPlus integration
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setGlobalLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customer: customerInfo,
        }),
      });
      
      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(data.error || translateToHebrew('failed to process checkout. please try again.'));
        setIsProcessing(false);
        setGlobalLoading(false);
        return;
      }

      // Redirect user to the PayPlus hosted payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setApiError(translateToHebrew('failed to generate payment link. please try again.'));
        setIsProcessing(false);
        setGlobalLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setApiError(translateToHebrew('network error. please check your connection and try again.'));
      setIsProcessing(false);
      setGlobalLoading(false);
    }
  };
  
  // Calculate price for individual items including extras
  const calculateItemTotal = (item: any) => {
    let total = Number(item.price);
    if (item.customIngredients) {
      total += item.customIngredients.reduce((sum: number, ing: any) => Number(sum) + Number(ing.price), 0);
    }
    if (item.additionalItems) {
      total += item.additionalItems.reduce((sum: number, addItem: any) => Number(sum) + Number(addItem.price), 0);
    }
    return Number(total) * Number(item.quantity);
  };
  
  if (cart.length === 0 && !isProcessing) {
    return null;
  }
  
  return (
    /* dir="rtl" ensures the layout and text alignment follow Hebrew standards */
    <div className={styles['checkout-page']} dir="rtl">
      <div className={styles['checkout-container']}>
        
{/* Header section with 3-column grid for perfect centering */}
<div 
  className={styles['header-wrapper']} 
  style={{ 
    display: 'grid', 
    gridTemplateColumns: '1fr auto 1fr', // Grid ensures title is always centered
    alignItems: 'center', 
    marginBottom: '3rem',
    width: '100%',
    color: '#000' // High visibility black
  }}
>
  {/* Column 1: Back Button with arrow on the left */}
  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
    <Link
      href="/menu"
      className={styles['back-button']}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        color: '#000', 
        textDecoration: 'none',
        fontWeight: '700', // Bold text
        fontSize: '1.2rem'
      }}
      onClick={(e) => { if (isProcessing) e.preventDefault(); }}
    >
      {/* In RTL, putting the text first makes the icon appear on the left */}
      <span>חזרה לתפריט</span>
      <ArrowLeft size={24} /> 
    </Link>
  </div>

  {/* Column 2: Centered Large Title */}
  <h1 style={{ 
    margin: 0, 
    fontSize: '3.5rem',  // Larger font size
    fontWeight: '900',   // Extra bold black
    color: '#000',
    textAlign: 'center'
  }}>
    קופה
  </h1>

  {/* Column 3: Empty spacer for symmetry */}
  <div />
</div>
        
        <div className={styles['checkout-content']}>
          {/* Right Column: Order Summary */}
          <div className={styles['order-summary']}>
            <h2>{translateToHebrew('order summary')}</h2>

            <div className={styles['cart-items']}>
              {cart.map((item, index) => (
                <div key={index} className={styles['cart-item']}>
                  {item.image && (
                    <div className={styles['item-image']}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                        quality={75}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                    </div>
                  )}

                  <div className={styles['item-details']}>
                    <h3>{item.name}</h3>
                    {item.volume && <p className={styles['item-volume']}>{item.volume}</p>}
                    
                    {/* Display extra ingredients if any */}
                    {item.customIngredients && item.customIngredients.length > 0 && (
                      <div className={styles['item-extras']}>
                        <span className={styles['extras-label']}>
                          {translateToHebrew('custom ingredients')}:
                        </span>
                        {item.customIngredients.map((ing: any, idx: number) => (
                          <span key={idx} className={styles['extra-item']}>
                            {ing.name} (+₪{ing.price})
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Display additional items if any */}
                    {item.additionalItems && item.additionalItems.length > 0 && (
                      <div className={styles['item-extras']}>
                        <span className={styles['extras-label']}>
                          {translateToHebrew('additional items')}:
                        </span>
                        {item.additionalItems.map((addItem: any, idx: number) => (
                          <span key={idx} className={styles['extra-item']}>
                            {addItem.name} (+₪{Number(addItem.price)})
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles['item-quantity']}>
                      {translateToHebrew('quantity')}: {item.quantity}
                    </div>
                  </div>

                  <div className={styles['item-price']}>
                    ₪{calculateItemTotal(item)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles['order-total']}>
              <span>{translateToHebrew('total amount')}</span>
              <span className={styles['total-price']}>₪{getTotalPrice()}</span>
            </div>
          </div>

          {/* Left Column: Customer Details & Form */}
          <div className={styles['customer-form']}>
            <h2>{translateToHebrew('contact information')}</h2>

            {apiError && (
              <div className={styles['error-message']}>
                <AlertCircle size={20} />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleCheckout}>
              <div className={styles['form-group']}>
                <label htmlFor="name">
                  {translateToHebrew('full name')} <span className={styles['required']}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className={errors.name ? styles['input-error'] : ''}
                  disabled={isProcessing}
                  placeholder={translateToHebrew('enter your full name')}
                />
                {errors.name && <span className={styles['field-error']}>{errors.name}</span>}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="email">
                  {translateToHebrew('email address')} <span className={styles['required']}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className={errors.email ? styles['input-error'] : ''}
                  disabled={isProcessing}
                  placeholder={translateToHebrew('your.email@example.com')}
                />
                {errors.email && <span className={styles['field-error']}>{errors.email}</span>}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="phone">
                  {translateToHebrew('phone number')} <span className={styles['required']}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className={errors.phone ? styles['input-error'] : ''}
                  disabled={isProcessing}
                  placeholder="05X-XXX-XXXX"
                />
                {errors.phone && <span className={styles['field-error']}>{errors.phone}</span>}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="deliveryAddress">
                  {translateToHebrew('delivery address')} <span className={styles['required']}>*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  value={customerInfo.deliveryAddress}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, deliveryAddress: e.target.value })}
                  className={errors.deliveryAddress ? styles['input-error'] : ''}
                  disabled={isProcessing}
                  placeholder={translateToHebrew('street address, city, postal code')}
                  rows={3}
                />
                {errors.deliveryAddress && <span className={styles['field-error']}>{errors.deliveryAddress}</span>}
              </div>
              
              {/* Security and Trust Badges for PayPlus */}
              <div className={styles['payment-info']}>
                <div className={styles['payplus-logo']}>
                  <CreditCard size={24} />
                  <span>PayPlus</span>
                </div>
                <p className={styles['payment-description']}>
                  {translateToHebrew('you will be redirected to payplus secure payment page to complete your payment. all payment information is processed securely by payplus.')}
                </p>
                <div className={styles['security-features']}>
                  <div className={styles['security-feature']}>
                    <Lock size={16} />
                    <span>{translateToHebrew('encrypted connection')}</span>
                  </div>
                  <div className={styles['security-feature']}>
                    <CreditCard size={16} />
                    <span>{translateToHebrew('pci dss compliant')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles['form-actions']}>
                <Link
                  href="/menu"
                  className={styles['btn-secondary']}
                  onClick={(e) => {
                    if (isProcessing) e.preventDefault();
                  }}
                >
                  {translateToHebrew('back to menu')}
                </Link>

                <button
                  type="submit"
                  className={styles['btn-primary']}
                  disabled={isProcessing || cart.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className={styles['spinner']} />
                      {translateToHebrew('processing...')}
                    </>
                  ) : (
                    <>
                      {translateToHebrew('proceed to payment')}
                      {/* ArrowLeft points forward in Hebrew RTL layout */}
                      <ArrowLeft size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}