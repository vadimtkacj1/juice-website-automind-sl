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

const fallbackLocations = [
  {
    id: 1,
    country: 'United States',
    city: 'NYC',
    address: '123 Coffee Lane, Brewtown, USA',
    hours: 'All week: 7:00 AM - 7:00 PM',
    phone: '(123) 456-7890',
    email: 'info@brewhaven.com',
    image: 'https://framerusercontent.com/images/gakEm7WCvBQQ6GSJlSC9ShflfA.jpg',
    map_url: '#',
    is_active: true,
    sort_order: 0
  },
  {
    id: 2,
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: '123 Coffee Lane, Brewtown, UAE',
    hours: 'All week: 7:00 AM - 7:00 PM',
    phone: '(123) 456-7890',
    email: 'info@brewhaven.com',
    image: 'https://framerusercontent.com/images/aVOTw1y5jS9oXVCRtqku7RKlsY.jpg',
    map_url: '#',
    is_active: true,
    sort_order: 0
  },
  {
    id: 3,
    country: 'Japan',
    city: 'Tokyo',
    address: '123 Coffee Lane, Brewtown, Japan',
    hours: 'All week: 7:00 AM - 7:00 PM',
    phone: '(123) 456-7890',
    email: 'info@brewhaven.com',
    image: 'https://framerusercontent.com/images/qoRKXQRcjmvLIFjDKH6B27sSRMc.jpg',
    map_url: '#',
    is_active: true,
    sort_order: 0
  }
];

db.serialize(() => {
  console.log('Seeding fallback locations...');

  const stmt = db.prepare(`INSERT OR IGNORE INTO locations (
    id, country, city, address, hours, phone, email, image, map_url, is_active, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  fallbackLocations.forEach(location => {
    stmt.run(
      location.id,
      location.country,
      location.city,
      location.address,
      location.hours,
      location.phone,
      location.email,
      location.image,
      location.map_url,
      location.is_active ? 1 : 0,
      location.sort_order || 0,
      function(err) {
        if (err) {
          console.error(`Error inserting location ${location.city}:`, err.message);
        } else if (this.changes === 0) {
          console.log(`Location ${location.city} (ID: ${location.id}) already exists, skipping.`);
        } else {
          console.log(`Inserted location: ${location.city} (ID: ${location.id})`);
        }
      }
    );
  });

  stmt.finalize(() => {
    console.log('Fallback locations seeding complete.');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});
