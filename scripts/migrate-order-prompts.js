const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

console.log('🗄️  Migrating database to add order_prompts tables...\n');
console.log(`📁 Database path: ${dbPath}\n`);

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Create order_prompts table
db.run(`
  CREATE TABLE IF NOT EXISTS order_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    prompt_type TEXT NOT NULL DEFAULT 'additional_items',
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    show_on_all_products BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating order_prompts table:', err.message);
    db.close();
    process.exit(1);
  } else {
    console.log('✅ Table created: order_prompts');
    
    // Create order_prompt_products table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_prompt_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_id INTEGER NOT NULL,
        menu_item_id INTEGER,
        product_name TEXT,
        product_price REAL DEFAULT 0,
        volume_option TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prompt_id) REFERENCES order_prompts (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating order_prompt_products table:', err.message);
        db.close();
        process.exit(1);
      } else {
        console.log('✅ Table created: order_prompt_products');
        console.log('\n✨ Migration complete!');
        db.close();
      }
    });
  }
});

