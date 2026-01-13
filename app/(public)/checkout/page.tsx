'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { translateToHebrew } from '@/lib/translations';
import { ShoppingBag, Lock, CreditCard, Loader2, ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryAddress: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      router.push('/menu');
    }
  }, [cart, router, isProcessing]);
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!customerInfo.name.trim()) {
      newErrors.name = translateToHebrew('Name is required');
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = translateToHebrew('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = translateToHebrew('Please enter a valid email address');
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = translateToHebrew('Phone number is required');
    } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(customerInfo.phone)) {
      newErrors.phone = translateToHebrew('Please enter a valid phone number');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
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
        setApiError(data.error || translateToHebrew('Failed to process checkout. Please try again.'));
        setIsProcessing(false);
        return;
      }
      
      // Redirect to PayPlus payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setApiError(translateToHebrew('Failed to generate payment link. Please try again.'));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setApiError(translateToHebrew('Network error. Please check your connection and try again.'));
      setIsProcessing(false);
    }
  };
  
  // Calculate total including custom ingredients and additional items
  const calculateItemTotal = (item: any) => {
    let total = item.price;
    if (item.customIngredients) {
      total += item.customIngredients.reduce((sum: number, ing: any) => sum + ing.price, 0);
    }
    if (item.additionalItems) {
      total += item.additionalItems.reduce((sum: number, addItem: any) => sum + addItem.price, 0);
    }
    return total * item.quantity;
  };
  
  if (cart.length === 0 && !isProcessing) {
    return null; // Will redirect to menu
  }
  
  return (
    <div className={styles['checkout-page']}>
      <div className={styles['checkout-container']}>
        {/* Header */}
        <div className={styles['checkout-header']}>
          <div className={styles['header-content']}>
            <ShoppingBag size={32} />
            <h1>{translateToHebrew('Secure Checkout')}</h1>
            <div className={styles['security-badge']}>
              <Lock size={16} />
              <span>{translateToHebrew('Secure Payment')}</span>
            </div>
          </div>
          <p className={styles['header-subtitle']}>
            {translateToHebrew('Review your order and complete payment via PayPlus')}
          </p>
        </div>
        
        <div className={styles['checkout-content']}>
          {/* Order Summary */}
          <div className={styles['order-summary']}>
            <h2>{translateToHebrew('Order Summary')}</h2>
            
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
                      />
                    </div>
                  )}
                  
                  <div className={styles['item-details']}>
                    <h3>{item.name}</h3>
                    {item.volume && (
                      <p className={styles['item-volume']}>{item.volume}</p>
                    )}
                    {item.customIngredients && item.customIngredients.length > 0 && (
                      <div className={styles['item-extras']}>
                        <span className={styles['extras-label']}>
                          {translateToHebrew('Custom Ingredients')}:
                        </span>
                        {item.customIngredients.map((ing: any, idx: number) => (
                          <span key={idx} className={styles['extra-item']}>
                            {ing.name} (+₪{ing.price.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    )}
                    {item.additionalItems && item.additionalItems.length > 0 && (
                      <div className={styles['item-extras']}>
                        <span className={styles['extras-label']}>
                          {translateToHebrew('Additional Items')}:
                        </span>
                        {item.additionalItems.map((addItem: any, idx: number) => (
                          <span key={idx} className={styles['extra-item']}>
                            {addItem.name} (+₪{(typeof addItem.price === 'number' ? addItem.price : parseFloat(String(addItem.price)) || 0).toFixed(2)})
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles['item-quantity']}>
                      {translateToHebrew('Quantity')}: {item.quantity}
                    </div>
                  </div>
                  
                  <div className={styles['item-price']}>
                    ₪{calculateItemTotal(item).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles['order-total']}>
              <span>{translateToHebrew('Total Amount')}</span>
              <span className={styles['total-price']}>
                ₪{getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Customer Information Form */}
          <div className={styles['customer-form']}>
            <h2>{translateToHebrew('Contact Information')}</h2>
            
            {apiError && (
              <div className={styles['error-message']}>
                <AlertCircle size={20} />
                <span>{apiError}</span>
              </div>
            )}
            
            <form onSubmit={handleCheckout}>
              <div className={styles['form-group']}>
                <label htmlFor="name">
                  {translateToHebrew('Full Name')} <span className={styles['required']}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className={errors.name ? styles['input-error'] : ''}
                  disabled={isProcessing}
                  placeholder={translateToHebrew('Enter your full name')}
                />
                {errors.name && <span className={styles['field-error']}>{errors.name}</span>}
              </div>
              
              <div className={styles['form-group']}>
                <label htmlFor="email">
                  {translateToHebrew('Email Address')} <span className={styles['required']}>*</span>
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
                  {translateToHebrew('Phone Number')} <span className={styles['required']}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className={errors.phone ? styles['input-error'] : ''}
                  disabled={isProcessing}
                  placeholder={translateToHebrew('05X-XXX-XXXX')}
                />
                {errors.phone && <span className={styles['field-error']}>{errors.phone}</span>}
              </div>
              
              <div className={styles['form-group']}>
                <label htmlFor="deliveryAddress">
                  {translateToHebrew('Delivery Address')} <span className={styles['optional']}>({translateToHebrew('Optional')})</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  value={customerInfo.deliveryAddress}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, deliveryAddress: e.target.value })}
                  disabled={isProcessing}
                  placeholder={translateToHebrew('Street address, city, postal code')}
                  rows={3}
                />
              </div>
              
              {/* PayPlus Security Info */}
              <div className={styles['payment-info']}>
                <div className={styles['payplus-logo']}>
                  <CreditCard size={24} />
                  <span>PayPlus</span>
                </div>
                <p className={styles['payment-description']}>
                  {translateToHebrew('You will be redirected to PayPlus secure payment page to complete your payment. All payment information is processed securely by PayPlus.')}
                </p>
                <div className={styles['security-features']}>
                  <div className={styles['security-feature']}>
                    <Lock size={16} />
                    <span>{translateToHebrew('Encrypted Connection')}</span>
                  </div>
                  <div className={styles['security-feature']}>
                    <CreditCard size={16} />
                    <span>{translateToHebrew('PCI DSS Compliant')}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className={styles['form-actions']}>
                <Link 
                  href="/menu" 
                  className={styles['btn-secondary']}
                  onClick={(e) => {
                    if (isProcessing) {
                      e.preventDefault();
                    }
                  }}
                >
                  {translateToHebrew('Back to Menu')}
                </Link>
                
                <button
                  type="submit"
                  className={styles['btn-primary']}
                  disabled={isProcessing || cart.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className={styles['spinner']} />
                      {translateToHebrew('Processing...')}
                    </>
                  ) : (
                    <>
                      {translateToHebrew('Proceed to Payment')}
                      <ArrowRight size={20} />
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

