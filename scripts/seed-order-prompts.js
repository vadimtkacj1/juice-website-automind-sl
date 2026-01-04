const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'juice_website',
};

async function seedOrderPrompts() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check if prompts already exist
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM order_prompts');
    if (existing[0].count > 0) {
      console.log('⚠️  Order prompts already exist. Skipping seed.');
      await connection.end();
      return;
    }

    // Order Prompts data in Hebrew
    const prompts = [
      {
        title: 'האם תרצה להוסיף פריטים נוספים?',
        description: 'הוסף פריטים נוספים להזמנה שלך',
        prompt_type: 'additional_items',
        is_active: 1,
        sort_order: 1,
        show_on_all_products: 1,
        products: [
          {
            product_name: 'בייגלה',
            product_price: 8.00,
            volume_option: null,
            sort_order: 1
          },
          {
            product_name: 'קרקרים',
            product_price: 7.50,
            volume_option: null,
            sort_order: 2
          },
          {
            product_name: 'פרוסת עוגה',
            product_price: 12.00,
            volume_option: null,
            sort_order: 3
          }
        ]
      },
      {
        title: 'הוסף משקה נוסף?',
        description: 'השלם את ההזמנה שלך עם משקה נוסף',
        prompt_type: 'additional_items',
        is_active: 1,
        sort_order: 2,
        show_on_all_products: 1,
        products: [
          {
            product_name: 'מים מינרליים',
            product_price: 5.00,
            volume_option: '500ml',
            sort_order: 1
          },
          {
            product_name: 'מים מוגזים',
            product_price: 6.00,
            volume_option: '500ml',
            sort_order: 2
          },
          {
            product_name: 'תה קר',
            product_price: 8.00,
            volume_option: '500ml',
            sort_order: 3
          }
        ]
      },
      {
        title: 'הוסף סלט פירות?',
        description: 'סלט פירות טרי ומתוק להשלמת ההזמנה',
        prompt_type: 'additional_items',
        is_active: 1,
        sort_order: 3,
        show_on_all_products: 1,
        products: [
          {
            product_name: 'סלט פירות קטן',
            product_price: 15.00,
            volume_option: '300g',
            sort_order: 1
          },
          {
            product_name: 'סלט פירות בינוני',
            product_price: 25.00,
            volume_option: '500g',
            sort_order: 2
          },
          {
            product_name: 'סלט פירות גדול',
            product_price: 35.00,
            volume_option: '750g',
            sort_order: 3
          }
        ]
      },
      {
        title: 'הוסף צלחת בריאות?',
        description: 'צלחת בריאות עם ירקות טריים וטופו',
        prompt_type: 'additional_items',
        is_active: 1,
        sort_order: 4,
        show_on_all_products: 0, // Only show on specific products
        products: [
          {
            product_name: 'צלחת בריאות קטנה',
            product_price: 28.00,
            volume_option: null,
            sort_order: 1
          },
          {
            product_name: 'צלחת בריאות בינונית',
            product_price: 38.00,
            volume_option: null,
            sort_order: 2
          }
        ]
      },
      {
        title: 'בחר נפח/משקל',
        description: 'בחר את הנפח או המשקל הרצוי',
        prompt_type: 'volume_weight',
        is_active: 1,
        sort_order: 0,
        show_on_all_products: 1,
        products: [
          {
            product_name: 'נפח קטן',
            product_price: 0,
            volume_option: '250ml',
            sort_order: 1
          },
          {
            product_name: 'נפח בינוני',
            product_price: 0,
            volume_option: '500ml',
            sort_order: 2
          },
          {
            product_name: 'נפח גדול',
            product_price: 0,
            volume_option: '750ml',
            sort_order: 3
          }
        ]
      }
    ];

    console.log('🌱 Seeding order prompts...\n');

    for (const prompt of prompts) {
      // Insert prompt
      const [result] = await connection.query(
        `INSERT INTO order_prompts (title, description, prompt_type, is_active, sort_order, show_on_all_products, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          prompt.title,
          prompt.description,
          prompt.prompt_type,
          prompt.is_active,
          prompt.sort_order,
          prompt.show_on_all_products
        ]
      );

      const promptId = result.insertId;
      console.log(`✅ Created prompt: ${prompt.title} (ID: ${promptId})`);

      // Insert products for this prompt
      if (prompt.products && prompt.products.length > 0) {
        for (const product of prompt.products) {
          await connection.query(
            `INSERT INTO order_prompt_products (prompt_id, menu_item_id, product_name, product_price, volume_option, sort_order, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              promptId,
              null, // menu_item_id - can be linked to specific menu items later
              product.product_name,
              product.product_price,
              product.volume_option,
              product.sort_order
            ]
          );
        }
        console.log(`   └─ Added ${prompt.products.length} products`);
      }
    }

    console.log('\n✨ Order prompts seeded successfully!');
    console.log(`📊 Total prompts created: ${prompts.length}`);

  } catch (error) {
    console.error('❌ Error seeding order prompts:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run seed
seedOrderPrompts()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });

