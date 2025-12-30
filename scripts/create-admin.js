const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function createAdmin() {
  const db = new sqlite3.Database(path.join(__dirname, '../juice_website.db'));

  // Check if admin exists
  db.get('SELECT COUNT(*) as count FROM admins', async (err, result) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    if (result.count > 0) {
      console.log('❌ Admin already exists!');
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
}

createAdmin();

