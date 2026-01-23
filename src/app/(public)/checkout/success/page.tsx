'use client';

import { useEffect, useLayoutEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag, X } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import { useCart } from '@/lib/cart-context';
import styles from './success.module.css';

// Helper function to immediately clear cart cookies/localStorage
// This runs BEFORE React hydration to prevent race conditions
function clearCartStorage() {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 [Success Page] Immediately clearing cart storage (before React hydration)');
  
  // Clear cookies
  document.cookie = 'cart=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  document.cookie = 'cart_storage=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  
  // Clear localStorage
  try {
    localStorage.removeItem('cart');
    localStorage.removeItem('cart_storage');
    console.log('✅ [Success Page] Cart storage cleared successfully');
  } catch (e) {
    console.error('❌ [Success Page] Error clearing localStorage:', e);
  }
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const error = searchParams.get('error');
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  // CRITICAL: Use useLayoutEffect to clear cart BEFORE cart context loads from cookies
  // useLayoutEffect runs synchronously after render but BEFORE useEffect
  // This ensures cookies are deleted before CartProvider's useEffect tries to load them
  useLayoutEffect(() => {
    if (!error && !hasCleared.current) {
      console.log('🚀 [Success Page] useLayoutEffect - clearing cart storage synchronously');
      clearCartStorage();
      hasCleared.current = true;
    }
  }, [error]);

  // Also clear cart state in useEffect
  useEffect(() => {
    console.log('🛒 [Success Page] useEffect triggered', { error, orderNumber });
    if (!error) {
      console.log('✅ [Success Page] Payment successful - clearing cart state');
      // Clear cart state
      clearCart();
      console.log('✅ [Success Page] Cart state cleared successfully');
    } else {
      console.log('❌ [Success Page] NOT clearing cart - error present:', error);
    }
  }, [error, orderNumber, clearCart]);

  // Handle error cases
  if (error) {
    let errorMessage = translateToHebrew('An error occurred during payment processing.');
    let errorTitle = translateToHebrew('Payment Error');
    
    switch (error) {
      case 'payment_failed':
        errorMessage = translateToHebrew('Payment was not successful. Please try again or contact support.');
        errorTitle = translateToHebrew('Payment Failed');
        break;
      case 'order_not_found':
        errorMessage = translateToHebrew('Order not found or expired. Please place a new order.');
        errorTitle = translateToHebrew('Order Not Found');
        break;
      case 'order_creation_failed':
        errorMessage = translateToHebrew('Payment was successful but order creation failed. Please contact support with your payment details.');
        errorTitle = translateToHebrew('Order Creation Error');
        break;
      case 'callback_error':
        errorMessage = translateToHebrew('An error occurred while processing your payment. Please contact support.');
        errorTitle = translateToHebrew('Processing Error');
        break;
      case 'missing_token':
        errorMessage = translateToHebrew('Invalid payment callback. Please try again.');
        errorTitle = translateToHebrew('Invalid Request');
        break;
    }

    return (
      <div className={styles['success-page']}>
        <div className={`${styles['success-container']} ${styles['error-container']}`}>
          <div className={`${styles['success-icon']} ${styles['error-icon']}`}>
            <X size={80} />
          </div>
          
          <h1>{errorTitle}</h1>
          <p>{errorMessage}</p>

          <div className={styles['success-actions']}>
            <Link href="/" className="btn-primary">
              <Home size={20} />
              {translateToHebrew('Back to Home')}
            </Link>
            <Link href="/menu" className="btn-secondary">
              <ShoppingBag size={20} />
              {translateToHebrew('Try Again')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['success-page']}>
      <div className={styles['success-container']}>
        <div className={styles['success-icon']}>
          <CheckCircle size={80} />
        </div>
        
        <h1>{translateToHebrew('Order Confirmed!')}</h1>
        <p>{translateToHebrew("Thank you for your order. We've received your order and will start preparing your items right away. You will receive a confirmation email shortly.")}</p>
        
        {orderNumber && (
          <div className={styles['order-id']}>
            <span>{translateToHebrew('Order Number')}:</span>
            <code>{orderNumber}</code>
          </div>
        )}

        <div className={styles['success-actions']}>
          <Link href="/" className="btn-primary">
            <Home size={20} />
            {translateToHebrew('Back to Home')}
          </Link>
          <Link href="/menu" className="btn-secondary">
            <ShoppingBag size={20} />
            {translateToHebrew('Order More')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles['success-page']}>
        <div className={styles['success-container']}>
          <div className={styles['success-icon']}>
            <CheckCircle size={80} />
          </div>
          <h1>{translateToHebrew('Order Confirmed!')}</h1>
          <p>{translateToHebrew("Thank you for your order. We've received your order and will start preparing your items right away.")}</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

