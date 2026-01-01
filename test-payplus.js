// Test PayPlus API directly
// Run with: node test-payplus.js

const API_KEY = 'b20d5bcb-5032-4462-a9b7-235b46ba9d63';
const SECRET_KEY = '1cd62606-aedb-41db-886c-5072c240f8df';
const PAGE_UID = '87bc7e70-c6f9-4714-b988-fee3ddd83d46';
const BASE_URL = 'https://restapidev.payplus.co.il/api/v1.0';

async function testPayPlus() {
  const paymentRequest = {
    payment_page_uid: PAGE_UID,
    charge_method: 1,
    amount: 20.00,
    currency_code: 'ILS',
    sendEmailApproval: true,
    sendEmailFailure: false,
    refURL_callback: 'https://yourserver.com/callback',
    initial_invoice: true,
    hide_identification_id: false,
    more_info: 'test-order-123',
    customer: {
      customer_name: 'Test Customer',
      email: 'test@example.com'
    }
  };

  console.log('Testing PayPlus API...\n');
  console.log('Request:', JSON.stringify(paymentRequest, null, 2));
  console.log('\n---\n');

  // Test Method 1: Bearer token
  console.log('Method 1: Bearer token');
  try {
    const response1 = await fetch(`${BASE_URL}/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(paymentRequest),
    });

    const result1 = await response1.text();
    console.log('Status:', response1.status);
    console.log('Response:', result1);
    
    if (response1.ok) {
      console.log('\n✅ SUCCESS with Bearer token!');
      return;
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n---\n');

  // Test Method 2: Direct API key
  console.log('Method 2: Direct API key (no Bearer)');
  try {
    const response2 = await fetch(`${BASE_URL}/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
      },
      body: JSON.stringify(paymentRequest),
    });

    const result2 = await response2.text();
    console.log('Status:', response2.status);
    console.log('Response:', result2);
    
    if (response2.ok) {
      console.log('\n✅ SUCCESS with direct API key!');
      return;
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n---\n');

  // Test Method 3: Basic auth
  console.log('Method 3: Basic auth (API_KEY:SECRET_KEY)');
  try {
    const credentials = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString('base64');
    const response3 = await fetch(`${BASE_URL}/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(paymentRequest),
    });

    const result3 = await response3.text();
    console.log('Status:', response3.status);
    console.log('Response:', result3);
    
    if (response3.ok) {
      console.log('\n✅ SUCCESS with Basic auth!');
      return;
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n❌ All methods failed. Please check:');
  console.log('1. API key is activated in PayPlus dashboard');
  console.log('2. API key is for the correct environment (dev vs production)');
  console.log('3. Contact PayPlus support to verify credentials');
}

testPayPlus();

