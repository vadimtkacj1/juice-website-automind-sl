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

const fallbackNews = [
  {
    id: 1,
    title: 'Exciting New Juice Flavors Launched!',
    content: 'We are thrilled to announce the launch of our new line of refreshing juice flavors. Come and try them today!',
    image: 'https://framerusercontent.com/images/5c3PIy4m4YvRO0MIbc1NeBfMaXU.jpg',
    is_active: true,
    created_at: '2023-10-26 10:00:00'
  },
  {
    id: 2,
    title: 'Grand Opening in Downtown City!',
    content: 'Our newest branch is now open in the heart of Downtown City! Visit us for special opening offers and enjoy our delicious juices.',
    is_active: true,
    created_at: '2023-10-20 09:30:00'
  },
  {
    id: 3,
    title: 'Healthy Living Tips with Juice Website',
    content: 'Discover how our natural and fresh juices can boost your health and wellness. Read our latest blog post for tips and recipes.',
    is_active: true,
    created_at: '2023-10-15 11:45:00'
  },
  {
    id: 4,
    title: 'Seasonal Specials Are Here!',
    content: 'Don\'t miss out on our limited-time seasonal juice blends, crafted with the freshest ingredients of the season.',
    image: 'https://framerusercontent.com/images/5SrlAPZTOT6JPRKJyGo6o4Zfxog.jpg',
    is_active: true,
    created_at: '2023-10-01 14:00:00'
  }
];

db.serialize(() => {
  console.log('Seeding fallback news items...');

  const stmt = db.prepare(`INSERT OR IGNORE INTO news (
    id, title, content, image, is_active, created_at
  ) VALUES (?, ?, ?, ?, ?, ?)`);

  fallbackNews.forEach(newsItem => {
    stmt.run(
      newsItem.id,
      newsItem.title,
      newsItem.content,
      newsItem.image || null,
      newsItem.is_active ? 1 : 0,
      newsItem.created_at,
      function(err) {
        if (err) {
          console.error(`Error inserting news item ${newsItem.title}:`, err.message);
        } else if (this.changes === 0) {
          console.log(`News item ${newsItem.title} (ID: ${newsItem.id}) already exists, skipping.`);
        } else {
          console.log(`Inserted news item: ${newsItem.title} (ID: ${newsItem.id})`);
        }
      }
    );
  });

  stmt.finalize(() => {
    console.log('Fallback news items seeding complete.');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});
