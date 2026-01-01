'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag, X } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';

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
      <div className="success-page">
        <div className="success-container error-container">
          <div className="success-icon error-icon">
            <X size={80} />
          </div>
          
          <h1>{errorTitle}</h1>
          <p>{errorMessage}</p>

          <div className="success-actions">
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

        <style jsx>{`
          .error-icon :global(svg) {
            color: #ef4444;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <CheckCircle size={80} />
        </div>
        
        <h1>{translateToHebrew('Order Confirmed!')}</h1>
        <p>{translateToHebrew("Thank you for your order. We've received your order and will start preparing your items right away. You will receive a confirmation email shortly.")}</p>
        
        {orderNumber && (
          <div className="order-id">
            <span>{translateToHebrew('Order Number')}:</span>
            <code>{orderNumber}</code>
          </div>
        )}

        <div className="success-actions">
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

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
        }

        .success-container {
          max-width: 500px;
          text-align: center;
          background: white;
          padding: 60px 40px;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(29, 26, 64, 0.1);
        }

        .success-icon {
          margin-bottom: 24px;
        }

        .success-icon :global(svg) {
          color: #22c55e;
        }

        h1 {
          font-family: "Archivo", sans-serif;
          font-weight: 900;
          font-size: 36px;
          color: var(--dark, #1d1a40);
          margin: 0 0 16px;
        }

        p {
          font-size: 16px;
          color: var(--text-gray, #70758c);
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .order-id {
          background: #f8fafc;
          padding: 16px 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }

        .order-id span {
          display: block;
          font-size: 12px;
          color: var(--text-gray, #70758c);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .order-id code {
          font-family: monospace;
          font-size: 20px;
          font-weight: 700;
          color: var(--dark, #1d1a40);
          letter-spacing: 0.1em;
        }

        .success-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .success-actions :global(a) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 28px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .success-actions :global(.btn-primary) {
          background: var(--primary, #7322ff);
          color: white;
        }

        .success-actions :global(.btn-primary:hover) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(115, 34, 255, 0.3);
        }

        .success-actions :global(.btn-secondary) {
          background: var(--secondary, #93f3aa);
          color: var(--dark, #1d1a40);
        }

        .success-actions :global(.btn-secondary:hover) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(147, 243, 170, 0.4);
        }

        @media (max-width: 500px) {
          .success-container {
            padding: 40px 24px;
          }

          h1 {
            font-size: 28px;
          }

          .success-actions {
            flex-direction: column;
          }

          .success-actions :global(a) {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="success-page">
        <div className="success-container">
          <div className="success-icon">
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

