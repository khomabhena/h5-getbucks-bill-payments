# Email Draft: GetBucks Airtime & Bill Payments Apps Integration

---

**Subject:** GetBucks Mobile App & Internet Banking - Airtime & Bill Payments Integration Guide

---

Good morning,

I'm writing to provide you with the integration details for the GetBucks Airtime and Bill Payments applications that will be embedded in the GetBucks Mobile App and Internet Banking platforms.

## Application Links

The following H5 applications are now live and ready for integration:

- **Airtime Top-Up App**: https://h5-getbucks-airtime.vercel.app
- **Bill Payments App**: https://h5-getbucks-bill-payments.vercel.app

## Integration Overview

These applications are designed to be embedded within the GetBucks Mobile App and Internet Banking platforms. Communication between the apps and the banking systems will be handled via URL parameters and authentication headers.

## Required URL Parameters

The applications listen for the following request parameters, which should be appended to the URLs when launching the apps:

### Required Parameters:

1. **`accountNumber`** (string, required)
   - Customer/client account number (debit account)
   - **Must be appended to the URL** when opening the apps
   - Format: `?accountNumber=00001203`
   - Required for payment processing - this is the account that will be debited

2. **`clientNumber`** (string, optional but recommended)
   - Client number (may be same as customer ID)
   - Format: `?clientNumber=023557`
   - Used in account transfer creation

3. **`mode`** (string, optional)
   - Integration mode: `iframe` | `native` | `standalone`
   - Defaults to `iframe` if embedded in web view
   - Use `native` for mobile app integration

**Note**: OAuth credentials (username, password, systemId) should be configured via environment variables or provided by the bank for API authentication. The app handles token acquisition and refresh automatically.

### Optional Parameters:

3. **`returnUrl`** (string, optional)
   - URL to redirect to after transaction completion
   - If not provided, app will handle navigation internally

### Example URLs:

```
# For Mobile App (Native Mode)
https://h5-getbucks-airtime.vercel.app?accountNumber=00001203&clientNumber=023557&mode=native

# For Internet Banking (Iframe Mode)
https://h5-getbucks-airtime.vercel.app?accountNumber=00001203&clientNumber=023557&mode=iframe

# With Return URL
https://h5-getbucks-airtime.vercel.app?accountNumber=00001203&clientNumber=023557&mode=iframe&returnUrl=https://banking.getbucks.com/dashboard
```

**Note**: `accountNumber` is required and must be appended to the URL when opening the apps. `clientNumber` is recommended for proper account transfer creation.

## Authentication Requirements

The authentication details **will be provided by GetBucks Bank**. The applications use OAuth authentication with the GetBucks Bank API:

1. **OAuth Credentials** (provided by bank)
   - `grant_type`: OAuth grant type (typically "password")
   - `username`: API username
   - `password`: API password
   - `systemId`: System identifier

2. **Access Token** (obtained via OAuth endpoint)
   - The app authenticates with `/token` endpoint using OAuth credentials
   - Returns `access_token` with ~24 hour expiry
   - Token is automatically refreshed when expired

3. **Authentication Headers** (for API calls)
   - **Authorization**: `Bearer {access_token}`
   - Automatically included in all GetBucks Bank API requests
   - Token management is handled internally by the app

**Note**: The bank will need to provide the OAuth credentials (username, password, systemId) which will be used to obtain access tokens for API authentication.

## Account Number Requirements

The customer/client account number **must be appended to the URL** when opening the apps. This is required for payment processing.

- **Parameter name**: `accountNumber`
- **Format**: `?token=XXX&accountNumber=00001203`
- **Required**: Yes - must be included in the URL when launching the apps

## How the Airtime App Works

### User Flow:

1. **Phone Number Input**
   - User enters phone number (currently supports Zimbabwe +263)
   - App automatically detects carrier (Econet, NetOne, Telecel)

2. **Bundle Selection**
   - User selects from available airtime/data bundles
   - Supports predefined bundles and custom amounts
   - Bundles are fetched from AppleTree API based on carrier

3. **Payment Processing**
   - User reviews order summary
   - Payment is initiated via GetBucks Bank Account Transfer API
   - Transfer is created from customer account to merchant account
   - Transaction reference is generated automatically (format: `AIR-{timestamp}-{random}`)

4. **Voucher Issuance**
   - After successful payment, app posts to AppleTree API
   - Vouchers/airtime are issued automatically
   - Delivery status is displayed to the user

5. **Confirmation**
   - Transaction details are displayed
   - Voucher codes are shown (if applicable)
   - User can copy transaction ID and reference numbers

### Payment Integration Details:

- **Payment Method**: GetBucks Bank Account Transfer
- **Debit Account**: Customer's GetBucks account (provided via parameters/bridge)
- **Credit Account**: Merchant/Airtime account (configured in app)
- **Transaction Fee**: Free (no additional charges)
- **Currency**: USD (default, configurable)

## How the Bill Payments App Works

The Bill Payments app follows a similar flow but is designed for utility bill payments and other bill payment services. The integration requirements are the same as the Airtime app.

## Communication Methods

The apps support three communication modes:

1. **Native Mode** (Mobile App)
   - Uses `window.payment` bridge interface
   - Direct communication with native app
   - Full access to device features

2. **Iframe Mode** (Internet Banking)
   - Uses `postMessage` API for cross-origin communication
   - Secure communication between iframe and parent window
   - Supports dynamic height adjustment

3. **Standalone Mode** (Development/Testing)
   - For local development and testing
   - Not for production use

## Message Types (Iframe Mode)

The apps communicate with the parent window using the following message types:

### From App → Parent:
- `REQUEST_TOKEN` - Request authentication token
- `REQUEST_PAYMENT` - Request payment initiation
- `PAYMENT_COMPLETE` - Payment completed notification
- `CLOSE_IFRAME` - Request to close iframe

### From Parent → App:
- `TOKEN_RESPONSE` - Send authentication token
- `PAYMENT_RESULT` - Payment processing result
- `USER_UPDATE` - User data update

## Security Considerations

- All communication uses HTTPS
- Tokens are validated on both sides
- Origin validation for postMessage communication
- CSP headers configured for secure iframe embedding
- No sensitive data stored in localStorage

## Testing

For testing purposes, you can access the apps directly:
- Airtime: https://h5-getbucks-airtime.vercel.app
- Bill Payments: https://h5-getbucks-bill-payments.vercel.app

The apps will work in standalone mode for testing, but full functionality requires proper authentication and account number configuration.

## Support & Documentation

If you need additional technical documentation or have questions about the integration, please let me know. I can provide:
- API endpoint documentation
- Detailed integration examples
- Testing credentials (if needed)
- Troubleshooting guides

## Next Steps

To proceed with integration, please provide:
1. **OAuth Credentials** - GetBucks Bank will provide:
   - API Username
   - API Password
   - System ID
   - Grant Type (typically "password")
   These will be used for OAuth token acquisition

2. **Account Information** - Confirm how the following will be provided:
   - Customer account number (debit account) - must be appended to URL
   - Client number - can be appended to URL or provided via bridge service
   - Merchant account number (credit account) - will be configured in app

3. **Testing environment access** - If needed for integration testing

4. Any specific requirements for the payment flow

I'm available to assist with the integration process and answer any questions you may have.

Best regards,
[Your Name]

---

**Quick Reference:**

- **Airtime App**: https://h5-getbucks-airtime.vercel.app
- **Bill Payments App**: https://h5-getbucks-bill-payments.vercel.app
- **Required URL Parameters**: `accountNumber` (customer debit account - appended to URL)
- **Recommended URL Parameters**: `clientNumber` (client identifier)
- **Optional Parameters**: `mode`, `returnUrl`
- **Authentication**: OAuth credentials (username, password, systemId) provided by GetBucks Bank
- **Payment**: GetBucks Bank Account Transfer API (POST /api/v2/account-transfers)
- **Voucher Issuance**: AppleTree API (automatic after payment)

