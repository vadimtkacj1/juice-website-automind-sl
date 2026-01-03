const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Support environment variable for database path (useful for Docker)
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH 
  : path.join(__dirname, '../juice_website.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🍹 Seeding menu data...\n');
console.log(`📁 Database path: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error(`   Database path: ${dbPath}`);
    process.exit(1);
  }
  console.log('✅ Connected to database');
  console.log(`📁 Using database: ${dbPath}\n`);
  
  // Verify database is accessible and has tables
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_categories'", (err, rows) => {
    if (err) {
      console.error('❌ Error checking tables:', err.message);
      console.error(`   Database path: ${dbPath}`);
      db.close();
      process.exit(1);
    }
    if (rows.length === 0) {
      console.error('❌ Table menu_categories not found!');
      console.error(`   Database path: ${dbPath}`);
      console.error('   Please run: docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js');
      db.close();
      process.exit(1);
    }
    console.log('✅ Table menu_categories found');
    // Continue with seeding
    seedData();
  });
});

const categories = [
  { name: 'מיצים טריים', description: 'מיצים טבעיים מפירות וירקות טריים', sort_order: 1 },
  { name: 'שייקים וסמוזים', description: 'סמוזים טעימים ובריאים', sort_order: 2 },
  { name: 'צלחות לאירועים', description: 'צלחות פירות וירקות לאירועים', sort_order: 3 },
  { name: 'סלטים', description: 'סלטי פירות וירקות טריים', sort_order: 4 },
  { name: 'ערכות למסיבות', description: 'ערכות מיוחדות עם משקאות וחטיפים', sort_order: 5 },
  { name: 'ערכות רומנטיות', description: 'ערכות לרגעים מיוחדים', sort_order: 6 },
  { name: 'קינוחים', description: 'מעדנים מתוקים', sort_order: 7 },
];

const menuItems = [
  // מיצים טריים 0.5L
  { category: 'מיצים טריים', name: 'רימון', price: 25, volume: '0.5 ליטר' },
  { category: 'מיצים טריים', name: 'תפוז', price: 20, volume: '0.5 ליטר' },
  { category: 'מיצים טריים', name: 'אשכולית', price: 20, volume: '0.5 ליטר' },
  { category: 'מיצים טריים', name: 'גזר', price: 25, volume: '0.5 ליטר' },
  { category: 'מיצים טריים', name: 'תפוח', price: 25, volume: '0.5 ליטר' },
  { category: 'מיצים טריים', name: 'סלק', price: 25, volume: '0.5 ליטר' },
  // מיצים טריים 1L
  { category: 'מיצים טריים', name: 'רימון', price: 40, volume: '1 ליטר' },
  { category: 'מיצים טריים', name: 'תפוז', price: 40, volume: '1 ליטר' },
  { category: 'מיצים טריים', name: 'אשכולית', price: 40, volume: '1 ליטר' },
  { category: 'מיצים טריים', name: 'גזר', price: 50, volume: '1 ליטר' },
  { category: 'מיצים טריים', name: 'תפוח', price: 50, volume: '1 ליטר' },
  { category: 'מיצים טריים', name: 'סלק', price: 50, volume: '1 ליטר' },

  // שייקים וסמוזים
  { category: 'שייקים וסמוזים', name: 'טבעי טעים', description: 'בננה, תפוח, קיווי, אננס, מלון', price: 30 },
  { category: 'שייקים וסמוזים', name: 'טבעי טרופי', description: 'מנגו, אננס, בננה, אוכמניות', price: 30 },
  { category: 'שייקים וסמוזים', name: 'טבעי מתוק', description: 'בננה, אננס, תות + שוקולד', price: 30 },
  { category: 'שייקים וסמוזים', name: 'טבעי בריא', description: 'בננה, מנגו, אננס, קיווי, תות', price: 30 },
  { category: 'שייקים וסמוזים', name: 'טבעי גן עדן', description: 'בננה, מלון, אפרסק, אננס, תות, חלבה', price: 30 },
  { category: 'שייקים וסמוזים', name: 'טבעי קלאסי', description: 'תות, בננה, אננס, מנגו', price: 45 },
  { category: 'שייקים וסמוזים', name: 'טבעי מרענן', description: 'תערובת טרופית, בננה, אננס', price: 45 },
  { category: 'שייקים וסמוזים', name: 'טבעי ממכר', description: 'בננה, אוכמניות, תפוח + שוקולד', price: 45 },

  // צלחות לאירועים
  { category: 'צלחות לאירועים', name: 'טבעי מבעבע (גדול)', description: 'פירות', price: 300, volume: 'גדול' },
  { category: 'צלחות לאירועים', name: 'טבעי מבעבע (בינוני)', description: 'פירות', price: 200, volume: 'בינוני' },
  { category: 'צלחות לאירועים', name: 'טבעי בריא (גדול)', description: 'ירקות', price: 200, volume: 'גדול' },
  { category: 'צלחות לאירועים', name: 'טבעי בריא (בינוני)', description: 'ירקות', price: 150, volume: 'בינוני' },

  // סלטים
  { category: 'סלטים', name: 'סלט פירות (גדול)', price: 160, volume: 'גדול' },
  { category: 'סלטים', name: 'סלט פירות (בינוני)', price: 140, volume: 'בינוני' },
  { category: 'סלטים', name: 'סלט ירקות (גדול)', price: 120, volume: 'גדול' },
  { category: 'סלטים', name: 'סלט ירקות (בינוני)', price: 100, volume: 'בינוני' },

  // ערכות למסיבות
  { category: 'ערכות למסיבות', name: 'טבעי ידידותי', description: '6 XL + וודקה/ערק + פירות', price: 480 },
  { category: 'ערכות למסיבות', name: 'טבעי שמח', description: '6 XL + וודקה/ערק + אגוזים', price: 440 },
  { category: 'ערכות למסיבות', name: 'טבעי סוף שבוע', description: '6 XL + וודקה/ערק + 6 מלבי', price: 400 },
  { category: 'ערכות למסיבות', name: 'טבעי ביחד', description: '6 XL + וודקה/ערק + גומי', price: 400 },
  { category: 'ערכות למסיבות', name: 'טבעי מותר', description: '6 קולה/זירו + אגוזים', price: 200 },
  { category: 'ערכות למסיבות', name: 'טבעי נכון', description: '6 קולה/זירו + גומי', price: 200 },
  { category: 'ערכות למסיבות', name: 'טבעי מלוח', description: '6 קולה/זירו + 6 חטיפים', price: 200 },

  // ערכות רומנטיות
  { category: 'ערכות רומנטיות', name: 'טבעי מפנק', description: 'יין + שוקולד', price: 300 },
  { category: 'ערכות רומנטיות', name: 'טבעי לשניים', description: 'יין + אגוזים', price: 300 },
  { category: 'ערכות רומנטיות', name: 'טבעי קורץ', description: 'יין + פירות לשניים', price: 350 },
  { category: 'ערכות רומנטיות', name: 'טבעי מעודד', description: 'יין + גומי', price: 320 },
  { category: 'ערכות רומנטיות', name: 'טבעי נעים', description: 'יין + פרחים + שוקולד', price: 400 },
  { category: 'ערכות רומנטיות', name: 'טבעי חם', description: 'יין + פרחים + פירות', price: 400 },
  { category: 'ערכות רומנטיות', name: 'טבעי יוקרה', description: 'יין + 8 קינוחים', price: 350 },

  // קינוחים
  { category: 'קינוחים', name: 'ערכת 6 קינוחים', description: 'מלבי / בוואריה / מוס / כנאפה', price: 100 },
  { category: 'קינוחים', name: 'צלחת מרעננת למשפחה', description: '8 קינוחים שונים', price: 140 },
  { category: 'קינוחים', name: 'טבעי טעים (קינוח)', description: '2 וופלים + קינוח', price: 80 },
  { category: 'קינוחים', name: 'טבעי בריא (קינוח)', description: '2 וופלים + פירות', price: 80 },
];

// Function to seed data
function seedData() {
  // Check if categories already exist
  db.get('SELECT COUNT(*) as count FROM menu_categories', (err, result) => {
    if (err) {
      console.error('❌ Error checking categories:', err.message);
      console.error(`   Database path: ${dbPath}`);
      console.error('   This might mean the table doesn\'t exist. Run init-database.js first.');
      db.close();
      process.exit(1);
    }
    
    if (result.count > 0) {
      console.log(`⚠️  Found ${result.count} existing categories, skipping category insertion`);
      insertMenuItems();
      return;
    }
    
    // Insert categories first
    db.serialize(() => {
      const insertCategory = db.prepare('INSERT INTO menu_categories (name, description, sort_order, is_active) VALUES (?, ?, ?, 1)');
      
      categories.forEach((cat) => {
        insertCategory.run(cat.name, cat.description, cat.sort_order, (err) => {
          if (err) {
            console.error(`❌ Error inserting category ${cat.name}:`, err.message);
          } else {
            console.log(`✅ Category added: ${cat.name}`);
          }
        });
      });
      
      insertCategory.finalize(() => {
        console.log('\n✅ Categories inserted, now inserting menu items...\n');
        insertMenuItems();
      });
    });
  });
}

// Function to insert menu items
function insertMenuItems() {
  // First check if items already exist
  db.get('SELECT COUNT(*) as count FROM menu_items', [], (err, itemResult) => {
    if (err) {
      console.error('❌ Error checking menu items:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (itemResult && itemResult.count > 0) {
      console.log(`⚠️  Found ${itemResult.count} existing menu items`);
      console.log('   To reseed, delete existing items first or use reseed-menu.js');
      db.close();
      return;
    }
    
    // Fetch categories
    db.all('SELECT id, name FROM menu_categories', [], (err, cats) => {
      if (err) {
        console.error('❌ Error fetching categories:', err.message);
        db.close();
        process.exit(1);
      }

      if (cats.length === 0) {
        console.error('❌ No categories found! Please run init-database.js first.');
        db.close();
        process.exit(1);
      }

      const categoryMap = {};
      cats.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

    db.serialize(() => {
      const insertItem = db.prepare(`
        INSERT INTO menu_items (category_id, name, description, price, volume, is_available, sort_order) 
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `);

      let order = 0;
      let inserted = 0;
      let errors = 0;

      menuItems.forEach((item) => {
        const categoryId = categoryMap[item.category];
        if (!categoryId) {
          console.error(`❌ Category not found: ${item.category}`);
          errors++;
          return;
        }
        order++;
        insertItem.run(
          categoryId,
          item.name,
          item.description || null,
          item.price,
          item.volume || null,
          order,
          (err) => {
            if (err) {
              console.error(`❌ Error inserting item ${item.name}:`, err.message);
              errors++;
            } else {
              inserted++;
              console.log(`   ✅ Item added: ${item.name} - ₪${item.price}`);
            }
          }
        );
      });

      insertItem.finalize(() => {
        console.log('\n✨ Menu seeding complete!');
        console.log(`📝 Added ${inserted} menu items (${errors} errors)`);
        db.close();
      });
    });
    });
  });
}
