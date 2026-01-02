'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag, X } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';
import styles from './success.module.css';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const error = searchParams.get('error');

  useEffect(() => {
    // Clear cart on successful order (only if no error)
    if (!error) {
      localStorage.removeItem('cart');
    }
  }, [error]);

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

