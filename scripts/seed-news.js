const getDatabase = require('../lib/database');

const db = getDatabase();

if (!db) {
  console.error('Error connecting to database');
  process.exit(1);
}

console.log('Connected to the MySQL database.');

const fallbackNews = [
  {
    id: 1,
    title: 'טעמים חדשים מרגשים של מיצים!',
    content: 'אנו שמחים להודיע על השקת קו המיצים המרעננים החדש שלנו. בואו לנסות אותם היום!',
    image: 'https://framerusercontent.com/images/5c3PIy4m4YvRO0MIbc1NeBfMaXU.jpg',
    is_active: true,
    created_at: '2023-10-26 10:00:00'
  },
  {
    id: 2,
    title: 'פתיחה גדולה במרכז העיר!',
    content: 'הסניף החדש שלנו נפתח בלב מרכז העיר! בואו לבקר אותנו להצעות פתיחה מיוחדות ותהנו מהמיצים הטעימים שלנו.',
    is_active: true,
    created_at: '2023-10-20 09:30:00'
  },
  {
    id: 3,
    title: 'טיפים לחיים בריאים עם נטורליי מרענן',
    content: 'גלו כיצד המיצים הטבעיים והטריים שלנו יכולים לשפר את הבריאות והרווחה שלכם. קראו את הפוסט האחרון שלנו לקבלת טיפים ומתכונים.',
    is_active: true,
    created_at: '2023-10-15 11:45:00'
  },
  {
    id: 4,
    title: 'מבצעים עונתיים כאן!',
    content: 'אל תפספסו את תערובות המיצים העונתיות שלנו לזמן מוגבל, מעוצבות עם המרכיבים הטריים ביותר של העונה.',
    image: 'https://framerusercontent.com/images/5SrlAPZTOT6JPRKJyGo6o4Zfxog.jpg',
    is_active: true,
    created_at: '2023-10-01 14:00:00'
  }
];

db.serialize(() => {
  console.log('🌐 Seeding fallback news items in Hebrew...');

  const stmt = db.prepare(`INSERT IGNORE INTO news (
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
    console.log('✅ Fallback news items seeding complete - all in Hebrew!');
    // Give a moment for any pending queries to complete
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
});
