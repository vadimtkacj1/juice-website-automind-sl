const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../juice_website.db'));

console.log('🌱 Seeding demo data...\n');

// Demo products
const products = [
  { name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 4.99, image: '/images/orange-juice.jpg', availability: 1 },
  { name: 'Apple Juice', description: 'Crisp apple juice', price: 4.49, image: '/images/apple-juice.jpg', availability: 1 },
  { name: 'Carrot Juice', description: 'Healthy carrot juice', price: 5.49, image: '/images/carrot-juice.jpg', availability: 1 },
  { name: 'Mixed Berry Smoothie', description: 'Blend of berries', price: 6.99, image: '/images/berry-smoothie.jpg', availability: 1 },
  { name: 'Green Detox', description: 'Spinach, apple, and lemon', price: 7.49, image: '/images/green-detox.jpg', availability: 0 },
];

// Demo orders
const orders = [
  { customer_name: 'John Doe', customer_email: 'john@example.com', customer_phone: '555-0101', total_amount: 14.98, status: 'completed', payment_method: 'Card' },
  { customer_name: 'Jane Smith', customer_email: 'jane@example.com', customer_phone: '555-0102', total_amount: 9.98, status: 'pending', payment_method: 'Cash' },
  { customer_name: 'Bob Johnson', customer_email: 'bob@example.com', customer_phone: '555-0103', total_amount: 19.97, status: 'completed', payment_method: 'Card' },
];

// Demo promo codes
const promoCodes = [
  { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, usage_limit: 100, is_active: 1 },
  { code: 'SUMMER20', discount_type: 'percentage', discount_value: 20, usage_limit: 50, is_active: 1 },
  { code: 'FREESHIP', discount_type: 'fixed', discount_value: 5, usage_limit: null, is_active: 1 },
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
            [this.lastID, 1, 'Orange Juice', 2, 4.99]
          );
          db.run(
            'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, 2, 'Apple Juice', 1, 4.49]
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
  console.log('\n✨ Demo data seeding complete!');
  db.close();
}, 1500);

