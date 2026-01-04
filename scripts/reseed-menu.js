const getDatabase = require('../lib/database');

console.log('🔄 Clearing and reseeding menu data...\n');

const db = getDatabase();

if (!db) {
  console.error('❌ Error connecting to database');
  process.exit(1);
}

console.log('✅ Connected to database');

// Clear existing menu data
db.serialize(() => {
  console.log('🗑️  Clearing existing menu data...');
  
  // Delete all menu items first (due to foreign key constraint)
  db.run('DELETE FROM menu_items', (err) => {
    if (err) {
      console.error('❌ Error deleting menu_items:', err.message);
    } else {
      console.log('✅ Cleared menu_items table');
    }
  });
  
  // Delete all menu categories
  db.run('DELETE FROM menu_categories', (err) => {
    if (err) {
      console.error('❌ Error deleting menu_categories:', err.message);
    } else {
      console.log('✅ Cleared menu_categories table');
    }
  });
});

// Wait a bit then run seed script
setTimeout(() => {
  console.log('\n🌱 Reseeding menu data...\n');
  require('./seed-menu');
}, 1000);
