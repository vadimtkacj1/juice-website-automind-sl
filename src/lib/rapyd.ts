import crypto from 'crypto';

const RAPYD_ACCESS_KEY = process.env.RAPYD_ACCESS_KEY || '';
const RAPYD_SECRET_KEY = process.env.RAPYD_SECRET_KEY || '';
const RAPYD_BASE_URL = 'https://sandboxapi.rapyd.net'; // Use 'https://api.rapyd.net' for production

interface RapydCheckoutRequest {
  amount: number;
  currency: string;
  country: string;
  customer_email: string;
  customer_phone: string;
  complete_checkout_url: string;
  cancel_checkout_url: string;
  metadata?: Record<string, any>;
  cart_items?: Array<{
    name: string;
    amount: number;
    quantity: number;
  }>;
}

function generateSignature(
  httpMethod: string,
  urlPath: string,
  salt: string,
  timestamp: number,
  body: string
): string {
  const toSign = httpMethod.toLowerCase() + urlPath + salt + timestamp + RAPYD_ACCESS_KEY + RAPYD_SECRET_KEY + body;
  const hash = crypto.createHmac('sha256', RAPYD_SECRET_KEY);
  hash.update(toSign);
  return Buffer.from(hash.digest('hex')).toString('base64');
}

function generateSalt(length: number = 12): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

async function makeRapydRequest(
  method: string,
  path: string,
  body: any = null
): Promise<any> {
  const salt = generateSalt();
  const timestamp = Math.floor(Date.now() / 1000);
  const bodyString = body ? JSON.stringify(body) : '';
  
  const signature = generateSignature(method, path, salt, timestamp, bodyString);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'access_key': RAPYD_ACCESS_KEY,
    'salt': salt,
    'timestamp': timestamp.toString(),
    'signature': signature,
  };
  
  const response = await fetch(`${RAPYD_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return response.json();
}

export async function createRapydCheckout(options: RapydCheckoutRequest): Promise<{
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
}> {
  if (!RAPYD_ACCESS_KEY || !RAPYD_SECRET_KEY) {
    return {
      success: false,
      error: 'Rapyd API keys not configured. Add RAPYD_ACCESS_KEY and RAPYD_SECRET_KEY to .env.local',
    };
  }

  try {
    const checkoutBody = {
      amount: options.amount,
      currency: options.currency,
      country: options.country,
      complete_checkout_url: options.complete_checkout_url,
      cancel_checkout_url: options.cancel_checkout_url,
      merchant_reference_id: `order_${Date.now()}`,
      language: 'en',
      metadata: {
        ...options.metadata,
        customer_email: options.customer_email,
        customer_phone: options.customer_phone,
      },
      cart_items: options.cart_items,
    };

    const response = await makeRapydRequest('POST', '/v1/checkout', checkoutBody);
    
    if (response.status?.status === 'SUCCESS' && response.data) {
      return {
        success: true,
        checkoutUrl: response.data.redirect_url,
        checkoutId: response.data.id,
      };
    }

    return {
      success: false,
      error: response.status?.message || 'Failed to create checkout',
    };
  } catch (error: any) {
    console.error('Rapyd API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to Rapyd',
    };
  }
}

export function isRapydConfigured(): boolean {
  return !!(RAPYD_ACCESS_KEY && RAPYD_SECRET_KEY);
}

