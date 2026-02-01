#!/usr/bin/env node
/**
 * Reset Database Script
 * This script will reset the entire database and create a new admin user
 * Usage: node scripts/reset-database.js [username] [password] [email]
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Juice Website - Database Reset Script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  WARNING: This will DELETE ALL DATA in the database!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const confirm = await question('Are you sure you want to continue? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  // Get admin credentials
  const username = process.argv[2] || await question('\n👤 Admin Username (default: admin): ') || 'admin';
  const password = process.argv[3] || await question('🔒 Admin Password (default: JuiceAdmin2026!): ') || 'JuiceAdmin2026!';
  const email = process.argv[4] || await question('📧 Admin Email (default: admin@juice-website.com): ') || 'admin@juice-website.com';

  rl.close();

  console.log('\n🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('🔌 Connecting to database...');

  const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'juice_website',
    charset: 'utf8mb4'
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Drop tables in reverse order
    console.log('🗑️  Dropping existing tables...');
    const dropTables = [
      'ingredient_group_custom_ingredients',
      'order_items',
      'orders',
      'promo_codes',
      'menu_items',
      'menu_category_volumes',
      'custom_ingredients',
      'ingredient_groups',
      'menu_categories',
      'admins',
      'locations',
      'news',
      'business_hours'
    ];

    for (const table of dropTables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`  ✓ Dropped ${table}`);
      } catch (err) {
        console.log(`  ⚠ Could not drop ${table}: ${err.message}`);
      }
    }

    // Create tables
    console.log('\n📦 Creating tables...');

    const createTableQueries = [
      `CREATE TABLE \`menu_categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`image\` TEXT,
        \`sort_order\` INT DEFAULT 0,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`menu_category_volumes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`category_id\` INT NOT NULL,
        \`volume\` VARCHAR(100) NOT NULL,
        \`is_default\` TINYINT(1) DEFAULT 0,
        \`sort_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`category_id\`) REFERENCES \`menu_categories\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`menu_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`category_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`volume\` VARCHAR(100),
        \`image\` TEXT,
        \`discount_percent\` DECIMAL(10,2) DEFAULT 0,
        \`is_available\` TINYINT(1) DEFAULT 1,
        \`sort_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`category_id\`) REFERENCES \`menu_categories\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(191) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(191),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`custom_ingredients\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`price\` DECIMAL(10,2) DEFAULT 0,
        \`image\` TEXT,
        \`ingredient_category\` VARCHAR(191) DEFAULT 'fruits',
        \`is_available\` TINYINT(1) DEFAULT 1,
        \`sort_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`ingredient_groups\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name_he\` VARCHAR(255) NOT NULL,
        \`sort_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`orders\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`customer_name\` VARCHAR(255) NOT NULL,
        \`customer_email\` VARCHAR(191),
        \`customer_phone\` VARCHAR(50),
        \`delivery_address\` TEXT,
        \`total_amount\` DECIMAL(10,2) NOT NULL,
        \`status\` VARCHAR(50) DEFAULT 'pending',
        \`payment_method\` VARCHAR(50),
        \`notes\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` INT NOT NULL,
        \`menu_item_id\` INT NOT NULL,
        \`item_name\` VARCHAR(255) NOT NULL,
        \`quantity\` INT NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`promo_codes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(191) NOT NULL UNIQUE,
        \`discount_type\` VARCHAR(50) NOT NULL,
        \`discount_value\` DECIMAL(10,2) NOT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`ingredient_group_custom_ingredients\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`ingredient_group_id\` INT NOT NULL,
        \`custom_ingredient_id\` INT NOT NULL,
        \`sort_order\` INT DEFAULT 0,
        FOREIGN KEY (\`ingredient_group_id\`) REFERENCES \`ingredient_groups\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`custom_ingredient_id\`) REFERENCES \`custom_ingredients\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`locations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`country\` VARCHAR(100),
        \`city\` VARCHAR(100),
        \`address\` VARCHAR(255),
        \`hours\` VARCHAR(255),
        \`is_active\` TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`news\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`content\` TEXT NOT NULL,
        \`image\` TEXT,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE \`business_hours\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`day_of_week\` VARCHAR(20),
        \`open_time\` VARCHAR(20),
        \`close_time\` VARCHAR(20),
        \`is_active\` TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (const query of createTableQueries) {
      await connection.query(query);
      const tableName = query.match(/CREATE TABLE `(\w+)`/)[1];
      console.log(`  ✓ Created ${tableName}`);
    }

    // Insert admin
    console.log('\n👤 Creating admin user...');
    await connection.query(
      'INSERT INTO `admins` (`username`, `password`, `email`, `created_at`) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [username, hashedPassword, email]
    );
    console.log('  ✓ Admin user created');

    // Insert initial data
    console.log('\n📝 Inserting initial data...');

    // Business hours
    await connection.query(`
      INSERT INTO \`business_hours\` (\`day_of_week\`, \`open_time\`, \`close_time\`, \`is_active\`) VALUES
      ('Sunday', '08:00', '22:00', 1),
      ('Monday', '08:00', '22:00', 1),
      ('Tuesday', '08:00', '22:00', 1),
      ('Wednesday', '08:00', '22:00', 1),
      ('Thursday', '08:00', '22:00', 1),
      ('Friday', '08:00', '23:00', 1),
      ('Saturday', '09:00', '23:00', 1)
    `);
    console.log('  ✓ Business hours inserted');

    // Sample promo codes
    await connection.query(`
      INSERT INTO \`promo_codes\` (\`code\`, \`discount_type\`, \`discount_value\`, \`is_active\`, \`created_at\`) VALUES
      ('WELCOME2026', 'percentage', 10.00, 1, CURRENT_TIMESTAMP),
      ('FIRST20', 'percentage', 20.00, 1, CURRENT_TIMESTAMP)
    `);
    console.log('  ✓ Promo codes inserted');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database reset completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);
    console.log(`   Created: ${new Date().toISOString()}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();
