const mysql = require('mysql2/promise');

async function seedBusinessHours() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'juice_website',
  });

  console.log('Connected to MySQL database.');

  const businessHours = [
    {
      day_of_week: 'Sunday',
      open_time: '08:00',
      close_time: '20:00',
      sort_order: 1,
      is_active: 1
    },
    {
      day_of_week: 'Monday',
      open_time: '08:00',
      close_time: '20:00',
      sort_order: 2,
      is_active: 1
    },
    {
      day_of_week: 'Tuesday',
      open_time: '08:00',
      close_time: '20:00',
      sort_order: 3,
      is_active: 1
    },
    {
      day_of_week: 'Wednesday',
      open_time: '08:00',
      close_time: '20:00',
      sort_order: 4,
      is_active: 1
    },
    {
      day_of_week: 'Thursday',
      open_time: '08:00',
      close_time: '20:00',
      sort_order: 5,
      is_active: 1
    },
    {
      day_of_week: 'Friday',
      open_time: '08:00',
      close_time: '15:00',
      sort_order: 6,
      is_active: 1
    },
    {
      day_of_week: 'Saturday',
      open_time: '09:00',
      close_time: '22:00',
      sort_order: 7,
      is_active: 1
    }
  ];

  try {
    console.log('🕐 Seeding business hours...');

    // Clear existing business hours
    await connection.query('DELETE FROM business_hours');
    console.log('Cleared existing business hours');

    // Insert new business hours
    for (const hour of businessHours) {
      await connection.query(
        'INSERT INTO business_hours (day_of_week, open_time, close_time, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
        [hour.day_of_week, hour.open_time, hour.close_time, hour.sort_order, hour.is_active]
      );
      console.log(`✓ ${hour.day_of_week}: ${hour.open_time} - ${hour.close_time}`);
    }

    console.log('✅ Business hours seeding complete!');
  } catch (error) {
    console.error('Error seeding business hours:', error.message);
    throw error;
  } finally {
    await connection.end();
    process.exit(0);
  }
}

seedBusinessHours().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
