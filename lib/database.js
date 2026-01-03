const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = null;

function getDatabase() {
  if (db) {
    return db;
  }

  // Support environment variable for database path (useful for Docker)
  // Default to /app/data/juice_website.db in Docker, or ./juice_website.db locally
  let dbPath;
  if (process.env.DATABASE_PATH) {
    dbPath = process.env.DATABASE_PATH;
  } else if (process.env.NODE_ENV === 'production' && process.cwd() === '/app') {
    // In Docker production, default to /app/data/juice_website.db
    dbPath = '/app/data/juice_website.db';
  } else {
    // Local development
    dbPath = path.join(process.cwd(), 'juice_website.db');
  }
  
  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Check if database file exists
  const dbExists = fs.existsSync(dbPath);
  if (dbExists) {
    const stats = fs.statSync(dbPath);
    console.log(`Database file exists: ${dbPath}`);
    console.log(`Database file size: ${stats.size} bytes`);
  } else {
    console.log(`Database file does not exist: ${dbPath}`);
    console.log(`Will be created on first write`);
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
      console.error('Database path attempted:', dbPath);
      db = null;
      return;
    }
    console.log('Connected to the SQLite database.');
    console.log('Database path:', dbPath);
    
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating menu_categories table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        volume TEXT,
        image TEXT,
        discount_percent REAL DEFAULT 0,
        is_available BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories (id)
      )
    `, (err) => {
      if (err) console.error('Error creating menu_items table:', err);
    });
    
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        label TEXT,
        description TEXT
      )
    `, (err) => {
      if (err) console.error('Error creating contacts table:', err);
    });
    
    // Add label and description columns if they don't exist (migration)
    db.run(`ALTER TABLE contacts ADD COLUMN label TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding label column:', err);
      }
    });
    
    db.run(`ALTER TABLE contacts ADD COLUMN description TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding description column:', err);
      }
    });
    
    db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        hours TEXT,
        phone TEXT,
        email TEXT,
        image TEXT,
        map_url TEXT,
        show_map_button BOOLEAN DEFAULT 1,
        is_active BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating locations table:', err);
    });

    // Add show_map_button column if it doesn't exist
    db.run(`
      ALTER TABLE locations ADD COLUMN show_map_button BOOLEAN DEFAULT 1
    `, (err) => {
      // Ignore error if column already exists
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating admins table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        delivery_address TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating orders table:', err);
    });

    // Create pending_orders table for temporary storage before payment
    db.run(`
      CREATE TABLE IF NOT EXISTS pending_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_token TEXT NOT NULL UNIQUE,
        order_data TEXT NOT NULL,
        total_amount REAL NOT NULL,
        payment_uid TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `, (err) => {
      if (err) console.error('Error creating pending_orders table:', err);
    });

    // Add delivery_address column if it doesn't exist (for existing databases)
    db.run(`
      ALTER TABLE orders ADD COLUMN delivery_address TEXT
    `, (err) => {
      // Ignore error if column already exists
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding delivery_address column:', err);
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      )
    `, (err) => {
      if (err) console.error('Error creating order_items table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS discounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        category_id INTEGER,
        menu_item_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        start_date DATETIME,
        end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories (id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      )
    `, (err) => {
      if (err) console.error('Error creating discounts table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        start_date DATETIME,
        end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating promo_codes table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS addons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        is_available BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating addons table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS custom_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        image TEXT,
        ingredient_category TEXT DEFAULT 'fruits',
        is_available BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating custom_ingredients table:', err);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS menu_item_additional_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        is_available BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating menu_item_additional_items table:', err);
    });

    // Add ingredient_category column if it doesn't exist
    db.run(`
      ALTER TABLE custom_ingredients 
      ADD COLUMN ingredient_category TEXT DEFAULT 'fruits'
    `, (err) => {
      // Ignore error if column already exists
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS menu_item_custom_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER NOT NULL,
        custom_ingredient_id INTEGER NOT NULL,
        selection_type TEXT DEFAULT 'multiple',
        price_override REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE,
        FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients (id) ON DELETE CASCADE,
        UNIQUE(menu_item_id, custom_ingredient_id)
      )
    `, (err) => {
      if (err) console.error('Error creating menu_item_custom_ingredients table:', err);
    });

    // Add selection_type and price_override columns if they don't exist
    db.run(`
      ALTER TABLE menu_item_custom_ingredients 
      ADD COLUMN selection_type TEXT DEFAULT 'multiple'
    `, (err) => {
      // Ignore error if column already exists
    });

    db.run(`
      ALTER TABLE menu_item_custom_ingredients 
      ADD COLUMN price_override REAL
    `, (err) => {
      // Ignore error if column already exists
    });

    // Create menu_category_custom_ingredients table for category-level ingredient associations
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_category_custom_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        custom_ingredient_id INTEGER NOT NULL,
        selection_type TEXT DEFAULT 'multiple',
        price_override REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories (id) ON DELETE CASCADE,
        FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients (id) ON DELETE CASCADE,
        UNIQUE(category_id, custom_ingredient_id)
      )
    `, (err) => {
      if (err) console.error('Error creating menu_category_custom_ingredients table:', err);
    });

    // Add volume_prices column if it doesn't exist (JSON to store prices per volume)
    db.run(`
      ALTER TABLE menu_category_custom_ingredients 
      ADD COLUMN volume_prices TEXT
    `, (err) => {
      // Ignore error if column already exists
    });

    // Create menu_category_volumes table for volume options per category
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_category_volumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        volume TEXT NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories (id) ON DELETE CASCADE,
        UNIQUE(category_id, volume)
      )
    `, (err) => {
      if (err) console.error('Error creating menu_category_volumes table:', err);
    });

    // Create menu_item_volumes table for volume options per juice
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_item_volumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER NOT NULL,
        volume TEXT NOT NULL,
        price REAL NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE,
        UNIQUE(menu_item_id, volume)
      )
    `, (err) => {
      if (err) console.error('Error creating menu_item_volumes table:', err);
    });

    // Create ingredient_volumes table for volume/weight options per ingredient
    db.run(`
      CREATE TABLE IF NOT EXISTS ingredient_volumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        custom_ingredient_id INTEGER NOT NULL,
        volume TEXT NOT NULL,
        price REAL NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients (id) ON DELETE CASCADE,
        UNIQUE(custom_ingredient_id, volume)
      )
    `, (err) => {
      if (err) console.error('Error creating ingredient_volumes table:', err);
    });

    // Telegram bot settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS telegram_bot_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id TEXT,
        api_token TEXT,
        is_enabled BOOLEAN DEFAULT 0,
        reminder_interval_minutes INTEGER DEFAULT 3,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating telegram_bot_settings table:', err);
    });

    // Telegram couriers table
    db.run(`
      CREATE TABLE IF NOT EXISTS telegram_couriers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating telegram_couriers table:', err);
    });

    // Order telegram notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_telegram_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        courier_telegram_id TEXT,
        status TEXT DEFAULT 'pending',
        assigned_at DATETIME,
        delivered_at DATETIME,
        last_reminder_at DATETIME,
        last_notification_sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating order_telegram_notifications table:', err);
    });

    // Order prompts table
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
      if (err) console.error('Error creating order_prompts table:', err);
    });

    // Order prompt products table
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
      if (err) console.error('Error creating order_prompt_products table:', err);
    });

    // Business hours table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week TEXT NOT NULL,
        open_time TEXT NOT NULL,
        close_time TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating business_hours table:', err);
    });
  });

  return db;
}

module.exports = getDatabase;
