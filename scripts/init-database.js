const mysql = require('mysql2/promise');
const getDatabase = require('../lib/database');

async function initDatabase() {
  console.log('🗄️  Initializing MySQL database...\n');
  
  const dbName = process.env.MYSQL_DATABASE || 'juice_website';
  
  // First, ensure database exists
  try {
    const tempConfig = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
    };
    
    const tempConnection = await mysql.createConnection(tempConfig);
    
    // Check if database exists
    const [databases] = await tempConnection.query(`SHOW DATABASES LIKE ?`, [dbName]);
    
    if (databases.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, [dbName]);
      console.log(`✅ Database ${dbName} created successfully\n`);
    } else {
      console.log(`✅ Database ${dbName} already exists\n`);
    }
    
    await tempConnection.end();
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
    console.error('Please check your MySQL configuration in environment variables:');
    console.error('  - MYSQL_HOST');
    console.error('  - MYSQL_PORT');
    console.error('  - MYSQL_USER');
    console.error('  - MYSQL_PASSWORD');
    console.error('  - MYSQL_DATABASE');
    process.exit(1);
  }
  
  // Wait a bit for database to be ready
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Now get database connection (this will initialize all tables)
  const db = getDatabase();

  if (!db) {
    console.error('❌ Error: Could not connect to database');
    process.exit(1);
  }

  // Wait a bit more for tables to be initialized
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('✅ Connected to MySQL database');
  console.log('\n✨ Database initialization complete!');
  console.log('📝 Next steps:');
  console.log('   1. npm run create-admin');
  console.log('   2. npm run seed-menu (seed menu data)');
  console.log('   3. npm run dev');

  // Close connection
  if (db.close) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

initDatabase().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
