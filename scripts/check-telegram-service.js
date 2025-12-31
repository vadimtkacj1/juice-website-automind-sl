/**
 * Check if Telegram service is running
 */

const http = require('http');

const SERVICE_URL = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3001';

http.get(`${SERVICE_URL}/health`, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      console.log('✅ Telegram Service is running');
      console.log('Status:', health.status);
      console.log('Polling:', health.polling ? 'Active' : 'Inactive');
      console.log('Bot Configured:', health.bot_configured ? 'Yes' : 'No');
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to parse health check response');
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Telegram Service is not running');
  console.error('Error:', error.message);
  console.log('\n💡 Start the service with: npm run telegram:service');
  process.exit(1);
});

