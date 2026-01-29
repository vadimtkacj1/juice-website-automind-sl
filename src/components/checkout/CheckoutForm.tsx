import Link from 'next/link';
import { AlertCircle, CreditCard, Lock, Loader2, ArrowLeft } from 'lucide-react';
import styles from './CheckoutForm.module.css';

interface CustomerInfo {
  name: string;
  phone: string;
  city: string;
  street: string;
  houseNumber: string;
  apartmentLevel: string;
  apartmentNumber: string;
  additionalInfo: string;
  deliveryDate: string;
}

interface DeliveryConfig {
  freeDeliveryThreshold: number;
  cities: {
    [key: string]: {
      cost: number;
      minOrder: number;
    };
  };
}

interface CheckoutFormProps {
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  errors: Record<string, string>;
  apiError: string | null;
  isProcessing: boolean;
  cities: string[];
  deliveryConfig: DeliveryConfig;
  subtotal: number;
  deliveryCost: number;
  isOrderBelowMinimum: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckoutForm({
  customerInfo,
  setCustomerInfo,
  termsAccepted,
  setTermsAccepted,
  errors,
  apiError,
  isProcessing,
  cities,
  deliveryConfig,
  subtotal,
  deliveryCost,
  isOrderBelowMinimum,
  onSubmit,
}: CheckoutFormProps) {

  const showAddressFields = customerInfo.city && customerInfo.city !== 'איסוף עצמי';

  // Calculate min and max dates for date picker
  const getDateLimits = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;
    const todayDayOfWeek = now.getDay();

    // Determine minimum date
    let minDate = new Date(now);

    // If ordering after 20:30 or Friday after 17:30, start from tomorrow
    if (currentTime >= 20.5 || (todayDayOfWeek === 5 && currentTime >= 17.5)) {
      minDate.setDate(minDate.getDate() + 1);
    }

    // If tomorrow is Saturday, skip to Sunday
    if (minDate.getDay() === 6) {
      minDate.setDate(minDate.getDate() + 1);
    }

    // Maximum date is 7 days from now
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 7);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      min: formatDate(minDate),
      max: formatDate(maxDate),
    };
  };

  const dateLimits = getDateLimits();

  // Validate selected date (exclude Saturdays)
  const isValidDeliveryDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    // Exclude Saturdays
    return dayOfWeek !== 6;
  };

  // Handle date change with validation
  const handleDateChange = (dateString: string) => {
    if (isValidDeliveryDate(dateString)) {
      setCustomerInfo({ ...customerInfo, deliveryDate: dateString });
    } else {
      // If Saturday is selected, clear the date
      setCustomerInfo({ ...customerInfo, deliveryDate: '' });
    }
  };

  return (
    <div className={styles.form}>
      <h2>פרטי הזמנה</h2>

      {apiError && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Personal Info */}
        <div className={styles.section}>
          <h3>פרטים אישיים</h3>

          <div className={styles.field}>
            <label htmlFor="name">
              שם מלא <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className={errors.name ? styles.inputError : ''}
              placeholder="שם מלא"
              disabled={isProcessing}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">
              מספר טלפון <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className={errors.phone ? styles.inputError : ''}
              placeholder="05X-XXX-XXXX"
              disabled={isProcessing}
            />
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
          </div>
        </div>

        {/* Delivery Info */}
        <div className={styles.section}>
          <h3>פרטי משלוח</h3>

          <div className={styles.field}>
            <label htmlFor="city">
              עיר <span className={styles.required}>*</span>
            </label>
            <select
              id="city"
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
              className={errors.city ? styles.inputError : ''}
              disabled={isProcessing}
            >
              <option value="">בחר עיר</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && <span className={styles.fieldError}>{errors.city}</span>}

            {/* Compact delivery info */}
            {customerInfo.city && customerInfo.city !== 'איסוף עצמי' && (
              <>
                <div className={styles.deliveryInfo}>
                  {(() => {
                    const cityConfig = deliveryConfig.cities[customerInfo.city];
                    if (cityConfig) {
                      const isFreeDelivery = subtotal >= deliveryConfig.freeDeliveryThreshold;
                      return (
                        <>
                          מינימום: ₪{cityConfig.minOrder}
                          {!isFreeDelivery && ` • משלוח: ₪${cityConfig.cost}`}
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Warning if below minimum */}
                {(() => {
                  const cityConfig = deliveryConfig.cities[customerInfo.city];
                  if (cityConfig && subtotal < cityConfig.minOrder) {
                    const remaining = cityConfig.minOrder - subtotal;
                    return (
                      <div className={styles.warning}>
                        נותרו עוד ₪{remaining.toFixed(0)} להשלמת מינימום
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </div>

          {/* Delivery Date */}
          {customerInfo.city && customerInfo.city !== 'איסוף עצמי' && (
            <div className={styles.field}>
              <label htmlFor="deliveryDate">
                תאריך משלוח <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="deliveryDate"
                value={customerInfo.deliveryDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={dateLimits.min}
                max={dateLimits.max}
                className={errors.deliveryDate ? styles.inputError : ''}
                disabled={isProcessing}
              />
              {errors.deliveryDate && <span className={styles.fieldError}>{errors.deliveryDate}</span>}
              <div className={styles.deliveryInfo}>
                * לא ניתן לבחור בשבת
              </div>
            </div>
          )}

          {/* Address fields */}
          {showAddressFields && (
            <>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="street">
                    רחוב <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={customerInfo.street}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, street: e.target.value })}
                    className={errors.street ? styles.inputError : ''}
                    disabled={isProcessing}
                    placeholder="שם הרחוב"
                  />
                  {errors.street && <span className={styles.fieldError}>{errors.street}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="houseNumber">
                    מספר בית <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="houseNumber"
                    value={customerInfo.houseNumber}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, houseNumber: e.target.value })}
                    className={errors.houseNumber ? styles.inputError : ''}
                    disabled={isProcessing}
                    placeholder="מספר"
                  />
                  {errors.houseNumber && <span className={styles.fieldError}>{errors.houseNumber}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="apartmentLevel">קומה</label>
                  <input
                    type="text"
                    id="apartmentLevel"
                    value={customerInfo.apartmentLevel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, apartmentLevel: e.target.value })}
                    disabled={isProcessing}
                    placeholder="קומה"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="apartmentNumber">דירה</label>
                  <input
                    type="text"
                    id="apartmentNumber"
                    value={customerInfo.apartmentNumber}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, apartmentNumber: e.target.value })}
                    disabled={isProcessing}
                    placeholder="דירה"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="additionalInfo">הערות למשלוח</label>
                <textarea
                  id="additionalInfo"
                  value={customerInfo.additionalInfo}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, additionalInfo: e.target.value })}
                  disabled={isProcessing}
                  placeholder="הערות נוספות"
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Self pickup notice */}
          {customerInfo.city === 'איסוף עצמי' && (
            <div className={styles.pickupNotice}>
              תקבל הודעה עם פרטי המיקום והזמן לאיסוף לאחר אישור ההזמנה
            </div>
          )}
        </div>

        {/* Terms */}
        <div className={styles.terms}>
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              קראתי ואני מאשר את{' '}
              <Link href="/terms" target="_blank">
                התקנון
              </Link>
              <span className={styles.required}> *</span>
            </span>
          </label>
          {errors.terms && <span className={styles.fieldError}>{errors.terms}</span>}
        </div>

        {/* Payment info */}
        <div className={styles.paymentInfo}>
          <div className={styles.paymentHeader}>
            <CreditCard size={20} />
            <span>תשלום מאובטח</span>
          </div>
          <p>הנך מועבר לדף תשלום מאובטח של PayPlus</p>
          <div className={styles.badges}>
            <div className={styles.badge}>
              <Lock size={14} />
              <span>מוצפן</span>
            </div>
            <div className={styles.badge}>
              <CreditCard size={14} />
              <span>PCI DSS</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/menu" className={styles.btnSecondary}>
            חזרה לתפריט
          </Link>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isProcessing || isOrderBelowMinimum}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                מעבד...
              </>
            ) : isOrderBelowMinimum ? (
              'סכום נמוך ממינימום'
            ) : (
              <>
                מעבר לתשלום
                <ArrowLeft size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
