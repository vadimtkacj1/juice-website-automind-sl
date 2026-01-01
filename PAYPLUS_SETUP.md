# PayPlus Integration Setup Guide

## ✅ What's Already Done

The PayPlus integration is **fully implemented** and ready to use. Here's what's configured:

1. ✅ PayPlus payment library (`lib/payplus.ts`)
2. ✅ Checkout route integration (`app/api/checkout/route.ts`)
3. ✅ Payment callback handler (`app/api/payplus/callback/route.ts`)
4. ✅ Pending orders system (orders created only after payment)
5. ✅ Database schema with `pending_orders` table
6. ✅ Deployment configuration (GitHub Actions, Docker, etc.)

## 🔧 Setup Steps

### Step 1: Create `.env.local` File

Create a `.env.local` file in your project root with:

```env
# PayPlus Configuration
PAYPLUS_API_KEY=b20d5bcb-5032-4462-a9b7-235b46ba9d63
PAYPLUS_SECRET_KEY=1cd62606-aedb-41db-886c-5072c240f8df
PAYPLUS_PAGE_UID=87bc7e70-c6f9-4714-b988-fee3ddd83d46
PAYPLUS_API_URL=https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink

# Deployment URL (for callbacks)
DEPLOYMENT_URL=http://localhost:3000

# Other required variables
NODE_ENV=development
SESSION_SECRET=your_random_secret_here
DATABASE_PATH=./juice_website.db
```

### Step 2: Activate Your PayPlus API Key

**IMPORTANT:** The API key must be activated in your PayPlus account.

1. **Sign up/Login** to PayPlus: https://payplus.co.il/signup?a_id=19
2. **Contact PayPlus support** to activate your API key
3. **Verify** the API key is active in your PayPlus dashboard

### Step 3: Test in Postman First

Before using in your website, test the API key in Postman:

1. **Open Postman**
2. **POST** to: `https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink`
3. **Headers:**
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer b20d5bcb-5032-4462-a9b7-235b46ba9d63`
4. **Body (JSON):**
```json
{
  "payment_page_uid": "87bc7e70-c6f9-4714-b988-fee3ddd83d46",
  "charge_method": 1,
  "amount": 4.99,
  "currency_code": "ILS",
  "sendEmailApproval": true,
  "sendEmailFailure": false,
  "refURL_callback": "https://yourserver.com/callback",
  "initial_invoice": true,
  "hide_identification_id": false,
  "more_info": "test-order-123"
}
```

If Postman works → Your code will work  
If Postman fails → API key needs activation

### Step 4: Initialize Database

Make sure the `pending_orders` table exists:

```bash
npm run init-db
```

### Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Add items to cart on your website
3. Go to checkout
4. Fill in customer details
5. Click "Place Order"

**Expected Flow:**
- Pending order is created
- PayPlus payment link is generated
- You're redirected to PayPlus payment page
- After payment, callback creates the actual order
- You're redirected to success page

## 🔍 Troubleshooting

### Error: "AUTHORIZATION HEADER IS NOT VALID"

**Solution:**
1. Test in Postman first
2. Verify API key is activated in PayPlus dashboard
3. Contact PayPlus support to activate your API key
4. Check API key is for correct environment (dev vs production)

### Error: "Pending order not found"

**Solution:**
- Check database has `pending_orders` table
- Run: `npm run init-db`
- Verify order token is passed correctly in callback URL

### Payment Link Not Generated

**Solution:**
- Check `.env.local` file exists and has correct values
- Verify all PayPlus credentials are set
- Check server logs for detailed error messages
- Ensure `DEPLOYMENT_URL` is set correctly

## 📝 How It Works

1. **Customer fills checkout form** → Data sent to `/api/checkout`
2. **Pending order created** → Stored in `pending_orders` table with token
3. **PayPlus link generated** → Customer redirected to PayPlus
4. **Customer pays** → On PayPlus payment page
5. **PayPlus callback** → Sends payment status to `/api/payplus/callback`
6. **Order created** → Only if payment successful
7. **Customer redirected** → To success page

## 🚀 Production Deployment

For production, update your `.env.local` or server environment:

```env
PAYPLUS_API_URL=https://restapi.payplus.co.il/api/v1.0/PaymentPages/generateLink
DEPLOYMENT_URL=https://yourdomain.com
```

And add to GitHub Secrets:
- `PAYPLUS_API_KEY`
- `PAYPLUS_SECRET_KEY`
- `PAYPLUS_PAGE_UID`
- `DEPLOYMENT_URL`

## ✅ Status

**Code Status:** ✅ Complete and ready  
**API Key Status:** ⚠️ Needs activation  
**Next Step:** Activate API key in PayPlus dashboard

Once the API key is activated, everything will work automatically!

