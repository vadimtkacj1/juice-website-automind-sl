# How to Test PayPlus API in Postman

## Step-by-Step Instructions

### Step 1: Open Postman
- Download Postman if you don't have it: https://www.postman.com/downloads/
- Open Postman application

### Step 2: Create New Request
1. Click **"New"** button (top left)
2. Select **"HTTP Request"**
3. Or click the **"+"** tab to create a new request

### Step 3: Set Request Method and URL
1. Change method to **POST** (dropdown on the left, default is GET)
2. Enter this URL in the address bar:
   ```
   https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink
   ```

### Step 4: Add Headers
1. Click on **"Headers"** tab (below the URL bar)
2. Add these two headers:

   **Header 1:**
   - Key: `Content-Type`
   - Value: `application/json`
   - ✅ Check the box to enable it

   **Header 2:**
   - Key: `Authorization`
   - Value: `Bearer b20d5bcb-5032-4462-a9b7-235b46ba9d63`
   - ✅ Check the box to enable it

### Step 5: Add Request Body
1. Click on **"Body"** tab (next to Headers)
2. Select **"raw"** radio button
3. In the dropdown on the right, select **"JSON"**
4. Paste this JSON in the text area:

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

### Step 6: Send Request
1. Click the blue **"Send"** button (top right)
2. Wait for the response

### Step 7: Check Response
- If successful (200 OK): You'll see a response with `payment_page_link`
- If failed (422): You'll see error message

## What the Amount Means

The `amount` field is the **payment amount in ILS (Israeli Shekels)**.

- **4.99** = 4.99 ILS (about $1.30 USD)
- This is the amount the customer will pay
- You can change it to any amount you want (minimum is usually 0.01)

## Expected Response

### Success Response (200 OK):
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

### Error Response (422):
```json
{
  "message": "AUTHORIZATION HEADER IS NOT VALID"
}
```

## Troubleshooting

### If you get "AUTHORIZATION HEADER IS NOT VALID":
1. ✅ Check the Authorization header has `Bearer ` (with space) before the API key
2. ✅ Verify API key is correct: `b20d5bcb-5032-4462-a9b7-235b46ba9d63`
3. ✅ Contact PayPlus support to activate your API key

### If you get other errors:
- Check all headers are enabled (checkboxes checked)
- Verify JSON is valid (no syntax errors)
- Make sure you're using POST method, not GET

## Screenshot Guide

Your Postman should look like this:

```
┌─────────────────────────────────────────────────┐
│ POST │ https://restapidev.payplus.co.il/... │ Send │
├─────────────────────────────────────────────────┤
│ Params │ Authorization │ Headers │ Body │ Pre-request │ Tests │
├─────────────────────────────────────────────────┤
│ Headers Tab:                                    │
│ ✅ Content-Type: application/json              │
│ ✅ Authorization: Bearer b20d5bcb-5032-...    │
├─────────────────────────────────────────────────┤
│ Body Tab (raw, JSON selected):                 │
│ {                                               │
│   "payment_page_uid": "87bc7e70-...",          │
│   "charge_method": 1,                          │
│   "amount": 4.99,                              │
│   ...                                           │
│ }                                               │
└─────────────────────────────────────────────────┘
```

