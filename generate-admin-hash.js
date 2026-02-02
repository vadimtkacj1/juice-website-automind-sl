const bcrypt = require('bcryptjs');

// Укажите здесь свой пароль
const password = 'JuiceAdmin2026!@#';
const saltRounds = 10;

console.log('\n🔐 Generating bcrypt hash for admin password...\n');
console.log('Password to hash:', password);
console.log('\n');

// Генерация хеша
const hash = bcrypt.hashSync(password, saltRounds);

console.log('=================================');
console.log('Password:     ', password);
console.log('Bcrypt Hash:  ', hash);
console.log('=================================\n');

// Проверка хеша
const isValid = bcrypt.compareSync(password, hash);

if (isValid) {
  console.log('✅ Hash verification: SUCCESS\n');
  console.log('=================================');
  console.log('SQL для init-database.sql:');
  console.log('=================================\n');
  console.log(`INSERT INTO \`admins\` (\`username\`, \`password\`, \`email\`, \`created_at\`)`);
  console.log(`VALUES ('admin', '${hash}', 'admin@juice-website.com', CURRENT_TIMESTAMP);\n`);

  console.log('=================================');
  console.log('SQL для обновления (если уже существует):');
  console.log('=================================\n');
  console.log(`UPDATE \`admins\``);
  console.log(`SET \`password\` = '${hash}'`);
  console.log(`WHERE \`username\` = 'admin';\n`);
} else {
  console.log('❌ Hash verification: FAILED\n');
  process.exit(1);
}
