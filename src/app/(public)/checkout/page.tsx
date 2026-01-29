'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useLoading } from '@/lib/loading-context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutForm from '@/components/checkout/CheckoutForm';

// Delivery configuration
const DELIVERY_CONFIG = {
  freeDeliveryThreshold: 300,
  selfPickup: {
    name: 'איסוף עצמי',
    cost: 0,
    minOrder: 0
  },
  cities: {
    'חולון': { cost: 20, minOrder: 100 },
    'בת ים': { cost: 20, minOrder: 100 },
    'אזור': { cost: 20, minOrder: 100 },
    'ראשון לציון': { cost: 25, minOrder: 200 },
    'גבעתיים': { cost: 25, minOrder: 200 },
    'בני ברק': { cost: 25, minOrder: 200 },
    'תל אביב': { cost: 25, minOrder: 200 },
    'רמת גן': { cost: 25, minOrder: 200 },
    'נס ציונה': { cost: 25, minOrder: 200 },
  }
};

const cities = ['איסוף עצמי', ...Object.keys(DELIVERY_CONFIG.cities)];

export default function CheckoutPage() {
  const { cart, getTotalPrice } = useCart();
  const router = useRouter();
  const { setLoading: setGlobalLoading } = useLoading();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    city: '',
    street: '',
    houseNumber: '',
    apartmentLevel: '',
    apartmentNumber: '',
    additionalInfo: '',
    deliveryDate: '',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Calculate delivery cost
  const calculateDeliveryCost = (): number => {
    const subtotal = getTotalPrice();

    if (subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold) {
      return 0;
    }

    if (customerInfo.city === 'איסוף עצמי') {
      return 0;
    }

    const cityConfig = DELIVERY_CONFIG.cities[customerInfo.city as keyof typeof DELIVERY_CONFIG.cities];
    if (cityConfig) {
      return cityConfig.cost;
    }

    return 0;
  };

  const deliveryCost = calculateDeliveryCost();
  const subtotal = getTotalPrice();
  const totalWithDelivery = subtotal + deliveryCost;

  // Check if order meets minimum requirement
  const isOrderBelowMinimum = (): boolean => {
    if (!customerInfo.city || customerInfo.city === 'איסוף עצמי') {
      return false;
    }

    const cityConfig = DELIVERY_CONFIG.cities[customerInfo.city as keyof typeof DELIVERY_CONFIG.cities];
    if (cityConfig) {
      return subtotal < cityConfig.minOrder;
    }

    return false;
  };

  // Redirect to menu if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      router.push('/menu');
    }
  }, [cart, router, isProcessing]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'נא להזין שם מלא';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'נדרש מספר טלפון';
    } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(customerInfo.phone)) {
      newErrors.phone = 'אנא הזן מספר טלפון תקין';
    }

    if (!customerInfo.city.trim()) {
      newErrors.city = 'נא לבחור עיר';
    } else {
      const cityConfig = DELIVERY_CONFIG.cities[customerInfo.city as keyof typeof DELIVERY_CONFIG.cities];
      if (cityConfig && subtotal < cityConfig.minOrder) {
        newErrors.city = `מינימום הזמנה עבור ${customerInfo.city}: ₪${cityConfig.minOrder}`;
      }
    }

    if (customerInfo.city !== 'איסוף עצמי') {
      if (!customerInfo.street.trim()) {
        newErrors.street = 'נדרש שם רחוב';
      }
      if (!customerInfo.houseNumber.trim()) {
        newErrors.houseNumber = 'נדרש מספר בית';
      }
      if (!customerInfo.deliveryDate) {
        newErrors.deliveryDate = 'נא לבחור תאריך משלוח';
      }
    }

    if (!termsAccepted) {
      newErrors.terms = 'יש לאשר את התקנון';
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
    setGlobalLoading(true);

    try {
      const deliveryAddress = customerInfo.city === 'איסוף עצמי'
        ? 'איסוף עצמי'
        : `${customerInfo.street} ${customerInfo.houseNumber}${
            customerInfo.apartmentLevel ? `, קומה ${customerInfo.apartmentLevel}` : ''
          }${
            customerInfo.apartmentNumber ? `, דירה ${customerInfo.apartmentNumber}` : ''
          }, ${customerInfo.city}${
            customerInfo.additionalInfo ? ` - ${customerInfo.additionalInfo}` : ''
          }`;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customer: {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.phone + '@placeholder.com',
            deliveryAddress: deliveryAddress,
            city: customerInfo.city,
            deliveryCost: deliveryCost,
            deliveryDate: customerInfo.deliveryDate,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(data.error || 'נכשל בעיבוד ההזמנה. נא לנסות שוב.');
        setIsProcessing(false);
        setGlobalLoading(false);
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setApiError('נכשל ביצירת קישור לתשלום. נא לנסות שוב.');
        setIsProcessing(false);
        setGlobalLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setApiError('שגיאת רשת. נא לבדוק את החיבור ולנסות שוב.');
      setIsProcessing(false);
      setGlobalLoading(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <Link
            href="/menu"
            className={styles.backButton}
            onClick={(e) => { if (isProcessing) e.preventDefault(); }}
          >
            <ArrowLeft size={20} />
            <span>חזרה לתפריט</span>
          </Link>

          <h1>קופה</h1>

          <div />
        </div>

        {/* Content Grid */}
        <div className={styles.content}>
          {/* Checkout Form */}
          <CheckoutForm
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            errors={errors}
            apiError={apiError}
            isProcessing={isProcessing}
            cities={cities}
            deliveryConfig={DELIVERY_CONFIG}
            subtotal={subtotal}
            deliveryCost={deliveryCost}
            isOrderBelowMinimum={isOrderBelowMinimum()}
            onSubmit={handleCheckout}
          />

          {/* Order Summary */}
          <OrderSummary
            cart={cart}
            subtotal={subtotal}
            deliveryCost={deliveryCost}
            total={customerInfo.city ? totalWithDelivery : subtotal}
            showDelivery={!!customerInfo.city}
            freeDeliveryThreshold={DELIVERY_CONFIG.freeDeliveryThreshold}
          />
        </div>
      </div>
    </div>
  );
}
