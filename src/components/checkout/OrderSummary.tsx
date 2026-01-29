import Image from 'next/image';
import styles from './OrderSummary.module.css';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  volume?: string;
  customIngredients?: Array<{ name: string; price: number }>;
  additionalItems?: Array<{ name: string; price: number }>;
}

interface OrderSummaryProps {
  cart: CartItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  showDelivery: boolean;
  freeDeliveryThreshold: number;
}

export default function OrderSummary({
  cart,
  subtotal,
  deliveryCost,
  total,
  showDelivery,
  freeDeliveryThreshold
}: OrderSummaryProps) {

  const calculateItemTotal = (item: CartItem) => {
    let itemTotal = Number(item.price);
    if (item.customIngredients) {
      itemTotal += item.customIngredients.reduce((sum, ing) => sum + Number(ing.price), 0);
    }
    if (item.additionalItems) {
      itemTotal += item.additionalItems.reduce((sum, addItem) => sum + Number(addItem.price), 0);
    }
    return itemTotal * Number(item.quantity);
  };

  return (
    <div className={styles.summary}>
      <h2>סיכום הזמנה</h2>

      <div className={styles.items}>
        {cart.map((item, index) => (
          <div key={index} className={styles.item}>
            {item.image && (
              <div className={styles.image}>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={70}
                  height={70}
                  style={{ objectFit: 'cover' }}
                  loading="lazy"
                  quality={75}
                />
              </div>
            )}

            <div className={styles.details}>
              <h3>{item.name}</h3>
              {item.volume && <p className={styles.volume}>{item.volume}</p>}

              {item.customIngredients && item.customIngredients.length > 0 && (
                <div className={styles.extras}>
                  {item.customIngredients.map((ing, idx) => (
                    <span key={idx} className={styles.tag}>
                      {ing.name} +₪{ing.price}
                    </span>
                  ))}
                </div>
              )}

              {item.additionalItems && item.additionalItems.length > 0 && (
                <div className={styles.extras}>
                  {item.additionalItems.map((addItem, idx) => (
                    <span key={idx} className={styles.tag}>
                      {addItem.name} +₪{addItem.price}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.quantity}>כמות: {item.quantity}</div>
            </div>

            <div className={styles.price}>₪{calculateItemTotal(item)}</div>
          </div>
        ))}
      </div>

      <div className={styles.totals}>
        <div className={styles.row}>
          <span>סכום ביניים</span>
          <span>₪{subtotal}</span>
        </div>

        {showDelivery && (
          <div className={styles.row}>
            <span>משלוח</span>
            <span className={deliveryCost === 0 ? styles.free : ''}>
              {deliveryCost === 0 ? 'חינם' : `₪${deliveryCost}`}
            </span>
          </div>
        )}

        <div className={styles.total}>
          <span>סה"כ לתשלום</span>
          <span>₪{total}</span>
        </div>
      </div>

      {subtotal < freeDeliveryThreshold && subtotal > 0 && (
        <div className={styles.freeDeliveryNotice}>
          עוד ₪{(freeDeliveryThreshold - subtotal).toFixed(0)} למשלוח חינם
        </div>
      )}
    </div>
  );
}
