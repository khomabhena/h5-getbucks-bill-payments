# Getbucks Bill Payments - Documentation

## Overview

Getbucks Bill Payments is a mobile-first web application that enables users to pay bills for various services (electricity, water, gas, TV, etc.) through Getbucks Bank. The app integrates with the AppleTree Gateway API for service provider and product information, while processing payments through Getbucks Bank's payment system.

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Payment Flow](#payment-flow)
4. [API Integrations](#api-integrations)
5. [Component Structure](#component-structure)
6. [Services](#services)
7. [Design System](#design-system)
8. [Setup Instructions](#setup-instructions)
9. [Future Integrations](#future-integrations)

---

## Architecture

The application follows a component-based architecture with the following structure:

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (routes)
├── services/           # API services and business logic
├── data/              # Constants, colors, design system
├── utils/             # Utility functions
└── App.jsx            # Main app component with routing
```

### Key Design Principles

- **Component Reusability**: Shared components for consistent UI
- **Separation of Concerns**: Services handle API calls, components handle UI
- **Mobile-First Design**: Optimized for mobile devices
- **Progressive Enhancement**: Works without JavaScript for basic functionality

---

## Tech Stack

### Core Technologies

- **React 18+**: UI framework
- **React Router v6**: Client-side routing
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework

### Additional Libraries

- **Google Material Icons**: Icon library (via CDN)
- **Fetch API**: HTTP requests

### Development Tools

- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## Payment Flow

The application follows a 6-step payment flow:

### 1. Country & Service Selection (`/`)
- User selects country from list (with search functionality)
- User selects bill payment service (Electricity, Water, Gas, TV, etc.)
- Mobile services (Airtime, Data, Bundles) are filtered out
- Navigation: `/` → `/providers`

### 2. Provider Selection (`/providers`)
- Displays service providers for selected country and service
- Shows provider logos with fallback
- Fetches providers from AppleTree Gateway API
- Navigation: `/providers` → `/products`

### 3. Product Selection (`/products`)
- Displays available products for selected provider
- Shows product details (name, price, currency, description)
- Auto-selects if only one product available
- Shows required account identifier type
- Navigation: `/products` → `/account`

### 4. Account Input (`/account`)
- User enters account number/identifier
- Real-time validation (1 second debounce)
- Displays validation results (account name, bill amount, etc.)
- Amount input (fixed or variable)
- Navigation: `/account` → `/payment`

### 5. Payment (`/payment`)
- Displays order summary
- Processes payment through Getbucks Bank (placeholder)
- Posts payment to AppleTree Gateway for fulfillment
- Shows payment status updates
- Navigation: `/payment` → `/confirmation`

### 6. Confirmation (`/confirmation`)
- Displays payment success/failure status
- Shows transaction details
- Displays fulfillment status
- Shows vouchers/tokens (if applicable)
- Displays receipts (HTML/SMS)
- "Done" button returns to home

---

## API Integrations

### AppleTree Gateway API

The app integrates with AppleTree Gateway for:

#### Endpoints Used

1. **GET `/vas/V2/Countries`**
   - Fetches list of available countries
   - Used in: `CountryServiceSelection`

2. **GET `/vas/V2/Services`**
   - Fetches list of bill payment services
   - Filtered to exclude mobile services (Airtime, Data, Bundles)
   - Used in: `CountryServiceSelection`

3. **GET `/vas/V2/ServiceProviders?countryCode={code}&service={id}`**
   - Fetches service providers for a country and service
   - Used in: `ProviderSelection`

4. **GET `/vas/V2/Products?countryCode={code}&service={id}&serviceProviderId={id}`**
   - Fetches products for a service provider
   - Used in: `ProductSelection`

5. **POST `/vas/V2/ValidatePayment`**
   - Validates account details before payment
   - Returns account information and bill amount
   - Used in: `AccountInput`

6. **POST `/vas/V2/PostPayment`**
   - Submits payment for fulfillment
   - Returns vouchers, receipts, and transaction details
   - Used in: `Payment`

#### Authentication

- **Merchant ID**: Sent in `MerchantId` header
- **Base URL**: Configurable via environment variable `VITE_APPLETREE_BASE_URL`
- Default: `https://sandbox-dev.appletreepayments.com`

#### Service Layer

All API calls are abstracted through:
- `AppleTreeGateway.js`: Low-level API client
- `appleTreeService.js`: High-level service methods
- `billPaymentsApi.js`: Bill payment-specific helpers

### Getbucks Bank Payment API (Placeholder)

Currently implemented as a placeholder service:

- **File**: `src/services/bankPaymentService.js`
- **Methods**:
  - `processGetbucksPayment()`: Processes payment (TODO: Replace with actual API)
  - `getPaymentStatus()`: Checks payment status (TODO: Replace with actual API)

**TODO**: Replace placeholder with actual Getbucks Bank payment API integration.

---

## Component Structure

### Reusable Components (`src/components/`)

#### Core Components

- **`Button.jsx`**: Primary button component with loading states
- **`Card.jsx`**: Container component with consistent styling
- **`Header.jsx`**: Page header with back button support
- **`InputField.jsx`**: Form input with error handling
- **`Icon.jsx`**: Material Icons wrapper
- **`PageWrapper.jsx`**: Page layout wrapper
- **`SelectionButton.jsx`**: Selectable button for choices
- **`Flag.jsx`**: Country flag display component
- **`ProductCard.jsx`**: Product display card

#### Component Exports

All components are exported through `src/components/index.js` for easy importing.

### Page Components (`src/pages/`)

1. **`CountryServiceSelection.jsx`**
   - Country selection with search
   - Service selection (filtered)
   - Popular countries section
   - "Show All Countries" toggle

2. **`ProviderSelection.jsx`**
   - Provider grid display
   - Provider logo handling
   - Loading and error states

3. **`ProductSelection.jsx`**
   - Product list display
   - Product details (price, currency, description)
   - Auto-selection for single product

4. **`AccountInput.jsx`**
   - Account number input
   - Real-time validation
   - Amount input (fixed/variable)
   - Validation results display

5. **`Payment.jsx`**
   - Order summary
   - Payment processing
   - Status updates
   - Error handling

6. **`Confirmation.jsx`**
   - Transaction details
   - Fulfillment status
   - Voucher display
   - Receipt display

---

## Services

### Service Files

#### `src/services/appletree/AppleTreeGateway.js`
Low-level API client for AppleTree Gateway:
- Handles HTTP requests
- Manages authentication headers
- Error handling and response parsing
- Request ID generation

#### `src/services/appleTreeService.js`
High-level service methods:
- `getCountries()`: Fetch countries
- `getServices()`: Fetch services (filtered)
- `getServiceProviders()`: Fetch providers
- `getProducts()`: Fetch products
- `validatePayment()`: Validate account details

#### `src/services/billPaymentsApi.js`
Bill payment-specific API helpers:
- `validateBillPayment()`: Validate payment payload
- `postBillPayment()`: Submit payment for fulfillment

#### `src/services/bankPaymentService.js`
Getbucks Bank payment service (placeholder):
- `processGetbucksPayment()`: Process payment
- `getPaymentStatus()`: Check payment status

**TODO**: Replace with actual Getbucks Bank API integration.

---

## Design System

### Colors (`src/data/colors.js`)

Getbucks brand colors:

```javascript
{
  app: {
    primary: '#faa819',        // Orange
    primaryLight: '#fdd085',   // Light orange
    primaryDark: '#d6890a',    // Dark orange
    primaryDarker: '#b8730a',  // Darker orange
    secondary: '#2c3e50'       // Dark blue-gray
  },
  text: {
    primary: '#2c3e50',
    secondary: '#5a6c7d',
    tertiary: '#8b9aab',
    inverse: '#ffffff'
  },
  background: {
    primary: '#ffffff',
    secondary: '#f7f2ec',      // Beige
    tertiary: '#faf8f5'
  },
  // ... state colors, borders, etc.
}
```

### Design Tokens (`src/data/designSystem.js`)

- Spacing scale (xs, sm, md, lg, xl, 2xl)
- Card styles
- Button styles
- Typography scale
- Input styles
- Layout utilities

### Typography

- Headings: Bold, various sizes
- Body: Regular weight, readable sizes
- Captions: Smaller, muted colors

### Components

All components follow Getbucks design guidelines:
- Rounded corners (xl, 2xl)
- Consistent padding and margins
- Orange accent color for primary actions
- Beige background for secondary elements

---

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- Git

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd 18-h5-getbucks-bill-payments
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables** (optional)
   Create a `.env` file in the root directory:
   ```env
   VITE_APPLETREE_MERCHANT_ID=your-merchant-id
   VITE_APPLETREE_BASE_URL=https://sandbox-dev.appletreepayments.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

### Project Structure

```
18-h5-getbucks-bill-payments/
├── public/                 # Static assets
│   └── favico.png         # Favicon
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── data/            # Constants, colors, design system
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

---

## Future Integrations

### Getbucks Bank Payment API

The current payment service (`bankPaymentService.js`) is a placeholder. To integrate the actual Getbucks Bank payment API:

1. **Update `src/services/bankPaymentService.js`**:
   - Replace `processGetbucksPayment()` with actual API call
   - Replace `getPaymentStatus()` with actual status check
   - Add proper error handling
   - Add authentication/authorization

2. **Environment Variables**:
   ```env
   VITE_GETBUCKS_API_URL=https://api.getbucks.com
   VITE_GETBUCKS_API_KEY=your-api-key
   ```

3. **User Authentication**:
   - Integrate with Getbucks user authentication
   - Get user details (CustomerId, Fullname, MobileNumber, EmailAddress)
   - Update `getCustomerDetails()` in `AccountInput.jsx` and `Payment.jsx`

4. **Payment Flow**:
   - Implement actual payment processing
   - Handle payment callbacks
   - Update transaction status handling

### Additional Features

- **Transaction History**: Store and display past transactions
- **Favorites**: Save frequently used providers/accounts
- **Notifications**: Payment status notifications
- **Receipts**: Download/email receipts
- **Multi-language Support**: Internationalization
- **Offline Support**: Service worker for offline functionality

---

## API Response Examples

### ValidatePayment Response

```json
{
  "Status": "VALIDATED",
  "ResultMessage": "Account validated successfully",
  "DisplayData": [
    {
      "Label": "Account Name",
      "Value": "John Doe"
    },
    {
      "Label": "Account Number",
      "Value": "123456789"
    }
  ],
  "BillAmount": 150.00
}
```

### PostPayment Response

```json
{
  "Status": "SUCCESSFUL",
  "ResultMessage": "Payment processed successfully",
  "ReferenceNumber": "REF123456",
  "Vouchers": [
    {
      "VoucherCode": "1234-5678-9012-3456",
      "SerialNumber": "SN123456",
      "ExpiryDate": "2024-12-31T23:59:59Z",
      "ValidDays": 30
    }
  ],
  "ReceiptHTML": ["<html>...</html>"],
  "ReceiptSmses": ["Your payment of USD 150 has been processed..."],
  "DisplayData": [...]
}
```

---

## Error Handling

### Network Errors
- Automatic retry for transient failures
- User-friendly error messages
- Fallback UI states

### Validation Errors
- Real-time validation feedback
- Clear error messages
- Non-blocking validation (allows continuation with warning)

### Payment Errors
- Detailed error messages
- Status tracking
- Retry mechanisms

---

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features Used**:
  - ES6+ JavaScript
  - CSS Grid and Flexbox
  - Fetch API
  - Clipboard API (with fallback)

---

## Performance Considerations

- **Code Splitting**: Lazy loading of page components
- **Image Optimization**: Provider logos with error handling
- **API Caching**: Consider caching countries/services
- **Debouncing**: Validation requests debounced to reduce API calls
- **Bundle Size**: Optimized with Vite's build process

---

## Security Considerations

- **API Keys**: Store in environment variables (never commit)
- **HTTPS**: All API calls over HTTPS
- **Input Validation**: Client and server-side validation
- **XSS Protection**: React's built-in XSS protection
- **CSP**: Consider Content Security Policy headers

---

## Testing

### Manual Testing Checklist

- [ ] Country selection and search
- [ ] Service selection
- [ ] Provider selection
- [ ] Product selection
- [ ] Account validation
- [ ] Payment processing
- [ ] Confirmation display
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Copy to clipboard functionality

### Future Testing

- Unit tests for components
- Integration tests for services
- E2E tests for payment flow
- Performance testing

---

## Troubleshooting

### Common Issues

1. **API Errors**: Check environment variables and network connectivity
2. **Validation Not Working**: Check account number format
3. **Payment Fails**: Verify Getbucks payment service integration
4. **Styling Issues**: Clear browser cache, check Tailwind config

### Debug Mode

Enable console logging by checking browser console for:
- API request/response logs
- Validation status
- Payment flow status

---

## Contributing

1. Follow existing code style
2. Use Getbucks design system
3. Add error handling
4. Test on mobile devices
5. Update documentation

---

## License

[Add license information here]

---

## Contact

For questions or issues, contact the development team.

---

**Last Updated**: [Current Date]
**Version**: 1.0.0

