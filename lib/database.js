const mysql = require('mysql2/promise');

// Use globalThis to persist across hot module reloads in Next.js dev mode
globalThis.pool = globalThis.pool || null;
globalThis.dbInitPromise = globalThis.dbInitPromise || null;
globalThis.tablesInitialized = globalThis.tablesInitialized || false;

let pool = globalThis.pool;
let dbInitPromise = globalThis.dbInitPromise;
let tablesInitialized = globalThis.tablesInitialized;

async function ensureDatabaseExists() {
  const dbName = process.env.MYSQL_DATABASE || 'juice_website';
  
  // Create a connection without specifying database
  const tempConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 1,
  };
  
  const tempPool = mysql.createPool(tempConfig);
  
  try {
    // Check if database exists
    const [databases] = await tempPool.query(`SHOW DATABASES LIKE ?`, [dbName]);
    
    if (databases.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await tempPool.query(`CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, [dbName]);
      console.log(`✅ Database ${dbName} created successfully`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    throw err;
  } finally {
    await tempPool.end();
  }
}

function getDatabase() {
  // If pool exists and tables are initialized, return immediately
  if (globalThis.pool && globalThis.tablesInitialized) {
    return createDatabaseWrapper(globalThis.pool);
  }

  const dbName = process.env.MYSQL_DATABASE || 'juice_website';

  // Start initialization if not already started
  if (!globalThis.dbInitPromise) {
    globalThis.dbInitPromise = (async () => {
      try {
        // First ensure database exists
        await ensureDatabaseExists();

        // Now create the main pool with database
        const config = {
          host: process.env.MYSQL_HOST || 'localhost',
          port: parseInt(process.env.MYSQL_PORT || '3306'),
          user: process.env.MYSQL_USER || 'root',
          password: process.env.MYSQL_PASSWORD || '',
          database: dbName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          charset: 'utf8mb4',
        };

        if (!globalThis.pool) {
          globalThis.pool = mysql.createPool(config);
          console.log('Connected to MySQL database.');
        }

        // Initialize tables only if not already initialized
        // And only if not in development mode (to prevent re-init on every HMR)
        if (!globalThis.tablesInitialized && process.env.NODE_ENV !== 'development') {
          await initializeTables(globalThis.pool);
          globalThis.tablesInitialized = true;
          console.log('✅ Database tables initialized successfully');
        } else if (!globalThis.tablesInitialized) {
          // In development, we ensure tables are there, but don't log on every run
          // The ensureDatabaseExists already logs if database is created.
          // We can add a more silent check for tables if needed.
          console.log('Tables initialization skipped in development mode (assuming they exist).');
          globalThis.tablesInitialized = true; // Assume tables are initialized for dev
        }
      } catch (err) {
        console.error('Error during database initialization:', err.message);
        // Try to create pool anyway (database might exist, just connection issue)
        if (!globalThis.pool) {
          const config = {
            host: process.env.MYSQL_HOST || 'localhost',
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4',
          };
          try {
            globalThis.pool = mysql.createPool(config);
            console.log('Connected to MySQL database (continuing despite initialization errors).');
          } catch (poolErr) {
            console.error('Failed to create connection pool:', poolErr.message);
          }
        }
      }
    })();
  }

  // If pool doesn't exist yet, create it immediately (will be ready after initialization)
  // This ensures that synchronous calls to getDatabase don't return null
  if (!globalThis.pool) {
    const config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    };
    globalThis.pool = mysql.createPool(config);
  }

  // Wait for initialization to complete before returning
  if (globalThis.dbInitPromise) {
    // Don't await here as this is sync function, but ensure it runs
    globalThis.dbInitPromise.catch(() => {
      // Errors already logged in promise
    });
  }

  return createDatabaseWrapper(globalThis.pool);
}

// Create a wrapper that provides SQLite-compatible API
function createDatabaseWrapper(pool) {
  return {
    // SQLite-style get() - returns single row
    get: function(sql, params, callback) {
      const query = convertSQLiteToMySQL(sql);
      pool.query(query, params || [])
        .then(([rows]) => {
          if (typeof callback === 'function') {
            callback(null, rows.length > 0 ? rows[0] : undefined);
          }
        })
        .catch((err) => {
          if (typeof callback === 'function') {
            callback(err, null);
          } else {
            throw err;
          }
        });
    },

    // SQLite-style all() - returns all rows
    all: function(sql, params, callback) {
      const query = convertSQLiteToMySQL(sql);
      pool.query(query, params || [])
        .then(([rows]) => {
          if (typeof callback === 'function') {
            callback(null, rows);
          }
        })
        .catch((err) => {
          if (typeof callback === 'function') {
            callback(err, null);
          } else {
            throw err;
          }
        });
    },

    // SQLite-style run() - for INSERT/UPDATE/DELETE
    run: function(sql, params, callback) {
      const query = convertSQLiteToMySQL(sql);
      pool.query(query, params || [])
        .then(([result]) => {
          const context = {
            lastID: result.insertId || 0,
            changes: result.affectedRows || 0,
          };
          if (typeof callback === 'function') {
            // SQLite style: callback(err, this) where 'this' is the context
            // Call with context as 'this' for compatibility
            callback.call(context, null);
          }
        })
        .catch((err) => {
          if (typeof callback === 'function') {
            callback.call(null, err);
          } else {
            throw err;
          }
        });
    },

    // SQLite-style serialize() - execute sequentially
    serialize: function(callback) {
      if (callback) callback();
    },

    // SQLite-style prepare() - create prepared statement
    prepare: function(sql, callback) {
      const query = convertSQLiteToMySQL(sql);
      const stmt = {
        run: function(...args) {
          // SQLite style: run(param1, param2, ..., callback)
          // Find callback (last function argument) and params (everything else)
          let callback = null;
          const params = [];
          
          for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'function') {
              callback = args[i];
            } else {
              params.push(args[i]);
            }
          }
          
          pool.query(query, params)
            .then(([result]) => {
              const context = {
                lastID: result.insertId || 0,
                changes: result.affectedRows || 0,
              };
              // Make context available as 'this' for compatibility
              if (typeof callback === 'function') {
                callback.call(context, null, context);
              }
            })
            .catch((err) => {
              if (typeof callback === 'function') {
                callback.call(null, err, null);
              } else {
                throw err;
              }
            });
        },
        finalize: function(callback) {
          if (typeof callback === 'function') {
            callback();
          }
        }
      };
      
      // If callback provided (SQLite style), call it
      if (typeof callback === 'function') {
        setImmediate(callback);
      }
      
      return stmt;
    },

    // Close connection (SQLite-style)
    close: function(callback) {
      // For MySQL connection pools, we don't actually close the pool
      // as it's shared. The pool will be cleaned up when process exits.
      // For scripts, we just call the callback immediately.
      if (typeof callback === 'function') {
        // Use setImmediate to ensure callback is async
        setImmediate(() => {
          try {
            callback(null);
          } catch (err) {
            // Ignore callback errors
          }
        });
      }
      // Note: We don't actually close the pool here to avoid issues
      // The pool will be garbage collected when the process exits
    },

    // Direct MySQL pool access for advanced usage
    pool: pool,
  };
}

// Convert SQLite SQL to MySQL SQL
function convertSQLiteToMySQL(sql) {
  if (!sql) return sql;
  
  let query = sql;
  
  // Replace INTEGER PRIMARY KEY AUTOINCREMENT with AUTO_INCREMENT
  query = query.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY');
  
  // Replace PRIMARY KEY AUTOINCREMENT (standalone)
  query = query.replace(/PRIMARY KEY AUTOINCREMENT/gi, 'AUTO_INCREMENT PRIMARY KEY');
  
  // Replace AUTOINCREMENT (standalone)
  query = query.replace(/AUTOINCREMENT/gi, 'AUTO_INCREMENT');
  
  // Replace TEXT with VARCHAR or TEXT depending on context
  // This is a simple replacement - you may need to adjust
  query = query.replace(/\bTEXT\b/gi, 'TEXT');
  
  // Replace REAL with DECIMAL
  query = query.replace(/\bREAL\b/gi, 'DECIMAL(10,2)');
  
  // Replace BOOLEAN with TINYINT(1)
  query = query.replace(/\bBOOLEAN\b/gi, 'TINYINT(1)');
  
  // Replace DATETIME DEFAULT CURRENT_TIMESTAMP with TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  query = query.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  
  // Replace SQLite string concatenation (||) with MySQL CONCAT()
  // This handles patterns like: col1 || ' x' || col2
  query = query.replace(/(\w+)\s*\|\|\s*([^|]+)/g, (match, col1, rest) => {
    // Split by || and join with CONCAT
    const parts = match.split(/\s*\|\|\s*/);
    if (parts.length > 1) {
      return `CONCAT(${parts.join(', ')})`;
    }
    return match;
  });

  // Replace SQLite datetime('now') with MySQL NOW()
  query = query.replace(/datetime\s*\(\s*['"]now['"]\s*\)/gi, 'NOW()');

  // Remove IF NOT EXISTS from ALTER TABLE (MySQL doesn't support it the same way)
  // We'll handle this in the initialization code instead

  return query;
}

// Initialize all tables
async function initializeTables(pool) {
  try {
    const dbName = process.env.MYSQL_DATABASE || 'juice_website';
    
    // Database should already exist at this point (created in ensureDatabaseExists)
    // But let's make sure we're using it
    try {
      await pool.query(`USE ??`, [dbName]);
    } catch (err) {
      throw new Error(`Cannot use database '${dbName}'. Please ensure it exists and check your MySQL credentials.`);
    }

    // Create tables
    await createTable(pool, 'menu_categories', `
      CREATE TABLE IF NOT EXISTS menu_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'menu_items', `
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        volume TEXT,
        image TEXT,
        discount_percent DECIMAL(10,2) DEFAULT 0,
        is_available TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'contacts', `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        label TEXT,
        description TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Add label and description columns if they don't exist
    await addColumnIfNotExists(pool, 'contacts', 'label', 'TEXT');
    await addColumnIfNotExists(pool, 'contacts', 'description', 'TEXT');

    await createTable(pool, 'locations', `
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        hours TEXT,
        phone TEXT,
        email TEXT,
        image TEXT,
        map_url TEXT,
        show_map_button TINYINT(1) DEFAULT 1,
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(pool, 'locations', 'show_map_button', 'TINYINT(1) DEFAULT 1');

    await createTable(pool, 'admins', `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'orders', `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        delivery_address TEXT,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(pool, 'orders', 'delivery_address', 'TEXT');

    await createTable(pool, 'pending_orders', `
      CREATE TABLE IF NOT EXISTS pending_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_token TEXT NOT NULL UNIQUE,
        order_data TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_uid TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'order_items', `
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        item_name TEXT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'discounts', `
      CREATE TABLE IF NOT EXISTS discounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        category_id INT,
        menu_item_id INT,
        is_active TINYINT(1) DEFAULT 1,
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'promo_codes', `
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        usage_limit INT,
        used_count INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'addons', `
      CREATE TABLE IF NOT EXISTS addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        is_available TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'custom_ingredients', `
      CREATE TABLE IF NOT EXISTS custom_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        image TEXT,
        ingredient_category TEXT DEFAULT 'fruits',
        is_available TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(pool, 'custom_ingredients', 'ingredient_category', "TEXT DEFAULT 'fruits'");

    await createTable(pool, 'menu_item_additional_items', `
      CREATE TABLE IF NOT EXISTS menu_item_additional_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_item_id INT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        is_available TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'menu_item_custom_ingredients', `
      CREATE TABLE IF NOT EXISTS menu_item_custom_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_item_id INT NOT NULL,
        custom_ingredient_id INT NOT NULL,
        selection_type TEXT DEFAULT 'multiple',
        price_override DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients(id) ON DELETE CASCADE,
        UNIQUE KEY unique_item_ingredient (menu_item_id, custom_ingredient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(pool, 'menu_item_custom_ingredients', 'selection_type', "TEXT DEFAULT 'multiple'");
    await addColumnIfNotExists(pool, 'menu_item_custom_ingredients', 'price_override', 'DECIMAL(10,2)');

    await createTable(pool, 'menu_category_custom_ingredients', `
      CREATE TABLE IF NOT EXISTS menu_category_custom_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        custom_ingredient_id INT NOT NULL,
        selection_type TEXT DEFAULT 'multiple',
        price_override DECIMAL(10,2),
        volume_prices TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients(id) ON DELETE CASCADE,
        UNIQUE KEY unique_category_ingredient (category_id, custom_ingredient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(pool, 'menu_category_custom_ingredients', 'volume_prices', 'TEXT');

    // Create volumes tables (these depend on menu_categories, menu_items, custom_ingredients)
    // Note: These may fail if parent tables don't exist yet, but that's OK - they'll be created on next run
    try {
      await createTable(pool, 'menu_category_volumes', `
        CREATE TABLE IF NOT EXISTS menu_category_volumes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          volume TEXT NOT NULL,
          is_default TINYINT(1) DEFAULT 0,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
          UNIQUE KEY unique_category_volume (category_id, volume(255))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (err) {
      // If foreign key constraint fails, create without foreign key (will add later if needed)
      if (err.code === 'ER_CANNOT_ADD_FOREIGN') {
        console.warn('Warning: Could not create menu_category_volumes with foreign key. Creating without foreign key constraint.');
        await createTable(pool, 'menu_category_volumes', `
          CREATE TABLE IF NOT EXISTS menu_category_volumes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            volume TEXT NOT NULL,
            is_default TINYINT(1) DEFAULT 0,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_category_volume (category_id, volume(255))
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      }
    }

    try {
      await createTable(pool, 'menu_item_volumes', `
        CREATE TABLE IF NOT EXISTS menu_item_volumes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          menu_item_id INT NOT NULL,
          volume TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          is_default TINYINT(1) DEFAULT 0,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
          UNIQUE KEY unique_item_volume (menu_item_id, volume(255))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (err) {
      if (err.code === 'ER_CANNOT_ADD_FOREIGN') {
        console.warn('Warning: Could not create menu_item_volumes with foreign key. Creating without foreign key constraint.');
        await createTable(pool, 'menu_item_volumes', `
          CREATE TABLE IF NOT EXISTS menu_item_volumes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            menu_item_id INT NOT NULL,
            volume TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            is_default TINYINT(1) DEFAULT 0,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_item_volume (menu_item_id, volume(255))
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      }
    }

    try {
      await createTable(pool, 'ingredient_volumes', `
        CREATE TABLE IF NOT EXISTS ingredient_volumes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          custom_ingredient_id INT NOT NULL,
          volume TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          is_default TINYINT(1) DEFAULT 0,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients(id) ON DELETE CASCADE,
          UNIQUE KEY unique_ingredient_volume (custom_ingredient_id, volume(255))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (err) {
      if (err.code === 'ER_CANNOT_ADD_FOREIGN') {
        console.warn('Warning: Could not create ingredient_volumes with foreign key. Creating without foreign key constraint.');
        await createTable(pool, 'ingredient_volumes', `
          CREATE TABLE IF NOT EXISTS ingredient_volumes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            custom_ingredient_id INT NOT NULL,
            volume TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            is_default TINYINT(1) DEFAULT 0,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_ingredient_volume (custom_ingredient_id, volume(255))
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      }
    }

    await createTable(pool, 'telegram_bot_settings', `
      CREATE TABLE IF NOT EXISTS telegram_bot_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bot_id TEXT,
        api_token TEXT,
        is_enabled TINYINT(1) DEFAULT 0,
        reminder_interval_minutes INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'telegram_couriers', `
      CREATE TABLE IF NOT EXISTS telegram_couriers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        telegram_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'order_telegram_notifications', `
      CREATE TABLE IF NOT EXISTS order_telegram_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        courier_telegram_id TEXT,
        status TEXT DEFAULT 'pending',
        assigned_at TIMESTAMP NULL,
        delivered_at TIMESTAMP NULL,
        last_reminder_at TIMESTAMP NULL,
        last_notification_sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'order_prompts', `
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
    `);

    await createTable(pool, 'order_prompt_products', `
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
    `);

    await createTable(pool, 'business_hours', `
      CREATE TABLE IF NOT EXISTS business_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        day_of_week TEXT NOT NULL,
        open_time TEXT NOT NULL,
        close_time TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await createTable(pool, 'news', `
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('All tables initialized successfully');
  } catch (err) {
    console.error('Error initializing tables:', err);
    throw err;
  }
}

async function createTable(pool, tableName, sql) {
  try {
    await pool.query(sql);
    // Only log if we're in verbose mode or if table was actually created
    // In production, we can skip this log to reduce noise
    if (process.env.VERBOSE_DB_INIT === 'true') {
      console.log(`Table created/verified: ${tableName}`);
    }
  } catch (err) {
    // Ignore "table already exists" errors
    if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message.includes('already exists')) {
      // Table exists, that's fine
      return;
    }
    // Re-throw other errors so they can be handled by caller
    throw err;
  }
}

async function addColumnIfNotExists(pool, tableName, columnName, columnDefinition) {
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM ?? LIKE ?`, [tableName, columnName]);
    if (columns.length === 0) {
      await pool.query(`ALTER TABLE ?? ADD COLUMN ?? ${columnDefinition}`, [tableName, columnName]);
      console.log(`Column added to ${tableName}: ${columnName}`);
    }
  } catch (err) {
    // Ignore if column already exists or table doesn't exist yet
    if (!err.message.includes('Duplicate column') && !err.message.includes("doesn't exist")) {
      console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
    }
  }
}

module.exports = getDatabase;