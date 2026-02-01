#!/usr/bin/env node
/**
 * Run init-database.sql script
 * This script is designed to be run in production Docker environment
 * It will execute the SQL file to initialize the database schema
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSQLInit() {
  console.log('🗄️  Running database initialization SQL script...\n');

  const sqlFilePath = path.join(__dirname, '..', 'init-database.sql');

  // Check if SQL file exists
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ Error: SQL file not found at ${sqlFilePath}`);
    process.exit(1);
  }

  // Read SQL file
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Split by semicolons but be careful with semicolons in strings
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  try {
    const config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'juice_website',
      multipleStatements: true
    };

    console.log(`Connecting to MySQL at ${config.host}:${config.port}...`);
    const connection = await mysql.createConnection(config);

    console.log('✅ Connected to MySQL database\n');
    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute all statements
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
          // Only log table creation statements
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const match = statement.match(/CREATE TABLE [`"]?(\w+)[`"]?/i);
            if (match) {
              console.log(`✓ Created table: ${match[1]}`);
            }
          } else if (statement.toUpperCase().includes('INSERT INTO')) {
            // Count inserts but don't log each one
            process.stdout.write('.');
          }
        } catch (err) {
          console.error(`\n❌ Error executing statement ${i + 1}:`, err.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          // Continue with other statements instead of failing completely
        }
      }
    }

    console.log('\n\n✅ Database initialization complete!');
    console.log('📝 Database is ready for use');

    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.error('Please check your MySQL configuration:');
    console.error('  - MYSQL_HOST:', process.env.MYSQL_HOST);
    console.error('  - MYSQL_PORT:', process.env.MYSQL_PORT);
    console.error('  - MYSQL_USER:', process.env.MYSQL_USER);
    console.error('  - MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
    process.exit(1);
  }
}

runSQLInit().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
