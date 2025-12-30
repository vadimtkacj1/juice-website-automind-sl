const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../juice_website.db');

console.log('🍹 Seeding menu data...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

const categories = [
  { name: 'Fresh Juices', description: 'Natural juices from fresh fruits and vegetables', sort_order: 1 },
  { name: 'Shakes & Smoothies', description: 'Delicious and healthy smoothies', sort_order: 2 },
  { name: 'Event Platters', description: 'Fruit and vegetable platters for events', sort_order: 3 },
  { name: 'Salads', description: 'Fresh fruit and vegetable salads', sort_order: 4 },
  { name: 'Party Sets', description: 'Special sets with drinks and snacks', sort_order: 5 },
  { name: 'Romantic Sets', description: 'Sets for special moments', sort_order: 6 },
  { name: 'Desserts', description: 'Sweet treats', sort_order: 7 },
];

const menuItems = [
  // Fresh Juices 0.5L
  { category: 'Fresh Juices', name: 'Pomegranate', price: 25, volume: '0.5L' },
  { category: 'Fresh Juices', name: 'Orange', price: 20, volume: '0.5L' },
  { category: 'Fresh Juices', name: 'Grapefruit', price: 20, volume: '0.5L' },
  { category: 'Fresh Juices', name: 'Carrot', price: 25, volume: '0.5L' },
  { category: 'Fresh Juices', name: 'Apple', price: 25, volume: '0.5L' },
  { category: 'Fresh Juices', name: 'Beetroot', price: 25, volume: '0.5L' },
  // Fresh Juices 1L
  { category: 'Fresh Juices', name: 'Pomegranate', price: 40, volume: '1L' },
  { category: 'Fresh Juices', name: 'Orange', price: 40, volume: '1L' },
  { category: 'Fresh Juices', name: 'Grapefruit', price: 40, volume: '1L' },
  { category: 'Fresh Juices', name: 'Carrot', price: 50, volume: '1L' },
  { category: 'Fresh Juices', name: 'Apple', price: 50, volume: '1L' },
  { category: 'Fresh Juices', name: 'Beetroot', price: 50, volume: '1L' },

  // Shakes & Smoothies
  { category: 'Shakes & Smoothies', name: 'Naturally Tasty', description: 'Banana, apple, kiwi, pineapple, melon', price: 30 },
  { category: 'Shakes & Smoothies', name: 'Naturally Tropical', description: 'Mango, pineapple, banana, blueberry', price: 30 },
  { category: 'Shakes & Smoothies', name: 'Naturally Sweet', description: 'Banana, pineapple, strawberry + chocolate', price: 30 },
  { category: 'Shakes & Smoothies', name: 'Naturally Healthy', description: 'Banana, mango, pineapple, kiwi, strawberry', price: 30 },
  { category: 'Shakes & Smoothies', name: 'Naturally Paradise', description: 'Banana, melon, peach, pineapple, strawberry, halva', price: 30 },
  { category: 'Shakes & Smoothies', name: 'Naturally Classic', description: 'Strawberry, banana, pineapple, mango', price: 45 },
  { category: 'Shakes & Smoothies', name: 'Naturally Refreshing', description: 'Tropical mix, banana, pineapple', price: 45 },
  { category: 'Shakes & Smoothies', name: 'Naturally Addictive', description: 'Banana, blueberry, apple + chocolate', price: 45 },

  // Event Platters
  { category: 'Event Platters', name: 'Naturally Sparkling (Large)', description: 'Fruits', price: 300, volume: 'Large' },
  { category: 'Event Platters', name: 'Naturally Sparkling (Medium)', description: 'Fruits', price: 200, volume: 'Medium' },
  { category: 'Event Platters', name: 'Naturally Healthy (Large)', description: 'Vegetables', price: 200, volume: 'Large' },
  { category: 'Event Platters', name: 'Naturally Healthy (Medium)', description: 'Vegetables', price: 150, volume: 'Medium' },

  // Salads
  { category: 'Salads', name: 'Fruit Salad (Large)', price: 160, volume: 'Large' },
  { category: 'Salads', name: 'Fruit Salad (Medium)', price: 140, volume: 'Medium' },
  { category: 'Salads', name: 'Vegetable Salad (Large)', price: 120, volume: 'Large' },
  { category: 'Salads', name: 'Vegetable Salad (Medium)', price: 100, volume: 'Medium' },

  // Party Sets
  { category: 'Party Sets', name: 'Naturally Friendly', description: '6 XL + vodka/arak + fruits', price: 480 },
  { category: 'Party Sets', name: 'Naturally Joyful', description: '6 XL + vodka/arak + nuts', price: 440 },
  { category: 'Party Sets', name: 'Naturally Weekend', description: '6 XL + vodka/arak + 6 malabi', price: 400 },
  { category: 'Party Sets', name: 'Naturally Together', description: '6 XL + vodka/arak + gummies', price: 400 },
  { category: 'Party Sets', name: 'Naturally Allowed', description: '6 Cola/Zero + nuts', price: 200 },
  { category: 'Party Sets', name: 'Naturally Right', description: '6 Cola/Zero + gummies', price: 200 },
  { category: 'Party Sets', name: 'Naturally Salty', description: '6 Cola/Zero + 6 snacks', price: 200 },

  // Romantic Sets
  { category: 'Romantic Sets', name: 'Naturally Spoiling', description: 'Wine + chocolate', price: 300 },
  { category: 'Romantic Sets', name: 'Naturally For Two', description: 'Wine + nuts', price: 300 },
  { category: 'Romantic Sets', name: 'Naturally Winking', description: 'Wine + fruits for two', price: 350 },
  { category: 'Romantic Sets', name: 'Naturally Encouraging', description: 'Wine + gummies', price: 320 },
  { category: 'Romantic Sets', name: 'Naturally Pleasant', description: 'Wine + flowers + chocolate', price: 400 },
  { category: 'Romantic Sets', name: 'Naturally Warm', description: 'Wine + flowers + fruits', price: 400 },
  { category: 'Romantic Sets', name: 'Naturally Luxury', description: 'Wine + 8 desserts', price: 350 },

  // Desserts
  { category: 'Desserts', name: '6 Desserts Set', description: 'Malabi / Bavaria / Mousse / Kadaif', price: 100 },
  { category: 'Desserts', name: 'Family Refreshing Platter', description: '8 different desserts', price: 140 },
  { category: 'Desserts', name: 'Naturally Tasty (Dessert)', description: '2 waffles + dessert', price: 80 },
  { category: 'Desserts', name: 'Naturally Healthy (Dessert)', description: '2 waffles + fruits', price: 80 },
];

// Insert categories first
db.serialize(() => {
  const insertCategory = db.prepare('INSERT INTO menu_categories (name, description, sort_order) VALUES (?, ?, ?)');
  
  categories.forEach((cat) => {
    insertCategory.run(cat.name, cat.description, cat.sort_order, (err) => {
      if (err) {
        console.error(`❌ Error inserting category ${cat.name}:`, err.message);
      } else {
        console.log(`✅ Category added: ${cat.name}`);
      }
    });
  });
  
  insertCategory.finalize();
});

// Wait a bit then insert menu items
setTimeout(() => {
  db.all('SELECT id, name FROM menu_categories', [], (err, cats) => {
    if (err) {
      console.error('❌ Error fetching categories:', err.message);
      db.close();
      return;
    }

    const categoryMap = {};
    cats.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    const insertItem = db.prepare(`
      INSERT INTO menu_items (category_id, name, description, price, volume, is_available, sort_order) 
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

    let order = 0;
    menuItems.forEach((item) => {
      const categoryId = categoryMap[item.category];
      if (!categoryId) {
        console.error(`❌ Category not found: ${item.category}`);
        return;
      }
      order++;
      insertItem.run(
        categoryId,
        item.name,
        item.description || null,
        item.price,
        item.volume || null,
        order,
        (err) => {
          if (err) {
            console.error(`❌ Error inserting item ${item.name}:`, err.message);
          } else {
            console.log(`   ✅ Item added: ${item.name} - ₪${item.price}`);
          }
        }
      );
    });

    insertItem.finalize(() => {
      console.log('\n✨ Menu seeding complete!');
      console.log(`📝 Added ${categories.length} categories and ${menuItems.length} menu items`);
      db.close();
    });
  });
}, 500);
