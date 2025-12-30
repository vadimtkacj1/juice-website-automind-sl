const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'juice_website.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Migration: Update locations table to new schema
async function migrate() {
  return new Promise((resolve, reject) => {
    // Check if the table has the new columns
    db.all("PRAGMA table_info(locations)", [], (err, columns) => {
      if (err) {
        console.error('Error checking table:', err);
        reject(err);
        return;
      }

      const columnNames = columns.map(c => c.name);
      
      // If 'country' column exists, table is already migrated
      if (columnNames.includes('country')) {
        console.log('Locations table already has new schema.');
        resolve();
        return;
      }

      console.log('Migrating locations table...');
      
      // Create new table with updated schema
      db.serialize(() => {
        // Rename old table
        db.run(`ALTER TABLE locations RENAME TO locations_old`, (err) => {
          if (err && !err.message.includes('no such table')) {
            console.log('Note: Old table might not exist, creating fresh');
          }
        });

        // Create new table
        db.run(`
          CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country TEXT NOT NULL,
            city TEXT NOT NULL,
            address TEXT NOT NULL,
            hours TEXT,
            phone TEXT,
            email TEXT,
            image TEXT,
            map_url TEXT,
            is_active BOOLEAN DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Error creating new table:', err);
            reject(err);
            return;
          }
          console.log('Created new locations table.');
        });

        // Insert demo data
        const demoLocations = [
          {
            country: 'United States',
            city: 'NYC',
            address: '123 Reviva, Brewtown, USA',
            hours: 'All week: 7:00 AM - 7:00 PM',
            phone: '(123) 456-7890',
            email: 'nyc@juicefresh.com',
            image: 'https://framerusercontent.com/images/gakEm7WCvBQQ6GSJlSC9ShflfA.jpg',
            map_url: 'https://maps.google.com',
            is_active: 1,
            sort_order: 1
          },
          {
            country: 'United Arab Emirates',
            city: 'Dubai',
            address: '123 Reviva, Brewtown, UAE',
            hours: 'All week: 7:00 AM - 7:00 PM',
            phone: '(123) 456-7890',
            email: 'dubai@juicefresh.com',
            image: 'https://framerusercontent.com/images/aVOTw1y5jS9oXVCRtqku7RKlsY.jpg',
            map_url: 'https://maps.google.com',
            is_active: 1,
            sort_order: 2
          },
          {
            country: 'Japan',
            city: 'Tokyo',
            address: '123 Reviva, Brewtown, Japan',
            hours: 'All week: 7:00 AM - 7:00 PM',
            phone: '(123) 456-7890',
            email: 'tokyo@juicefresh.com',
            image: 'https://framerusercontent.com/images/qoRKXQRcjmvLIFjDKH6B27sSRMc.jpg',
            map_url: 'https://maps.google.com',
            is_active: 1,
            sort_order: 3
          }
        ];

        const stmt = db.prepare(`
          INSERT INTO locations (country, city, address, hours, phone, email, image, map_url, is_active, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        demoLocations.forEach(loc => {
          stmt.run([
            loc.country,
            loc.city,
            loc.address,
            loc.hours,
            loc.phone,
            loc.email,
            loc.image,
            loc.map_url,
            loc.is_active,
            loc.sort_order
          ]);
        });

        stmt.finalize((err) => {
          if (err) {
            console.error('Error inserting demo data:', err);
            reject(err);
            return;
          }
          console.log('Inserted demo locations.');
          
          // Drop old table if it exists
          db.run(`DROP TABLE IF EXISTS locations_old`, (err) => {
            if (err) {
              console.log('Note: Could not drop old table:', err.message);
            }
            console.log('Migration complete!');
            resolve();
          });
        });
      });
    });
  });
}

migrate()
  .then(() => {
    db.close();
    console.log('Database connection closed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    db.close();
    process.exit(1);
  });

