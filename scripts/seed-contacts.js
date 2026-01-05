const mysql = require('mysql2/promise');

async function seedContacts() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'juice_website',
  });

  console.log('Connected to MySQL database.');

  const fallbackContacts = [
    {
      type: 'phone',
      value: '03-1234567',
      label: 'התקשרו אלינו',
      description: 'שירות לקוחות זמין בימים א-ה, 9:00-18:00'
    },
    {
      type: 'address',
      value: 'דב הוז 63, חולון, ישראל',
      label: 'בקרו אותנו',
      description: 'המיקום המרכזי שלנו'
    },
    {
      type: 'email',
      value: 'info@reviva.co.il',
      label: 'שלחו לנו מייל',
      description: 'נחזור אליכם תוך 24 שעות'
    },
    {
      type: 'whatsapp',
      value: '+972501234567',
      label: 'וואטסאפ',
      description: 'שוחחו איתנו בכל זמן'
    }
  ];

  try {
    console.log('🌐 Seeding fallback contacts in Hebrew...');

    // Clear existing contacts
    await connection.query('DELETE FROM contacts');
    console.log('Cleared existing contacts');

    // Insert new contacts
    for (const contact of fallbackContacts) {
      await connection.query(
        'INSERT INTO contacts (type, value, label, description) VALUES (?, ?, ?, ?)',
        [contact.type, contact.value, contact.label, contact.description]
      );
      console.log(`✓ Inserted contact: ${contact.type}`);
    }

    console.log('✅ Fallback contacts seeding complete - all in Hebrew!');
  } catch (error) {
    console.error('Error seeding contacts:', error.message);
    throw error;
  } finally {
    await connection.end();
    process.exit(0);
  }
}

seedContacts().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
