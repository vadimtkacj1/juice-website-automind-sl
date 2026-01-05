# PayPlus Secure Payment Integration

## Overview

This document describes the PayPlus payment gateway integration for secure online payments. The system provides a complete payment flow from cart to payment completion with proper security measures and error handling.

## Payment Flow

### 1. Cart → Checkout Page
- User adds items to cart
- Clicks "Continue to Checkout" button in cart
- Redirected to `/checkout` page

### 2. Secure Checkout Page (`/checkout`)
- User reviews order summary with all items, quantities, and prices
- Enters contact information:
  - Full Name (required)
  - Email Address (required)
  - Phone Number (required)
  - Delivery Address (optional)
- Form validation ensures all required fields are filled correctly
- Displays PayPlus security badges and information
- Clicks "Proceed to Payment" button

### 3. API: Create Pending Order
**Endpoint:** `POST /api/checkout`

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Orange Juice",
      "price": 15.00,
      "quantity": 2,
      "customIngredients": [...],
      "additionalItems": [...]
    }
  ],
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "050-1234567",
    "deliveryAddress": "123 Main St, Tel Aviv"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderToken": "abc123...",
  "orderNumber": "ORD-1234567890",
  "total": 30.00,
  "paymentUrl": "https://payplus.co.il/payment/...",
  "redirectUrl": "https://payplus.co.il/payment/..."
}
```

**Process:**
1. Validates items and customer information
2. Calculates order total including custom ingredients
3. Creates a **pending order** in database (not final order yet)
4. Generates secure order token
5. Calls PayPlus API to generate payment link
6. Returns payment URL to redirect user

### 4. Redirect to PayPlus
- User is automatically redirected to PayPlus secure payment page
- PayPlus handles all payment processing securely:
  - Credit card information
  - PCI DSS compliance
  - 3D Secure verification
  - Payment encryption

### 5. PayPlus Callback
**Endpoint:** `GET/POST /api/payplus/callback?token={orderToken}`

**Query Parameters:**
- `token` - Secure order token
- `status` - Payment status (success/failed)
- `uid` - PayPlus payment UID
- `transaction_id` - Transaction ID
- `test_mode` - Test mode flag

**Process:**
1. Receives callback from PayPlus after payment
2. Retrieves pending order from database using token
3. Verifies payment status
4. If successful:
   - Creates **final order** in database
   - Deletes pending order
   - Sends Telegram notification to admin
   - Redirects to success page
5. If failed:
   - Deletes pending order
   - Redirects to error page

### 6. Success/Error Page (`/checkout/success`)
- Displays order confirmation with order number (on success)
- Shows error message and retry options (on failure)
- Clears cart from localStorage (on success only)
- Provides navigation options

## Security Features

### 1. Encrypted Connection
- All communication uses HTTPS/TLS
- Sensitive data encrypted in transit

### 2. PCI DSS Compliance
- No credit card data stored on our servers
- All payment processing handled by PayPlus
- PayPlus is PCI DSS Level 1 certified

### 3. Secure Tokens
- Unique tokens generated for each order
- Tokens expire after 1 hour
- One-time use tokens prevent replay attacks

### 4. Data Validation
- Server-side validation of all inputs
- Phone and email format validation
- Amount and item validation

### 5. Order Verification
- Pending orders stored temporarily
- Final orders only created after payment confirmation
- Prevents orders without payment

## Configuration

### Environment Variables

```env
# PayPlus API Credentials
PAYPLUS_API_KEY=your-api-key-here
PAYPLUS_SECRET_KEY=your-secret-key-here
PAYPLUS_PAGE_UID=your-page-uid-here

# PayPlus API URL (optional, defaults to production)
PAYPLUS_API_URL=https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink

# Test Mode (optional, only for development/testing)
# WARNING: Bypasses actual payment - only for testing!
PAYPLUS_TEST_MODE=false

# Deployment URL for callbacks
DEPLOYMENT_URL=https://yourdomain.com
```

### Getting PayPlus Credentials

1. Sign up for PayPlus merchant account at https://www.payplus.co.il
2. Access your PayPlus dashboard
3. Navigate to API Settings
4. Generate API Key and Secret Key
5. Create a Payment Page and note the Page UID
6. Update environment variables

## Test Mode

**⚠️ WARNING:** Test mode bypasses actual payment processing!

```env
PAYPLUS_TEST_MODE=true
```

When enabled:
- Skips PayPlus API call
- Returns mock payment URL
- Auto-approves all payments
- Order is created without real payment

**NEVER enable test mode in production!**

## Database Tables

### pending_orders
Temporary storage for orders before payment confirmation.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| order_token | TEXT | Unique secure token |
| order_data | TEXT | JSON with items and customer info |
| total_amount | REAL | Order total |
| payment_uid | TEXT | PayPlus payment UID |
| expires_at | DATETIME | Expiration timestamp (1 hour) |
| created_at | DATETIME | Creation timestamp |

### orders
Final orders after payment confirmation.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| order_number | TEXT | Human-readable order number |
| customer_name | TEXT | Customer name |
| customer_email | TEXT | Customer email |
| customer_phone | TEXT | Customer phone |
| delivery_address | TEXT | Delivery address (optional) |
| total_amount | REAL | Order total |
| status | TEXT | Order status (paid/pending/cancelled) |
| payment_method | TEXT | Payment method (payplus) |
| notes | TEXT | Order notes and custom ingredients |
| created_at | DATETIME | Creation timestamp |

### order_items
Individual items in orders.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| order_id | INTEGER | Foreign key to orders |
| menu_item_id | INTEGER | Menu item ID |
| item_name | TEXT | Item name with customizations |
| quantity | INTEGER | Quantity |
| price | REAL | Unit price including customizations |

## API Endpoints

### POST /api/checkout
Create pending order and generate PayPlus payment link.

**Authentication:** None (public)
**Rate Limiting:** Recommended

### GET/POST /api/payplus/callback
Handle PayPlus payment callback.

**Authentication:** Token-based (order token)
**Methods:** GET and POST (PayPlus may use either)

## Error Handling

### Client-Side Errors
- Form validation errors displayed inline
- Network errors shown with retry option
- User-friendly error messages in Hebrew

### Server-Side Errors
- Payment link generation failures
- Database errors
- PayPlus API errors
- Order not found/expired errors

### Error Codes

| Error | Description | User Message (Hebrew) |
|-------|-------------|----------------------|
| missing_token | Order token not provided | בקשה לא תקינה |
| order_not_found | Order not found or expired | הזמנה לא נמצאה או פג תוקפה |
| payment_failed | Payment was declined | התשלום נכשל |
| order_creation_failed | Payment OK but order creation failed | שגיאת יצירת הזמנה |
| callback_error | General callback error | שגיאת עיבוד |

## User Interface

### Checkout Page Features

1. **Order Summary**
   - Sticky sidebar with cart items
   - Item images and details
   - Custom ingredients and additions
   - Quantities and prices
   - Total amount

2. **Contact Form**
   - Full name field
   - Email with validation
   - Phone with validation
   - Optional delivery address
   - Real-time validation feedback

3. **Security Indicators**
   - Lock icon with "Secure Payment"
   - PayPlus logo and branding
   - "Encrypted Connection" badge
   - "PCI DSS Compliant" badge

4. **Responsive Design**
   - Desktop: Two-column layout
   - Mobile: Stacked layout
   - Touch-friendly buttons
   - Accessible form elements

## Internationalization

All text strings are translated to Hebrew using the translation system:

```typescript
import { translateToHebrew } from '@/lib/translations';

const text = translateToHebrew('Secure Checkout');
// Returns: 'תשלום מאובטח'
```

Translation file: `lib/translations/website/index.ts`

## Testing Checklist

### Development Testing
- [ ] Test mode enabled
- [ ] Form validation working
- [ ] Pending order created
- [ ] Mock payment URL generated
- [ ] Callback processing works
- [ ] Final order created
- [ ] Success page displays

### Production Testing
- [ ] Test mode DISABLED
- [ ] Real PayPlus credentials configured
- [ ] SSL/HTTPS enabled
- [ ] Payment link generation works
- [ ] Actual payment processing
- [ ] Callback URL accessible
- [ ] Email notifications sent
- [ ] Telegram notifications sent

### Security Testing
- [ ] HTTPS enforced
- [ ] Token expiration works
- [ ] Callback token validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

## Monitoring & Logging

### Server Logs
```javascript
console.log('💳 Processing payment via PayPlus API');
console.log('✅ PayPlus payment link generated successfully');
console.error('❌ Failed to generate PayPlus payment link');
```

### PayPlus Dashboard
- Monitor transaction status
- View payment history
- Check failed payments
- Generate reports

## Troubleshooting

### Payment Link Not Generated
1. Check PayPlus credentials in environment variables
2. Verify API key format (UUID)
3. Check PayPlus API URL
4. Review server logs for errors
5. Verify minimum amount (1 ILS)

### Callback Not Received
1. Check callback URL is publicly accessible
2. Verify DEPLOYMENT_URL is correct
3. Check PayPlus webhook configuration
4. Review server logs
5. Check SSL/HTTPS certificate

### Order Not Created After Payment
1. Check pending order exists
2. Verify order token is valid
3. Check database connection
4. Review callback logs
5. Verify payment status from PayPlus

### Duplicate Orders
- Check for multiple callback requests
- Verify token is deleted after use
- Add idempotency checks if needed

## Best Practices

1. **Always use HTTPS in production**
2. **Never enable test mode in production**
3. **Keep API credentials secure**
4. **Monitor failed payments**
5. **Clean up expired pending orders regularly**
6. **Log all payment attempts**
7. **Validate all user inputs**
8. **Handle all error cases**
9. **Provide clear error messages**
10. **Test thoroughly before going live**

## Support

### PayPlus Support
- Website: https://www.payplus.co.il
- Email: support@payplus.co.il
- Phone: *6483

### Documentation
- PayPlus API Docs: https://developers.payplus.co.il
- Integration Guide: Available in PayPlus dashboard

## Version History

### v1.0.0 (Current)
- Initial PayPlus integration
- Secure checkout page
- Pending order system
- Callback handling
- Success/error pages
- Hebrew translations
- Mobile responsive design
- Test mode support

## Future Enhancements

- [ ] Invoice generation
- [ ] Refund support
- [ ] Recurring payments
- [ ] Multiple payment methods
- [ ] Saved payment methods
- [ ] Split payments
- [ ] Discount codes
- [ ] Gift cards
- [ ] Order tracking
- [ ] Email receipts

