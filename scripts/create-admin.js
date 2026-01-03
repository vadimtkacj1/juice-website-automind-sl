const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

async function createAdmin() {
  // Support environment variable for database path (useful for Docker)
  const dbPath = process.env.DATABASE_PATH 
    ? process.env.DATABASE_PATH 
    : path.join(__dirname, '../juice_website.db');
  
  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new sqlite3.Database(dbPath);

  // Check if admins table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'", async (err, table) => {
    if (err) {
      console.error('❌ Error checking for admins table:', err.message);
      console.error(`   Database path: ${dbPath}`);
      db.close();
      return;
    }

    if (!table) {
      console.error('❌ Admins table does not exist!');
      console.error(`   Database path: ${dbPath}`);
      console.error('💡 Please run: node scripts/init-database.js first');
      db.close();
      return;
    }

    // Check if admin exists
    db.get('SELECT COUNT(*) as count FROM admins', async (err, result) => {
      if (err) {
        console.error('❌ Error checking for admin:', err.message);
        db.close();
        return;
      }

      if (result.count > 0) {
        console.log('⚠️  Admin already exists!');
        console.log('💡 To reset password, run: node scripts/reset-admin-password.js');
        db.close();
        return;
      }

    // Create default admin
    const username = 'admin';
    const password = 'admin123'; // Change this!
    const email = 'admin@juicewebsite.com';
    
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email],
      function(err) {
        if (err) {
          console.error('Error creating admin:', err);
        } else {
          console.log('✅ Admin created successfully!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Username: ' + username);
          console.log('Password: ' + password);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('⚠️  IMPORTANT: Change the password after first login!');
        }
        db.close();
      }
    );
    });
  });
}

createAdmin();

