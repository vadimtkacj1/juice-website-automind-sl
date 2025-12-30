const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../juice_website.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const fallbackContacts = [
  {
    id: 1,
    type: 'email',
    value: 'info@juicewebsite.com'
  },
  {
    id: 2,
    type: 'phone',
    value: '+1 (555) 123-4567'
  },
  {
    id: 3,
    type: 'address',
    value: '123 Main St, Anytown, USA'
  },
  {
    id: 4,
    type: 'whatsapp',
    value: '+1 (555) 987-6543'
  }
];

db.serialize(() => {
  console.log('Seeding fallback contacts...');

  const stmt = db.prepare(`INSERT OR IGNORE INTO contacts (
    id, type, value
  ) VALUES (?, ?, ?)`);

  fallbackContacts.forEach(contact => {
    stmt.run(
      contact.id,
      contact.type,
      contact.value,
      function(err) {
        if (err) {
          console.error(`Error inserting contact ${contact.type}:`, err.message);
        } else if (this.changes === 0) {
          console.log(`Contact ${contact.type} (ID: ${contact.id}) already exists, skipping.`);
        } else {
          console.log(`Inserted contact: ${contact.type} (ID: ${contact.id})`);
        }
      }
    );
  });

  stmt.finalize(() => {
    console.log('Fallback contacts seeding complete.');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});
