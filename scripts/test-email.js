/**
 * Test Email Receipt Functionality
 *
 * This script tests the email sending functionality by sending a test receipt email.
 * Run with: npm run test:email
 */

require('dotenv').config({ path: '.env.local' });
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../src/lib/email.js');

async function testEmail() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🧪 Testing Email Receipt Functionality');
  console.log('='.repeat(80));
  console.log('');

  // Check email configuration
  console.log('📋 Email Configuration:');
  console.log('  Host:', process.env.EMAIL_SERVER_HOST || 'NOT SET');
  console.log('  Port:', process.env.EMAIL_SERVER_PORT || 'NOT SET');
  console.log('  User:', process.env.EMAIL_SERVER_USER || 'NOT SET');
  console.log('  Password:', process.env.EMAIL_SERVER_PASSWORD ? '***' + process.env.EMAIL_SERVER_PASSWORD.slice(-4) : 'NOT SET');
  console.log('  Admin Email:', process.env.EMAIL_ADMIN || 'NOT SET');
  console.log('');

  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error('❌ Email configuration is incomplete!');
    console.error('   Please set EMAIL_SERVER_HOST, EMAIL_SERVER_USER, and EMAIL_SERVER_PASSWORD in .env.local');
    process.exit(1);
  }

  // Test order data with custom ingredients and additional items
  const testOrderData = {
    orderNumber: `TEST-${Date.now()}`,
    customerName: 'Test Customer',
    customerEmail: process.env.EMAIL_ADMIN || process.env.EMAIL_SERVER_USER,
    items: [
      {
        name: 'מיץ תפוזים טבעי',
        quantity: 2,
        price: 15.00,
        customIngredients: [
          { name: 'גזר', price: 2.00 },
          { name: 'ג׳ינג׳ר', price: 1.50 }
        ]
      },
      {
        name: 'סמוזי פירות',
        quantity: 1,
        price: 22.00,
        additionalItems: [
          { name: 'חלבון אבקה', price: 5.00 },
          { name: 'דבש', price: 2.00 }
        ]
      },
      {
        name: 'מיץ אבטיח',
        quantity: 1,
        price: 12.00
      }
    ],
    total: 76.50,
    deliveryAddress: 'רחוב הדקלים 123, תל אביב'
  };

  console.log('📦 Test Order Data:');
  console.log(JSON.stringify(testOrderData, null, 2));
  console.log('');

  try {
    // Create a mock PDF attachment for testing
    console.log('📄 Creating mock PDF receipt...');
    const mockPdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Receipt PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
307
%%EOF
    `;
    const mockPdfBuffer = Buffer.from(mockPdfContent.trim());
    console.log('✅ Mock PDF created');
    console.log('');

    // Test customer receipt email with PDF attachment
    console.log('📧 Sending customer receipt email with PDF attachment...');
    const customerEmailSuccess = await sendOrderConfirmationEmail(testOrderData, mockPdfBuffer);

    if (customerEmailSuccess) {
      console.log('✅ Customer receipt email sent successfully!');
      console.log('   Check inbox:', testOrderData.customerEmail);
      console.log('   📎 PDF attachment included');
    } else {
      console.log('❌ Failed to send customer receipt email');
    }
    console.log('');

    // Test admin notification email
    if (process.env.EMAIL_ADMIN) {
      console.log('📧 Sending admin notification email...');
      const adminEmailSuccess = await sendAdminOrderNotification(testOrderData);

      if (adminEmailSuccess) {
        console.log('✅ Admin notification email sent successfully!');
        console.log('   Check inbox:', process.env.EMAIL_ADMIN);
      } else {
        console.log('❌ Failed to send admin notification email');
      }
    } else {
      console.log('⚠️  Skipping admin email test - EMAIL_ADMIN not set');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ Email test completed!');
    console.log('='.repeat(80));
    console.log('');
    console.log('If emails were sent successfully, you should receive:');
    console.log('  1. A detailed receipt email with order information');
    console.log('  2. Custom ingredients and additional items listed');
    console.log('  3. Payment confirmation and order date/time');
    console.log('  4. 📎 PDF receipt attachment (from PayPlus in production)');
    console.log('');
    console.log('Note: Check your spam folder if you don\'t see the emails.');
    console.log('Note: The PDF in this test is a mock - real orders will have PayPlus PDF receipts.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error during email test:', error);
    console.error('');
    console.error('Common issues:');
    console.error('  - Incorrect SMTP credentials');
    console.error('  - SMTP server blocking the connection');
    console.error('  - Firewall blocking port 587');
    console.error('  - Email provider requiring app-specific password');
    console.error('');
    process.exit(1);
  }
}

// Run the test
testEmail();
