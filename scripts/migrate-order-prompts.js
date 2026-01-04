const getDatabase = require('../lib/database');

console.log('🗄️  Migrating database to add order_prompts tables...\n');

const db = getDatabase();

if (!db) {
  console.error('❌ Error connecting to database');
  process.exit(1);
}

console.log('✅ Connected to database');

// Create order_prompts table
db.run(`
  CREATE TABLE IF NOT EXISTS order_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    prompt_type TEXT NOT NULL DEFAULT 'additional_items',
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    show_on_all_products TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`, (err) => {
  if (err) {
    console.error('❌ Error creating order_prompts table:', err.message);
    if (db.close) db.close();
    process.exit(1);
  } else {
    console.log('✅ Table created: order_prompts');
    
    // Create order_prompt_products table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_prompt_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prompt_id INT NOT NULL,
        menu_item_id INT,
        product_name TEXT,
        product_price DECIMAL(10,2) DEFAULT 0,
        volume_option TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prompt_id) REFERENCES order_prompts(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `, (err) => {
      if (err) {
        console.error('❌ Error creating order_prompt_products table:', err.message);
        if (db.close) db.close();
        process.exit(1);
      } else {
        console.log('✅ Table created: order_prompt_products');
        console.log('\n✨ Migration complete!');
        if (db.close) db.close();
      }
    });
  }
});
