const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

console.log('🔍 Debugging Menu API...');
console.log(`📁 Database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }

  // Get active categories
  db.all('SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order', [], (err, categories) => {
    if (err) {
      console.error('❌ Categories error:', err.message);
      db.close();
      return;
    }

    console.log(`✅ Active categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   ID: ${cat.id}, Name: ${cat.name}, is_active: ${cat.is_active}`);
    });

    // Get available items
    db.all('SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order', [], (err, items) => {
      if (err) {
        console.error('❌ Items error:', err.message);
        db.close();
        return;
      }

      console.log(`\n✅ Available items: ${items.length}`);
      
      // Check category_id types
      const categoryIds = [...new Set(items.map(i => i.category_id))];
      console.log(`\n📊 Item category_ids:`, categoryIds);
      console.log(`📊 Category IDs in DB:`, categories.map(c => c.id));

      // Group items by category
      console.log(`\n📋 Items per category:`);
      categories.forEach(cat => {
        const categoryItems = items.filter(item => {
          // Check both string and number comparison
          return item.category_id == cat.id;
        });
        console.log(`   Category ${cat.id} (${cat.name}): ${categoryItems.length} items`);
        if (categoryItems.length > 0) {
          console.log(`      First item: ${categoryItems[0].name} (category_id: ${categoryItems[0].category_id}, type: ${typeof categoryItems[0].category_id})`);
        }
      });

      // Simulate API response
      const menu = categories.map((category) => {
        const categoryItems = items.filter((item) => item.category_id == category.id);
        return {
          id: category.id,
          name: category.name,
          items: categoryItems.map(item => ({
            id: item.id,
            name: item.name
          }))
        };
      });

      console.log(`\n📦 API would return ${menu.length} categories`);
      const categoriesWithItems = menu.filter(cat => cat.items.length > 0);
      console.log(`   Categories with items: ${categoriesWithItems.length}`);
      
      if (categoriesWithItems.length === 0) {
        console.log(`\n⚠️  PROBLEM: No categories have items!`);
        console.log(`\nChecking for type mismatch...`);
        items.slice(0, 3).forEach(item => {
          console.log(`   Item ${item.id}: category_id = ${item.category_id} (type: ${typeof item.category_id})`);
        });
        categories.slice(0, 3).forEach(cat => {
          console.log(`   Category ${cat.id}: id = ${cat.id} (type: ${typeof cat.id})`);
        });
      }

      db.close();
    });
  });
});

