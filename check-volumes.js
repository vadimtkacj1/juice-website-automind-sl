const getDatabase = require('./lib/database');

async function checkVolumes() {
  const db = getDatabase();

  // Wait for connection to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Check category volumes
    const categoryVolumes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT
          mcv.id,
          mcv.category_id,
          mcv.volume,
          mcv.is_default,
          mcv.sort_order,
          mc.name as category_name
        FROM menu_category_volumes mcv
        LEFT JOIN menu_categories mc ON mcv.category_id = mc.id
        ORDER BY mcv.category_id, mcv.sort_order, mcv.volume
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n=== Category Volumes ===');
    categoryVolumes.forEach(vol => {
      console.log(`ID: ${vol.id} | Category: ${vol.category_name} (${vol.category_id}) | Volume: ${vol.volume} | Default: ${vol.is_default} | Sort: ${vol.sort_order}`);
    });

    // Check menu items grouped by name and volume
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT
          mi.id,
          mi.name,
          mi.volume,
          mi.category_id,
          mi.is_available,
          mc.name as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mc.name LIKE '%מיצים%'
        ORDER BY mi.name, mi.volume
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n=== Juice Items (grouped by name) ===');
    items.forEach(item => {
      console.log(`ID: ${item.id} | Name: ${item.name} | Volume: ${item.volume} | Category: ${item.category_name} (${item.category_id}) | Available: ${item.is_available}`);
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

checkVolumes();
