# Testing PayPlus API

## Option 1: Test with Postman (Recommended)

1. **Open Postman**
2. **Create a new POST request** to:
   ```
   https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink
   ```

3. **Set Headers:**
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer b20d5bcb-5032-4462-a9b7-235b46ba9d63`

4. **Set Body (raw JSON):**
   ```json
   {
     "payment_page_uid": "87bc7e70-c6f9-4714-b988-fee3ddd83d46",
     "charge_method": 1,
     "amount": 20.00,
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

5. **Click Send** and check the response

## Option 2: Test with Node.js script

Run the test script:
```bash
node test-payplus.js
```

This will try 3 different authentication methods and show you which one works.

## Common Issues

### "AUTHORIZATION HEADER IS NOT VALID"

This usually means:
1. **API key is not activated** - Contact PayPlus to activate your API key
2. **Wrong environment** - Make sure you're using the correct URL:
   - Dev: `https://restapidev.payplus.co.il/api/v1.0`
   - Production: `https://restapi.payplus.co.il/api/v1.0`
3. **Account not fully set up** - You need to:
   - Sign up at: https://payplus.co.il/signup?a_id=19
   - Wait for PayPlus to contact you
   - Get your API credentials from them

### Next Steps

1. **Test in Postman first** - This will tell you if the API key works
2. **If Postman works but code doesn't** - There's a code issue
3. **If Postman doesn't work** - The API key needs to be activated by PayPlus

## Contact PayPlus Support

If testing shows the API key is invalid:
- Email: support@payplus.co.il
- Phone: Check their website
- Ask them to:
  - Verify API key is active
  - Confirm it's for the correct environment
  - Provide working test credentials

