# Iframe Bridge Implementation

## Overview
This app supports three modes of operation:
1. **Native SuperApp** - Direct integration with mobile app via `window.payment`
2. **Iframe** - Embedded in Tapseed Hub via postMessage
3. **Standalone** - Development/testing mode with mock services

## Files

### `modeDetection.js`
- Detects current mode (iframe/native/standalone)
- Parses URL parameters
- Provides utilities for mode checking

### `iframeBridge.js`
- Handles postMessage communication with parent window
- Manages message handlers and request/response patterns
- Provides methods for common operations (token, payment, etc.)

### `paymentBridge.js` (in services/)
- Unified payment interface that works across all modes
- Automatically selects the correct bridge based on mode

## Usage

### Detecting Mode
```javascript
import { getMode } from './utils/modeDetection';

const mode = getMode(); // 'iframe' | 'native' | 'standalone'
```

### Using Payment Bridge
```javascript
import { processPayment } from './services/paymentBridge';

const result = await processPayment({
  amount: 100,
  currency: 'USD',
  // ... other payment data
});
```

### Using Iframe Bridge Directly
```javascript
import { iframeBridge } from './utils/iframeBridge';

// Request token
const tokenResponse = await iframeBridge.requestToken();

// Send custom message
iframeBridge.sendToParent('CUSTOM_MESSAGE', { data: 'value' });

// Listen for messages
iframeBridge.on('USER_UPDATE', (data) => {
  console.log('User updated:', data);
});
```

## Message Types

### From H5 App → Parent
- `IFRAME_READY` - Notifies parent that iframe is loaded
- `REQUEST_TOKEN` - Requests authentication token
- `REQUEST_PAYMENT` - Requests payment processing
- `PAYMENT_COMPLETE` - Notifies payment completion
- `CLOSE_IFRAME` - Requests to close iframe
- `NAVIGATION_REQUEST` - Requests navigation in parent

### From Parent → H5 App
- `TOKEN_RESPONSE` - Sends authentication token
- `PAYMENT_RESULT` - Sends payment processing result
- `USER_UPDATE` - Sends user data update
- `CONFIG_UPDATE` - Sends configuration update

