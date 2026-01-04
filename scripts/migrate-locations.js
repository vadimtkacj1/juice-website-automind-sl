const getDatabase = require('../lib/database');

const db = getDatabase();

if (!db) {
  console.error('Error connecting to database');
  process.exit(1);
}

console.log('Connected to the MySQL database.');

// Migration: Update locations table to new schema
async function migrate() {
  return new Promise((resolve, reject) => {
    // Check if the table has the new columns
    db.all("SHOW COLUMNS FROM locations LIKE 'country'", [], (err, columns) => {
      if (err) {
        console.error('Error checking table:', err);
        reject(err);
        return;
      }

      // If 'country' column exists, table is already migrated
      if (columns && columns.length > 0) {
        console.log('Locations table already has new schema.');
        if (db.close) db.close();
        resolve();
        return;
      }

      console.log('Migrating locations table...');

      // Add new columns (MySQL syntax)
      db.run('ALTER TABLE locations ADD COLUMN country TEXT', (err) => {
        if (err && !err.message.includes('Duplicate column')) {
          console.error('Error adding country column:', err);
          reject(err);
          return;
        }
      });

      db.run('ALTER TABLE locations ADD COLUMN city TEXT', (err) => {
        if (err && !err.message.includes('Duplicate column')) {
          console.error('Error adding city column:', err);
          reject(err);
          return;
        }
      });

      db.run('ALTER TABLE locations ADD COLUMN address TEXT', (err) => {
        if (err && !err.message.includes('Duplicate column')) {
          console.error('Error adding address column:', err);
          reject(err);
          return;
        }
      });

      db.run('ALTER TABLE locations ADD COLUMN map_url TEXT', (err) => {
        if (err && !err.message.includes('Duplicate column')) {
          console.error('Error adding map_url column:', err);
          reject(err);
          return;
        }
      });

      console.log('✅ Migration completed!');
      if (db.close) db.close();
      resolve();
    });
  });
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
