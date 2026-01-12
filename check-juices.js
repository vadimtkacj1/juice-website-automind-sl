const getDatabase = require('./lib/database');

async function checkJuices() {
  const db = getDatabase();

  // Wait for connection to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Get all menu items with category info
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT
          mi.id,
          mi.name,
          mi.volume,
          mi.category_id,
          mi.is_available,
          mi.price,
          mc.name as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        ORDER BY mi.category_id, mi.volume, mi.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n=== All Menu Items ===');
    items.forEach(item => {
      console.log(`ID: ${item.id} | Name: ${item.name} | Volume: ${item.volume} | Available: ${item.is_available} | Category: ${item.category_name} (${item.category_id}) | Price: ${item.price}`);
    });

    // Check specifically for juice category items
    const juiceItems = items.filter(item =>
      item.category_name && item.category_name.toLowerCase().includes('сок')
    );

    console.log('\n=== Juice Items ===');
    if (juiceItems.length > 0) {
      juiceItems.forEach(item => {
        console.log(`ID: ${item.id} | Name: ${item.name} | Volume: ${item.volume} | Available: ${item.is_available} | Price: ${item.price}`);
      });

      const unavailable = juiceItems.filter(item => item.is_available === 0);
      if (unavailable.length > 0) {
        console.log('\n=== UNAVAILABLE Juice Items ===');
        unavailable.forEach(item => {
          console.log(`ID: ${item.id} | Name: ${item.name} | Volume: ${item.volume}`);
        });
      }
    } else {
      console.log('No juice items found');
    }

    // Check categories
    const categories = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, is_active
        FROM menu_categories
        ORDER BY id
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n=== Categories ===');
    categories.forEach(cat => {
      console.log(`ID: ${cat.id} | Name: ${cat.name} | Active: ${cat.is_active}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close(() => {
      console.log('\nDatabase connection closed');
      process.exit(0);
    });
  }
}

checkJuices();
