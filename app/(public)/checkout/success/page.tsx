'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { translateToHebrew } from '@/lib/translations';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    // Clear cart on successful order
    localStorage.removeItem('cart');
  }, []);

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

