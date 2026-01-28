const mysql = require('mysql2/promise');
require('dotenv').config();

async function addImageColumn() {
  console.log('Adding image column to menu_categories table...');

  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'juice_website',
  };

  let connection;

  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL database.');

    // Check if column already exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menu_categories' AND COLUMN_NAME = 'image'`,
      [config.database]
    );

    if (columns.length > 0) {
      console.log('Column "image" already exists in menu_categories table.');
    } else {
      // Add the column
      await connection.query('ALTER TABLE menu_categories ADD COLUMN image TEXT AFTER description');
      console.log('Successfully added image column to menu_categories!');
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

addImageColumn();
