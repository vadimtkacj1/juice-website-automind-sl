# How to Test PayPlus API in Postman

## Quick Setup Guide

### Step 1: Open Postman
- Download Postman: https://www.postman.com/downloads/
- Open the application

### Step 2: Create New Request
1. Click **"New"** button (top left)
2. Select **"HTTP Request"**
3. Or click the **"+"** tab

### Step 3: Configure Request

**Method:** Change to **POST** (dropdown on left)

**URL:** 
```
https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink
```

### Step 4: Add Headers

Click **"Headers"** tab, then add:

**Header:**
- **Key:** `Content-Type`
- **Value:** `application/json`
- ✅ **Check the box** to enable

**Note:** API credentials are passed in the request body, not in headers.

### Step 5: Add Request Body

1. Click **"Body"** tab
2. Select **"raw"** radio button
3. In dropdown (right side), select **"JSON"**
4. Paste this JSON:

```json
{
  "api_key": "b20d5bcb-5032-4462-a9b7-235b46ba9d63",
  "secret_key": "1cd62606-aedb-41db-886c-5072c240f8df",
  "payment_page_uid": "87bc7e70-c6f9-4714-b988-fee3ddd83d46",
  "charge_method": 1,
  "amount": 4.99,
  "currency_code": "ILS",
  "sendEmailApproval": true,
  "sendEmailFailure": false,
  "refURL_callback": "https://yourserver.com/callback",
  "initial_invoice": true,
  "hide_identification_id": false,
  "more_info": "test-order-123",
  "customer": {
    "customer_name": "Test Customer",
    "email": "test@example.com"
  }
}
```

### Step 6: Send Request

Click the blue **"Send"** button (top right)

## Expected Results

### ✅ Success Response (200 OK):
```json
{
  "status": {
    "code": 0,
    "message": "success"
  },
  "results": {
    "payment_page_link": "https://secure.payplus.co.il/...",
    "uid": "payment-uid-here"
  }
}
```

### ❌ Error Response (422):
```json
{
  "message": "AUTHORIZATION HEADER IS NOT VALID"
}
```

## What This Means

- **If you get Success (200):** Your API key works! The code will work too.
- **If you get Error (422):** Your API key is not activated. Contact PayPlus support.

## Visual Guide

Your Postman window should look like this:

```
┌─────────────────────────────────────────────────────────┐
│ POST │ https://restapidev.payplus.co.il/api/v1.0/... │ Send │
├─────────────────────────────────────────────────────────┤
│ Params │ Authorization │ Headers │ Body │ Pre-request │ Tests │
├─────────────────────────────────────────────────────────┤
│ [Headers Tab Selected]                                  │
│                                                          │
│ ✅ Content-Type: application/json                       │
│                                                          │
│ Note: api_key and secret_key go in the body, not headers│
├─────────────────────────────────────────────────────────┤
│ [Body Tab Selected - raw, JSON]                         │
│                                                          │
│ {                                                       │
│   "payment_page_uid": "87bc7e70-...",                  │
│   "charge_method": 1,                                   │
│   "amount": 4.99,                                      │
│   "currency_code": "ILS",                               │
│   ...                                                   │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "AUTHORIZATION HEADER IS NOT VALID" or similar errors
- ✅ Verify `api_key` and `secret_key` are in the request body
- ✅ Check API key is correct: `b20d5bcb-5032-4462-a9b7-235b46ba9d63`
- ✅ Check secret key is correct: `1cd62606-aedb-41db-886c-5072c240f8df`
- ✅ Contact PayPlus to activate your API key

### "Invalid JSON"
- ✅ Make sure you selected "raw" and "JSON"
- ✅ Check for syntax errors (commas, quotes)
- ✅ Validate JSON format

### Connection Error
- ✅ Check your internet connection
- ✅ Verify URL is correct
- ✅ Try again

## Note About Test Mode

**Test Mode** (`PAYPLUS_TEST_MODE=true`) is for **your code only** - it bypasses the PayPlus API call.

**Postman always tests the real API** - there's no test mode in Postman.

Use Postman to verify your API key works with the real PayPlus API.

