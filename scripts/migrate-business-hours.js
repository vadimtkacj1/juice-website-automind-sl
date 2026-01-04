const getDatabase = require('../lib/database');

console.log('🗄️  Migrating database to add business_hours table...\n');

const db = getDatabase();

if (!db) {
  console.error('❌ Error connecting to database');
  process.exit(1);
}

console.log('✅ Connected to database');

// Create business_hours table
db.run(`
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
`, (err) => {
  if (err) {
    console.error('❌ Error creating business_hours table:', err.message);
    if (db.close) db.close();
    process.exit(1);
  } else {
    console.log('✅ Table created: business_hours');
    console.log('\n✨ Migration complete!');
    if (db.close) db.close();
  }
});
