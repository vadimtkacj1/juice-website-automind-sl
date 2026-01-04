const getDatabase = require('../lib/database');

const db = getDatabase();

if (!db) {
  console.error('Error connecting to database');
  process.exit(1);
}

console.log('🌱 Seeding demo data in Hebrew...\n');

// Demo promo codes
const promoCodes = [
  { code: 'ברוכים10', discount_type: 'percentage', discount_value: 10, usage_limit: 100, is_active: 1 },
  { code: 'קיץ20', discount_type: 'percentage', discount_value: 20, usage_limit: 50, is_active: 1 },
  { code: 'משלוחחינם', discount_type: 'fixed', discount_value: 5, usage_limit: null, is_active: 1 },
];

// Insert promo codes
promoCodes.forEach((promo) => {
  db.run(
    'INSERT IGNORE INTO promo_codes (code, discount_type, discount_value, usage_limit, is_active) VALUES (?, ?, ?, ?, ?)',
    [promo.code, promo.discount_type, promo.discount_value, promo.usage_limit, promo.is_active],
    function(err) {
      if (err) {
        console.error('Error inserting promo code:', err);
      } else {
        console.log(`✅ Promo code added: ${promo.code}`);
      }
    }
  );
});

setTimeout(() => {
  console.log('\n✨ Demo data seeding complete - all in Hebrew!');
  // Give a moment for any pending queries to complete
  setTimeout(() => {
    process.exit(0);
  }, 500);
}, 1000);
