const getDatabase = require('./lib/database');

async function fixJuiceVolumes() {
  const db = getDatabase();

  // Wait for connection to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    console.log('\n=== Adding volume options to category "מיצים טריים" ===\n');

    // Get the juice category ID
    const category = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name FROM menu_categories
        WHERE name = 'מיצים טריים' AND is_active = 1
        ORDER BY id DESC
        LIMIT 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!category) {
      console.log('Category "מיצים טריים" not found!');
      process.exit(1);
    }

    console.log(`Found category: ${category.name} (ID: ${category.id})`);

    // Check if volumes already exist
    const existingVolumes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM menu_category_volumes
        WHERE category_id = ?
      `, [category.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (existingVolumes.length > 0) {
      console.log('\nVolume options already exist for this category:');
      existingVolumes.forEach(vol => {
        console.log(`  - ${vol.volume} (default: ${vol.is_default})`);
      });
      console.log('\nSkipping volume creation.');
    } else {
      console.log('\nAdding volume options...');

      // Add 0.5L volume option
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO menu_category_volumes (category_id, volume, is_default, sort_order)
          VALUES (?, ?, ?, ?)
        `, [category.id, '0.5 ליטר', 1, 0], function(err) {
          if (err) reject(err);
          else {
            console.log(`  ✓ Added: 0.5 ליטר (default)`);
            resolve(this.lastID);
          }
        });
      });

      // Add 1L volume option
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO menu_category_volumes (category_id, volume, is_default, sort_order)
          VALUES (?, ?, ?, ?)
        `, [category.id, '1 ליטר', 0, 1], function(err) {
          if (err) reject(err);
          else {
            console.log(`  ✓ Added: 1 ליטר`);
            resolve(this.lastID);
          }
        });
      });
    }

    console.log('\n=== Next Steps ===');
    console.log('1. Go to admin panel: /admin/menu/categories/edit/' + category.id);
    console.log('2. You should see "Category Volume Options" section');
    console.log('3. Set prices for each volume (0.5L and 1L)');
    console.log('4. Update menu items to remove duplicate entries');
    console.log('\nOr you can keep the current 12 separate items if you prefer.');
    console.log('The volume selector will work once you set prices in the category.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close(() => {
      console.log('\nDatabase connection closed');
      process.exit(0);
    });
  }
}

fixJuiceVolumes();
