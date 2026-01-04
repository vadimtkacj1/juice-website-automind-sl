const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

console.log('🔧 Fixing menu visibility...\n');
console.log(`📁 Database path: ${dbPath}\n`);

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file does not exist!');
  console.error(`   Path: ${dbPath}`);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
  
  // Check current state
  db.get('SELECT COUNT(*) as count FROM menu_categories WHERE is_active = 1', [], (err, activeCats) => {
    if (err) {
      console.error('❌ Error checking active categories:', err.message);
      db.close();
      process.exit(1);
    }
    
    db.get('SELECT COUNT(*) as count FROM menu_items WHERE is_available = 1', [], (err, availableItems) => {
      if (err) {
        console.error('❌ Error checking available items:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('📊 Current State:');
      console.log(`   Active categories: ${activeCats.count}`);
      console.log(`   Available items: ${availableItems.count}\n`);
      
      // Get all categories
      db.all('SELECT id, name, is_active FROM menu_categories', [], (err, allCats) => {
        if (err) {
          console.error('❌ Error fetching categories:', err.message);
          db.close();
          process.exit(1);
        }
        
        // Get all items
        db.all('SELECT id, name, category_id, is_available FROM menu_items', [], (err, allItems) => {
          if (err) {
            console.error('❌ Error fetching items:', err.message);
            db.close();
            process.exit(1);
          }
          
          console.log(`📁 Total categories: ${allCats.length}`);
          console.log(`🍹 Total items: ${allItems.length}\n`);
          
          // Check for inactive categories
          const inactiveCats = allCats.filter(c => !c.is_active);
          if (inactiveCats.length > 0) {
            console.log(`⚠️  Found ${inactiveCats.length} inactive categories:`);
            inactiveCats.forEach(cat => {
              console.log(`   - ${cat.id}. ${cat.name} (is_active: ${cat.is_active})`);
            });
            console.log('\n🔧 Activating all categories...');
            
            db.run('UPDATE menu_categories SET is_active = 1', (err) => {
              if (err) {
                console.error('❌ Error activating categories:', err.message);
                db.close();
                process.exit(1);
              }
              console.log('✅ All categories activated\n');
              checkItems();
            });
          } else {
            console.log('✅ All categories are active\n');
            checkItems();
          }
          
          function checkItems() {
            // Check for unavailable items
            const unavailableItems = allItems.filter(i => !i.is_available);
            if (unavailableItems.length > 0) {
              console.log(`⚠️  Found ${unavailableItems.length} unavailable items:`);
              unavailableItems.slice(0, 10).forEach(item => {
                console.log(`   - ${item.id}. ${item.name} (is_available: ${item.is_available})`);
              });
              if (unavailableItems.length > 10) {
                console.log(`   ... and ${unavailableItems.length - 10} more`);
              }
              console.log('\n🔧 Activating all menu items...');
              
              db.run('UPDATE menu_items SET is_available = 1', (err) => {
                if (err) {
                  console.error('❌ Error activating items:', err.message);
                  db.close();
                  process.exit(1);
                }
                console.log('✅ All menu items activated\n');
                verifyFix();
              });
            } else {
              console.log('✅ All items are available\n');
              verifyFix();
            }
          }
          
          function verifyFix() {
            // Verify the fix
            db.get('SELECT COUNT(*) as count FROM menu_categories WHERE is_active = 1', [], (err, activeCats) => {
              if (err) {
                console.error('❌ Error verifying categories:', err.message);
                db.close();
                process.exit(1);
              }
              
              db.get('SELECT COUNT(*) as count FROM menu_items WHERE is_available = 1', [], (err, availableItems) => {
                if (err) {
                  console.error('❌ Error verifying items:', err.message);
                  db.close();
                  process.exit(1);
                }
                
                console.log('✨ Verification:');
                console.log(`   Active categories: ${activeCats.count}`);
                console.log(`   Available items: ${availableItems.count}\n`);
                
                // Check category-item matching
                db.all(`
                  SELECT mc.id, mc.name, COUNT(mi.id) as item_count
                  FROM menu_categories mc
                  LEFT JOIN menu_items mi ON mc.id = mi.category_id AND mi.is_available = 1
                  WHERE mc.is_active = 1
                  GROUP BY mc.id, mc.name
                  ORDER BY mc.sort_order
                `, [], (err, categoryItems) => {
                  if (err) {
                    console.error('❌ Error checking category-item matching:', err.message);
                    db.close();
                    process.exit(1);
                  }
                  
                  console.log('📋 Categories with items:');
                  categoryItems.forEach(cat => {
                    if (cat.item_count > 0) {
                      console.log(`   ✅ ${cat.name}: ${cat.item_count} items`);
                    } else {
                      console.log(`   ⚠️  ${cat.name}: 0 items (category active but no items)`);
                    }
                  });
                  
                  const categoriesWithItems = categoryItems.filter(c => c.item_count > 0).length;
                  console.log(`\n✨ ${categoriesWithItems} categories have items and will appear in the menu!`);
                  
                  db.close();
                });
              });
            });
          }
        });
      });
    });
  });
});



