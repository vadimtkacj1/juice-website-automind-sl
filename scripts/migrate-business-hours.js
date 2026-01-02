const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

console.log('🗄️  Migrating database to add business_hours table...\n');
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

// Create business_hours table
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
  if (err) {
    console.error('❌ Error creating business_hours table:', err.message);
    db.close();
    process.exit(1);
  } else {
    console.log('✅ Table created: business_hours');
    console.log('\n✨ Migration complete!');
    db.close();
  }
});

