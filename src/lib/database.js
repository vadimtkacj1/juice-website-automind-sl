const mysql = require('mysql2/promise');

// Пользуемся globalThis для сохранения пула при Hot Reload в Next.js
globalThis.pool = globalThis.pool || null;
globalThis.dbInitPromise = globalThis.dbInitPromise || null;
globalThis.tablesInitialized = globalThis.tablesInitialized || false;

async function ensureDatabaseExists() {
  const dbName = process.env.MYSQL_DATABASE || 'juice_website';
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
    const [databases] = await tempPool.query(`SHOW DATABASES LIKE ?`, [dbName]);
    if (databases.length === 0) {
      await tempPool.query(`CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, [dbName]);
      console.log(`✅ Database ${dbName} created successfully`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    throw err;
  } finally {
    await tempPool.end();
  }
}

function getDatabase() {
  if (globalThis.pool && globalThis.tablesInitialized) {
    return createDatabaseWrapper(globalThis.pool);
  }
  const dbName = process.env.MYSQL_DATABASE || 'juice_website';
  if (!globalThis.dbInitPromise) {
    globalThis.dbInitPromise = (async () => {
      try {
        await ensureDatabaseExists();
        const config = {
          host: process.env.MYSQL_HOST || 'localhost',
          port: parseInt(process.env.MYSQL_PORT || '3306'),
          user: process.env.MYSQL_USER || 'root',
          password: process.env.MYSQL_PASSWORD || '',
          database: dbName,
          waitForConnections: true,
          connectionLimit: 10,
          charset: 'utf8mb4',
        };
        if (!globalThis.pool) globalThis.pool = mysql.createPool(config);
        if (!globalThis.tablesInitialized) {
          await initializeTables(globalThis.pool);
          globalThis.tablesInitialized = true;
          console.log('✅ Database tables initialized successfully');
        }
      } catch (err) {
        console.error('Error during database initialization:', err.message);
      }
    })();
  }
  return createDatabaseWrapper(globalThis.pool || mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: dbName
  }));
}

function createDatabaseWrapper(pool) {
  return {
    get: (sql, params, callback) => {
      if (typeof params === 'function') { callback = params; params = []; }
      pool.query(convertSQLiteToMySQL(sql), params || []).then(([rows]) => callback(null, rows[0])).catch(callback);
    },
    all: (sql, params, callback) => {
      if (typeof params === 'function') { callback = params; params = []; }
      pool.query(convertSQLiteToMySQL(sql), params || []).then(([rows]) => callback(null, rows)).catch(callback);
    },
    run: function(sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      pool.query(convertSQLiteToMySQL(sql), params || []).then(([res]) => callback.call({lastID: res.insertId, changes: res.affectedRows}, null)).catch(callback);
    },
    serialize: (cb) => cb && cb(),
    prepare: (sql) => ({
      run: (...args) => {
        const cb = args.find(a => typeof a === 'function');
        const p = args.filter(a => typeof a !== 'function');
        pool.query(convertSQLiteToMySQL(sql), p).then(([res]) => cb && cb.call({lastID: res.insertId}, null)).catch(cb);
      },
      finalize: (cb) => cb && cb()
    }),
    close: (cb) => cb && setImmediate(() => cb(null)),
    pool: pool
  };
}

function convertSQLiteToMySQL(sql) {
  if (!sql) return sql;
  let q = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
            .replace(/PRIMARY KEY AUTOINCREMENT/gi, 'AUTO_INCREMENT PRIMARY KEY')
            .replace(/\bREAL\b/gi, 'DECIMAL(10,2)')
            .replace(/\bBOOLEAN\b/gi, 'TINYINT(1)')
            .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            .replace(/datetime\s*\(\s*['"]now['"]\s*\)/gi, 'NOW()');
  return q;
}

async function initializeTables(pool) {
  const t = async (sql) => {
    try { await pool.query(sql); } catch (e) {
      if (e.code !== 'ER_TABLE_EXISTS_ERROR' && !e.message.includes('already exists')) throw e;
    }
  };

  // Порядок важен из-за Foreign Keys
  await t(`CREATE TABLE IF NOT EXISTS menu_categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, image TEXT, sort_order INT DEFAULT 0, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);
  
  await t(`CREATE TABLE IF NOT EXISTS menu_items (id INT AUTO_INCREMENT PRIMARY KEY, category_id INT NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, volume VARCHAR(100), image TEXT, discount_percent DECIMAL(10,2) DEFAULT 0, is_available TINYINT(1) DEFAULT 1, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(191) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, email VARCHAR(191), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS custom_ingredients (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, price DECIMAL(10,2) DEFAULT 0, image TEXT, ingredient_category VARCHAR(191) DEFAULT 'fruits', is_available TINYINT(1) DEFAULT 1, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS ingredient_groups (id INT AUTO_INCREMENT PRIMARY KEY, name_he VARCHAR(255) NOT NULL, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, customer_name VARCHAR(255) NOT NULL, customer_email VARCHAR(191), customer_phone VARCHAR(50), delivery_address TEXT, total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'pending', payment_method VARCHAR(50), notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, menu_item_id INT NOT NULL, item_name VARCHAR(255) NOT NULL, quantity INT NOT NULL, price DECIMAL(10,2) NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS promo_codes (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(191) NOT NULL UNIQUE, discount_type VARCHAR(50) NOT NULL, discount_value DECIMAL(10,2) NOT NULL, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS ingredient_group_custom_ingredients (id INT AUTO_INCREMENT PRIMARY KEY, ingredient_group_id INT NOT NULL, custom_ingredient_id INT NOT NULL, sort_order INT DEFAULT 0, FOREIGN KEY (ingredient_group_id) REFERENCES ingredient_groups(id) ON DELETE CASCADE, FOREIGN KEY (custom_ingredient_id) REFERENCES custom_ingredients(id) ON DELETE CASCADE) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS locations (id INT AUTO_INCREMENT PRIMARY KEY, country VARCHAR(100), city VARCHAR(100), address VARCHAR(255), hours VARCHAR(255), is_active TINYINT(1) DEFAULT 1) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS news (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, image TEXT, is_active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);

  await t(`CREATE TABLE IF NOT EXISTS business_hours (id INT AUTO_INCREMENT PRIMARY KEY, day_of_week VARCHAR(20), open_time VARCHAR(20), close_time VARCHAR(20), is_active TINYINT(1) DEFAULT 1) ENGINE=InnoDB`);

  console.log('✅ All tables initialized successfully');
}

module.exports = getDatabase;