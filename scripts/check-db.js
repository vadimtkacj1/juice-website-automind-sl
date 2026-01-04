const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

console.log('🔍 Checking database...');
console.log(`📁 Database path: ${dbPath}`);
console.log('');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file does not exist!');
  console.log('💡 Run: node scripts/init-database.js');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Database connection successful');
  console.log('');

  // Check admins table
  db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
    if (err) {
      console.error('❌ Error checking admins table:', err.message);
      console.log('💡 Run: node scripts/init-database.js');
    } else {
      console.log(`📊 Admin users in database: ${row.count}`);
      if (row.count === 0) {
        console.log('⚠️  No admin users found!');
        console.log('💡 Run: node scripts/create-admin.js');
      } else {
        // List admin usernames
        db.all('SELECT username, email FROM admins', (err, admins) => {
          if (!err && admins.length > 0) {
            console.log('👤 Admin users:');
            admins.forEach(admin => {
              console.log(`   - ${admin.username} (${admin.email || 'no email'})`);
            });
          }
        });
      }
    }
    console.log('');

    // Check menu items
    db.get('SELECT COUNT(*) as count FROM menu_items WHERE is_available = 1', (err, row) => {
      if (err) {
        console.error('❌ Error checking menu items:', err.message);
      } else {
        console.log(`📋 Available menu items: ${row.count}`);
        if (row.count > 0) {
          console.log('💡 To hide items, set is_available = 0 in the admin panel');
        }
      }
      console.log('');

      // Check menu categories
      db.get('SELECT COUNT(*) as count FROM menu_categories WHERE is_active = 1', (err, row) => {
        if (err) {
          console.error('❌ Error checking categories:', err.message);
        } else {
          console.log(`📁 Active menu categories: ${row.count}`);
        }
        
        db.close();
        console.log('');
        console.log('✅ Database check complete!');
      });
    });
  });
});
