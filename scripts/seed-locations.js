const getDatabase = require('../lib/database');

const db = getDatabase();

if (!db) {
  console.error('Error connecting to database');
  process.exit(1);
}

console.log('Connected to the MySQL database.');

const fallbackLocations = [
  {
    id: 1,
    country: 'ישראל',
    city: 'חולון',
    address: 'דב הוז 63, חולון',
    hours: 'כל השבוע: 07:00 - 19:00',
    phone: '03-1234567',
    email: 'info@naturli.co.il',
    image: 'https://framerusercontent.com/images/gakEm7WCvBQQ6GSJlSC9ShflfA.jpg',
    map_url: '#',
    is_active: true,
    sort_order: 0
  },
  {
    id: 2,
    country: 'ישראל',
    city: 'ירושלים',
    address: 'רחוב בן יהודה 45, ירושלים',
    hours: 'כל השבוע: 07:00 - 19:00',
    phone: '02-1234567',
    email: 'info@naturli.co.il',
    image: 'https://framerusercontent.com/images/aVOTw1y5jS9oXVCRtqku7RKlsY.jpg',
    map_url: '#',
    is_active: true,
    sort_order: 0
  },
  {
    id: 3,
    country: 'ישראל',
    city: 'חיפה',
    address: 'שדרות הנשיא 78, חיפה',
    hours: 'כל השבוע: 07:00 - 19:00',
    phone: '04-1234567',
    email: 'info@naturli.co.il',
    image: 'https://framerusercontent.com/images/qoRKXQRcjmvLIFjDKH6B27sSRMc.jpg',
    map_url: '#',
    is_active: true,
    sort_order: 0
  }
];

db.serialize(() => {
  console.log('🌐 Seeding fallback locations in Hebrew...');

  const stmt = db.prepare(`INSERT IGNORE INTO locations (
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
    console.log('✅ Fallback locations seeding complete - all in Hebrew!');
    // Give a moment for any pending queries to complete
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
});
