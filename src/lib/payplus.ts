const PAYPLUS_API_KEY = process.env.PAYPLUS_API_KEY || '';
const PAYPLUS_SECRET_KEY = process.env.PAYPLUS_SECRET_KEY || '';
const PAYPLUS_PAGE_UID = process.env.PAYPLUS_PAGE_UID || '';
// Only enable test mode if explicitly set to 'true' - don't auto-enable in development
// Test mode is DISABLED by default - PayPlus payment will always be requested
const PAYPLUS_TEST_MODE = process.env.PAYPLUS_TEST_MODE === 'true';

// Log test mode status on module load
if (PAYPLUS_TEST_MODE) {
  console.warn('⚠️  WARNING: PayPlus TEST MODE is ENABLED - Payment will be bypassed!');
  console.warn('   To disable test mode, remove PAYPLUS_TEST_MODE from environment variables');
} else {
  console.log('✅ PayPlus TEST MODE is DISABLED - Payment will be requested via PayPlus');
}
// Use PAYPLUS_API_URL if provided (full URL), otherwise use base URL
const PAYPLUS_API_URL = process.env.PAYPLUS_API_URL || 'https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink';
const PAYPLUS_BASE_URL = PAYPLUS_API_URL.includes('/PaymentPages/generateLink') 
  ? PAYPLUS_API_URL 
  : `${PAYPLUS_API_URL}/PaymentPages/generateLink`;

interface PayPlusCustomer {
  customer_name: string;
  email: string;
  phone?: string;
}

interface PayPlusPaymentRequest {
  payment_page_uid: string;
  charge_method: number;
  amount: number | string; // PayPlus might accept either
  currency_code: string;
  sendEmailApproval?: boolean;
  sendEmailFailure?: boolean;
  refURL_callback: string;
  initial_invoice?: boolean;
  hide_identification_id?: boolean;
  more_info?: string;
  customer?: PayPlusCustomer; // Required for invoice generation
}

interface PayPlusPaymentResponse {
  results?: {
    code?: number;
    status?: string;
    message?: string;
    description?: string;
    payment_page_link?: string;
    uid?: string;
  };
  data?: {
    payment_page_link?: string;
    page_request_uid?: string;
    uid?: string;
  };
  status?: {
    code?: number;
    message?: string;
  };
  message?: string; // Root-level message for error responses
}

/**
 * Generate a PayPlus payment link
 */
export async function generatePayPlusLink(options: {
  amount: number;
  currency_code?: string;
  orderNumber: string;
  orderToken?: string; // Token for webhook identification
  callbackUrl: string;
  customerEmail?: string;
  customerName?: string;
}): Promise<{
  success: boolean;
  paymentUrl?: string;
  paymentUid?: string;
  error?: string;
}> {
  // Test mode: Skip PayPlus API call and return mock payment URL
  // ⚠️ WARNING: This bypasses actual payment - only use for testing!
  if (PAYPLUS_TEST_MODE) {
    console.warn('🧪 PayPlus TEST MODE ACTIVE: Skipping actual payment API call');
    console.warn('   ⚠️  Payment will be bypassed - order will be auto-approved');
    console.log('   Order:', options.orderNumber);
    console.log('   Amount:', options.amount);
    console.log('   Callback URL:', options.callbackUrl);
    
    // Return a mock payment URL that redirects to callback with success
    const mockPaymentUrl = `${options.callbackUrl}&status=success&test_mode=true`;
    
    return {
      success: true,
      paymentUrl: mockPaymentUrl,
      paymentUid: `test-${Date.now()}`,
    };
  }
  
  // Normal mode: Use actual PayPlus API
  console.log('💳 Processing payment via PayPlus API');
  console.log('   Order:', options.orderNumber);
  console.log('   Amount:', options.amount);

  if (!PAYPLUS_API_KEY || !PAYPLUS_SECRET_KEY || !PAYPLUS_PAGE_UID) {
    return {
      success: false,
      error: 'פרטי אימות PayPlus לא הוגדרו. אנא צור קשר עם התמיכה.',
    };
  }

    try {
      // Format amount to 2 decimal places (PayPlus requires exactly 2 decimal places)
      // Keep as number but ensure it has proper decimal precision
      const formattedAmount = Math.round(options.amount * 100) / 100;
      
      // Validate amount is positive
      if (formattedAmount <= 0) {
        return {
          success: false,
          error: 'הסכום חייב להיות גדול מ-0',
        };
      }
      
      // PayPlus requires minimum amount of 1 ILS (changed from 3 for testing)
      if (formattedAmount < 1) {
        return {
          success: false,
          error: 'הסכום המינימלי הוא 1 ש"ח',
        };
      }
      
      // Log formatted amount for debugging
      console.log('   Formatted Amount:', formattedAmount);
      console.log('   Amount as string:', formattedAmount.toFixed(2));
    
    // Ensure callback URL is absolute and valid
    let callbackUrl = options.callbackUrl;
    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
      callbackUrl = `https://${callbackUrl}`;
    }

    // Validate payment_page_uid is not empty
    if (!PAYPLUS_PAGE_UID || PAYPLUS_PAGE_UID.trim() === '') {
      return {
        success: false,
        error: 'מזהה דף תשלום PayPlus לא הוגדר',
      };
    }

    // PayPlus authentication - prepare API key first
    // Remove any whitespace, newlines, or special characters
    const apiKey = PAYPLUS_API_KEY.trim().replace(/\s+/g, '');
    const secretKey = PAYPLUS_SECRET_KEY.trim().replace(/\s+/g, '');
    
    // Verify API key format (should be UUID format)
    if (!apiKey || apiKey.length < 30) {
      return {
        success: false,
        error: 'מפתח API של PayPlus נראה לא תקין או קצר מדי',
      };
    }
    
    // Check for common issues
    if (apiKey.includes('your_') || apiKey.includes('example') || apiKey.length !== 36) {
      console.warn('API Key may be a placeholder or incorrect format');
    }

    // Build webhook URL (server-to-server notification)
    // Extract base URL from callback URL
    const callbackUrlObj = new URL(callbackUrl);
    const baseUrl = `${callbackUrlObj.protocol}//${callbackUrlObj.host}`;
    const webhookUrl = `${baseUrl}/api/payplus/webhook`;
    
    // Build payment request - PayPlus requires Authorization header, not credentials in body
    const requestBody: any = {
      payment_page_uid: PAYPLUS_PAGE_UID.trim(),
      charge_method: 1,
      amount: formattedAmount, // Send as number
      currency_code: (options.currency_code || 'ILS').toUpperCase(),
      sendEmailApproval: true,
      sendEmailFailure: false,
      refURL_callback: callbackUrl,
      initial_invoice: true,
      hide_identification_id: false,
      // Use orderToken for webhook identification, fallback to orderNumber for display
      more_info: options.orderToken || options.orderNumber || '',
      // Add webhook URL for server-to-server notifications (PayPlus field: more_info_6)
      more_info_6: webhookUrl,
    };
    
    // Add customer object only if email is provided (for invoice generation)
    if (options.customerEmail) {
      requestBody.customer = {
        customer_name: options.customerName || options.customerEmail.split('@')[0] || 'Customer',
        email: options.customerEmail,
      };
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('💳 CREATING PAYPLUS PAYMENT LINK');
    console.log('='.repeat(80));
    console.log('📋 PayPlus Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🌐 PayPlus API URL:', PAYPLUS_BASE_URL);
    console.log('📡 PayPlus Webhook URL (more_info_6):', webhookUrl);
    console.log('🔄 PayPlus Callback URL (refURL_callback):', callbackUrl);
    console.log('🔑 Order Token (more_info):', options.orderToken || options.orderNumber || 'NOT SET');
    console.log('='.repeat(80));

    // PayPlus authentication: Authorization header with JSON string containing api_key and secret_key
    // Format: Authorization: {"api_key":"...","secret_key":"..."}
    // IMPORTANT: Header must be a STRING, not an object!
    const authHeaderValue = JSON.stringify({ api_key: apiKey, secret_key: secretKey });
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeaderValue, // Must be a JSON string, not an object
    };

    console.log('🔐 Using PayPlus authentication: JSON object in Authorization header');
    console.log('   API Key configured:', apiKey.length > 0 ? '✓' : '✗');
    console.log('   Secret Key configured:', secretKey.length > 0 ? '✓' : '✗');
    
    // Make the request with Authorization header containing JSON
    const response = await fetch(PAYPLUS_BASE_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody), // Payment details only, no credentials in body
    });

    if (!response.ok) {
      let errorText = '';
      let errorJson = null;
      try {
        errorText = await response.text();
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // If parsing fails, use text as is
      }
      
      console.error('❌ PayPlus API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        errorJson: errorJson,
      });
      
      const errorMessage = errorJson?.status?.message || 
                           errorJson?.message || 
                           errorText || 
                           `PayPlus API error: ${response.status} ${response.statusText}`;
      
      // Provide helpful error message in Hebrew
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('AUTHORIZATION') || errorMessage.includes('NOT VALID')) {
        userFriendlyError = 'אימות PayPlus נכשל. אנא ודא שפרטי האימות שלך נכונים ופעילים. צור קשר עם תמיכת PayPlus אם הבעיה נמשכת.';
      } else if (errorMessage.includes('Failed to generate payment link') || errorMessage.includes('failed')) {
        userFriendlyError = 'נכשל ביצירת קישור תשלום. אנא נסה שוב או צור קשר עם התמיכה.';
      }
      
      return {
        success: false,
        error: userFriendlyError,
      };
    }

    const responseText = await response.text();
    let data: PayPlusPaymentResponse;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse PayPlus response:', responseText);
      return {
        success: false,
        error: 'תגובה לא תקינה מ-PayPlus. אנא נסה שוב.',
      };
    }

    // PayPlus success response can have different formats
    // Actual response structure: { results: { code: 0, status: "success" }, data: { payment_page_link: "...", page_request_uid: "..." } }
    // Check for success in multiple ways
    const isSuccess = 
      (data.results?.code === 0) ||
      (data.results?.status === 'success') ||
      (data.status?.code === 0) || 
      (data.status?.code === 200) ||
      (response.status === 200 && (data.data?.payment_page_link || data.results?.payment_page_link));
    
    // Try to get payment link from different possible locations
    const paymentLink = data.data?.payment_page_link || data.results?.payment_page_link;
    const paymentUid = data.data?.page_request_uid || data.results?.uid;
    
    if (isSuccess && paymentLink) {
      console.log('');
      console.log('='.repeat(80));
      console.log('✅ PAYPLUS PAYMENT LINK GENERATED SUCCESSFULLY');
      console.log('='.repeat(80));
      console.log('Payment URL:', paymentLink);
      console.log('Order:', options.orderNumber);
      console.log('Amount:', formattedAmount, options.currency_code || 'ILS');
      console.log('🔔 Webhook will be called by PayPlus at:', webhookUrl);
      console.log('🔙 User will be redirected to:', callbackUrl);
      console.log('='.repeat(80));
      console.log('');
      return {
        success: true,
        paymentUrl: paymentLink,
        paymentUid: paymentUid,
      };
    }

    // Log the full response for debugging
    console.error('PayPlus API Response:', JSON.stringify(data, null, 2));
    
    // Translate error messages to Hebrew
    const rawError = data.status?.message || data.message || 'Failed to generate payment link';
    let translatedError = rawError;
    
    // Translate common PayPlus errors to Hebrew
    if (rawError.includes('AUTHORIZATION') || rawError.includes('NOT VALID')) {
      translatedError = 'אימות PayPlus נכשל. אנא ודא שפרטי האימות שלך נכונים ופעילים.';
    } else if (rawError.includes('Failed to generate') || rawError.includes('failed')) {
      translatedError = 'נכשל ביצירת קישור תשלום. אנא נסה שוב.';
    }
    
    return {
      success: false,
      error: translatedError,
    };
  } catch (error: any) {
    console.error('PayPlus API error:', error);
    return {
      success: false,
      error: 'נכשל להתחבר ל-PayPlus. אנא נסה שוב מאוחר יותר.',
    };
  }
}

/**
 * Check if PayPlus is configured
 */
export function isPayPlusConfigured(): boolean {
  return !!(PAYPLUS_API_KEY && PAYPLUS_SECRET_KEY && PAYPLUS_PAGE_UID);
}

