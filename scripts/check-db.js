const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

console.log('🔍 Checking database...\n');
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
  
  // Check tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('❌ Error checking tables:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('📊 Tables found:', tables.length);
    tables.forEach(t => console.log(`   - ${t.name}`));
    console.log('');
    
    // Check categories
    db.get('SELECT COUNT(*) as count FROM menu_categories', [], (err, catResult) => {
      if (err) {
        console.error('❌ Error checking categories:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log(`📁 Categories: ${catResult.count}`);
      
      // Check menu items
      db.get('SELECT COUNT(*) as count FROM menu_items', [], (err, itemResult) => {
        if (err) {
          console.error('❌ Error checking menu items:', err.message);
          db.close();
          process.exit(1);
        }
        
        console.log(`🍹 Menu items: ${itemResult.count}\n`);
        
        if (catResult.count > 0) {
          console.log('📋 Category details:');
          db.all('SELECT id, name, is_active FROM menu_categories ORDER BY sort_order', [], (err, cats) => {
            if (err) {
              console.error('❌ Error fetching categories:', err.message);
              db.close();
              process.exit(1);
            }
            
            cats.forEach(cat => {
              console.log(`   ${cat.id}. ${cat.name} (active: ${cat.is_active ? 'yes' : 'no'})`);
            });
            console.log('');
            
            if (itemResult.count > 0) {
              console.log('🍹 Sample menu items (first 10):');
              db.all('SELECT id, name, price, category_id FROM menu_items LIMIT 10', [], (err, items) => {
                if (err) {
                  console.error('❌ Error fetching items:', err.message);
                  db.close();
                  process.exit(1);
                }
                
                items.forEach(item => {
                  console.log(`   ${item.id}. ${item.name} - ₪${item.price} (category: ${item.category_id})`);
                });
                
                if (itemResult.count > 10) {
                  console.log(`   ... and ${itemResult.count - 10} more items`);
                }
                
                db.close();
              });
            } else {
              console.log('⚠️  No menu items found!');
              console.log('   Run: docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-menu.js');
              db.close();
            }
          });
        } else {
          console.log('⚠️  No categories found!');
          console.log('   Run: docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js');
          db.close();
        }
      });
    });
  });
});

