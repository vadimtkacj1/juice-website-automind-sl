const bcrypt = require('bcryptjs');
const getDatabase = require('../lib/database');

async function createAdmin() {
  const db = getDatabase();
  
  if (!db) {
    console.error('❌ Error: Could not connect to database');
    console.error('Please check your MySQL configuration in environment variables');
    process.exit(1);
  }

  // Check if admin exists
  return new Promise((resolve) => {
    db.all('SELECT COUNT(*) as count FROM admins', [], async (err, result) => {
      if (err) {
        console.error('Error:', err);
        if (db.close) db.close();
        process.exit(1);
        return;
      }

      const count = result && result.length > 0 ? result[0].count : 0;
      
      if (count > 0) {
        console.log('❌ Admin already exists!');
        if (db.close) db.close();
        process.exit(0);
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
            if (db.close) db.close();
            process.exit(1);
            return;
          }
          console.log('✅ Admin created successfully!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Username: ' + username);
          console.log('Password: ' + password);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('⚠️  IMPORTANT: Change the password after first login!');
          if (db.close) db.close();
          process.exit(0);
        }
      );
    });
  });
}

createAdmin();
