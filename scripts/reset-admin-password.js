const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

const newPassword = process.argv[2] || 'admin123';

console.log('🔐 Resetting admin password...');
console.log(`📁 Database path: ${dbPath}`);
console.log('');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file does not exist!');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Database connection successful');
  console.log('');

  // Get admin user
  db.get('SELECT * FROM admins WHERE username = ?', ['admin'], async (err, admin) => {
    if (err) {
      console.error('❌ Error fetching admin:', err.message);
      db.close();
      process.exit(1);
    }

    if (!admin) {
      console.error('❌ Admin user not found!');
      console.log('💡 Run: node scripts/create-admin.js');
      db.close();
      process.exit(1);
    }

    console.log(`👤 Found admin: ${admin.username}`);
    console.log(`🔑 Setting new password...`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.run(
      'UPDATE admins SET password = ? WHERE username = ?',
      [hashedPassword, 'admin'],
      function(err) {
        if (err) {
          console.error('❌ Error updating password:', err.message);
          db.close();
          process.exit(1);
        }

        console.log('✅ Password updated successfully!');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('New credentials:');
        console.log(`  Username: admin`);
        console.log(`  Password: ${newPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        
        // Test password verification
        bcrypt.compare(newPassword, hashedPassword, (err, match) => {
          if (match) {
            console.log('✅ Password verification test: PASSED');
          } else {
            console.log('❌ Password verification test: FAILED');
          }
          db.close();
        });
      }
    );
  });
});

