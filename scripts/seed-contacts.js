const getDatabase = require('../lib/database');

const db = getDatabase();

if (!db) {
  console.error('Error connecting to database');
  process.exit(1);
}

console.log('Connected to the MySQL database.');

const fallbackContacts = [
  {
    id: 1,
    type: 'email',
    value: 'info@naturli.co.il'
  },
  {
    id: 2,
    type: 'phone',
    value: '03-1234567'
  },
  {
    id: 3,
    type: 'address',
    value: 'דב הוז 63, חולון, ישראל'
  },
  {
    id: 4,
    type: 'whatsapp',
    value: '+972-50-123-4567'
  }
];

db.serialize(() => {
  console.log('🌐 Seeding fallback contacts in Hebrew...');

  const stmt = db.prepare(`INSERT IGNORE INTO contacts (
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
    console.log('✅ Fallback contacts seeding complete - all in Hebrew!');
    // Give a moment for any pending queries to complete
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
});
