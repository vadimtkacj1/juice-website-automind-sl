const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../juice_website.db'));

console.log('🌱 Seeding demo data in Hebrew...\n');

// Demo products (in Hebrew)
const products = [
  { name: 'מיץ תפוזים', description: 'מיץ תפוזים טרי סחוט', price: 20, image: '/images/orange-juice.jpg', availability: 1 },
  { name: 'מיץ תפוחים', description: 'מיץ תפוחים פריך', price: 25, image: '/images/apple-juice.jpg', availability: 1 },
  { name: 'מיץ גזר', description: 'מיץ גזר בריא', price: 25, image: '/images/carrot-juice.jpg', availability: 1 },
  { name: 'שייק פירות יער', description: 'תערובת פירות יער', price: 30, image: '/images/berry-smoothie.jpg', availability: 1 },
  { name: 'דטוקס ירוק', description: 'תרד, תפוח ולימון', price: 30, image: '/images/green-detox.jpg', availability: 0 },
];

// Demo orders (in Hebrew)
const orders = [
  { customer_name: 'יוחנן לוי', customer_email: 'yohanan@example.com', customer_phone: '050-1234567', total_amount: 60, status: 'completed', payment_method: 'Card' },
  { customer_name: 'שרה כהן', customer_email: 'sara@example.com', customer_phone: '052-7654321', total_amount: 45, status: 'pending', payment_method: 'Cash' },
  { customer_name: 'דוד ישראלי', customer_email: 'david@example.com', customer_phone: '054-9876543', total_amount: 75, status: 'completed', payment_method: 'Card' },
];

// Demo promo codes
const promoCodes = [
  { code: 'ברוכים10', discount_type: 'percentage', discount_value: 10, usage_limit: 100, is_active: 1 },
  { code: 'קיץ20', discount_type: 'percentage', discount_value: 20, usage_limit: 50, is_active: 1 },
  { code: 'משלוחחינם', discount_type: 'fixed', discount_value: 5, usage_limit: null, is_active: 1 },
];

// Insert products
let productCount = 0;
products.forEach((product) => {
  db.run(
    'INSERT INTO products (name, description, price, image, availability) VALUES (?, ?, ?, ?, ?)',
    [product.name, product.description, product.price, product.image, product.availability],
    function(err) {
      if (err) {
        console.error('Error inserting product:', err);
      } else {
        productCount++;
        console.log(`✅ Product added: ${product.name}`);
      }
    }
  );
});

// Insert orders
setTimeout(() => {
  let orderCount = 0;
  orders.forEach((order, index) => {
    db.run(
      'INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [order.customer_name, order.customer_email, order.customer_phone, order.total_amount, order.status, order.payment_method],
      function(err) {
        if (err) {
          console.error('Error inserting order:', err);
        } else {
          orderCount++;
          console.log(`✅ Order added: #${this.lastID} - ${order.customer_name}`);
          
          // Add order items (demo: 2 items per order)
          db.run(
            'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, 1, 'מיץ תפוזים', 2, 20]
          );
          db.run(
            'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, 2, 'מיץ תפוחים', 1, 25]
          );
        }
      }
    );
  });
}, 500);

// Insert promo codes
setTimeout(() => {
  let promoCount = 0;
  promoCodes.forEach((promo) => {
    db.run(
      'INSERT INTO promo_codes (code, discount_type, discount_value, usage_limit, is_active) VALUES (?, ?, ?, ?, ?)',
      [promo.code, promo.discount_type, promo.discount_value, promo.usage_limit, promo.is_active],
      function(err) {
        if (err) {
          console.error('Error inserting promo code:', err);
        } else {
          promoCount++;
          console.log(`✅ Promo code added: ${promo.code}`);
        }
      }
    );
  });
}, 1000);

setTimeout(() => {
  console.log('\n✨ Demo data seeding complete - all in Hebrew!');
  db.close();
}, 1500);

