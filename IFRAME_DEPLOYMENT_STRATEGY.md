# Iframe Deployment Strategy for Tapseed Hub

## Overview
This document outlines the strategy for hosting H5 apps on Vercel and embedding them in Tapseed Hub via iframe.

## Architecture

```
Tapseed Hub (Parent Window)
  └── iframe
      └── H5 App (Vercel Deployment)
          ├── React App
          ├── SuperApp Bridge (native)
          └── Iframe Bridge (postMessage)
```

## 1. Vercel Deployment

### Configuration
- **Platform**: Vercel
- **Framework**: Vite + React
- **Routing**: Client-side routing with SPA rewrites
- **Domain**: Custom domain or `*.vercel.app`

### Environment Variables
Set in Vercel dashboard:
- `VITE_API_URL` - Backend API URL
- `VITE_APP_ENV` - Environment (development/production)
- Other app-specific variables

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

## 2. Security Headers (vercel.json)

### Content Security Policy (CSP)
- **frame-ancestors**: Allows embedding from Tapseed Hub domains
- **frame-src**: Controls what can be embedded in the app itself

### Headers Configured
- ✅ `Content-Security-Policy` - Allows iframe embedding
- ✅ `X-Frame-Options` - SAMEORIGIN (legacy support)
- ✅ `X-Content-Type-Options` - Prevents MIME sniffing
- ✅ `Referrer-Policy` - Controls referrer information

## 3. Iframe Implementation in Tapseed Hub

### HTML Example
```html
<iframe
  id="h5-airtime-iframe"
  src="https://h5-airtime.vercel.app/?token={{USER_TOKEN}}&mode=iframe"
  width="100%"
  height="600px"
  frameborder="0"
  allow="payment"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
  style="border: none; border-radius: 8px;"
></iframe>
```

### JavaScript Communication
```javascript
// Listen for messages from H5 app
window.addEventListener('message', (event) => {
  // Validate origin
  if (event.origin !== 'https://h5-airtime.vercel.app') return;

  const { type, source, data } = event.data;

  if (source === 'h5-airtime') {
    switch (type) {
      case 'REQUEST_TOKEN':
        // Send token to iframe
        event.source.postMessage({
          type: 'TOKEN_RESPONSE',
          token: getUserToken()
        }, event.origin);
        break;

      case 'CLOSE_IFRAME':
        // Close or hide iframe
        document.getElementById('h5-airtime-iframe').style.display = 'none';
        break;

      case 'PAYMENT_COMPLETE':
        // Handle payment completion
        handlePaymentComplete(data);
        break;

      case 'REQUEST_PAYMENT':
        // Initiate payment flow in Hub
        initiatePayment(data);
        break;
    }
  }
});

// Send message to iframe
function sendToIframe(type, data) {
  const iframe = document.getElementById('h5-airtime-iframe');
  iframe.contentWindow.postMessage({
    type,
    source: 'tapseed-hub',
    data
  }, 'https://h5-airtime.vercel.app');
}
```

## 4. Communication Strategy

### Three Modes of Operation

1. **Native SuperApp (Mobile)**
   - Uses `window.payment` bridge
   - Direct native integration
   - Full access to device features

2. **Iframe (Tapseed Hub)**
   - Uses `window.postMessage`
   - Cross-origin communication
   - Limited sandbox permissions

3. **Standalone (Browser)**
   - Uses mock bridge for development
   - Local testing only
   - Not for production

### Message Types

#### From H5 App → Tapseed Hub
- `REQUEST_TOKEN` - Request authentication token
- `CLOSE_IFRAME` - Request to close iframe
- `PAYMENT_COMPLETE` - Payment completed notification
- `REQUEST_PAYMENT` - Request payment initiation
- `NAVIGATION_REQUEST` - Request navigation in parent

#### From Tapseed Hub → H5 App
- `TOKEN_RESPONSE` - Send authentication token
- `PAYMENT_RESULT` - Payment processing result
- `USER_UPDATE` - User data update
- `CONFIG_UPDATE` - Configuration update

## 5. URL Structure

### Parameters
- `token` - User authentication token (optional, can be passed via postMessage)
- `mode` - `iframe` | `native` | `standalone`
- `returnUrl` - URL to return to after completion

### Example URLs
```
Production:
https://h5-airtime.vercel.app/?token=xxx&mode=iframe

Staging:
https://h5-airtime-staging.vercel.app/?token=xxx&mode=iframe

Development:
http://localhost:5175/?token=xxx&mode=iframe
```

## 6. Authentication Flow

### Option 1: URL Parameter
```
https://h5-airtime.vercel.app/?token=USER_TOKEN
```
- Simple and straightforward
- Token visible in URL (use HTTPS only)
- Good for initial load

### Option 2: PostMessage
```javascript
// Hub sends token after iframe loads
iframe.contentWindow.postMessage({
  type: 'TOKEN_RESPONSE',
  token: getUserToken()
}, 'https://h5-airtime.vercel.app');
```
- More secure (token not in URL)
- Dynamic token updates
- Better for refresh scenarios

## 7. Payment Integration

### In Iframe Mode
1. User completes bundle selection in H5 app
2. H5 app sends `REQUEST_PAYMENT` to Hub
3. Hub initiates payment flow (native or redirect)
4. Hub sends `PAYMENT_RESULT` back to H5 app
5. H5 app processes result and shows confirmation

### Message Flow
```
H5 App → REQUEST_PAYMENT → Tapseed Hub
H5 App ← PAYMENT_RESULT ← Tapseed Hub
```

## 8. Responsive Design

### Iframe Sizing
```css
/* In Tapseed Hub */
.iframe-container {
  width: 100%;
  max-width: 428px; /* Mobile-first */
  margin: 0 auto;
  height: 600px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .iframe-container {
    height: 700px;
  }
}
```

### H5 App Viewport
- Already configured with `max-w-md` (448px)
- Mobile-first responsive design
- Works well in iframe container

## 9. Deployment Checklist

### Pre-Deployment
- [ ] Update `vercel.json` with correct domains
- [ ] Set environment variables in Vercel
- [ ] Test iframe embedding locally
- [ ] Verify CSP headers allow Tapseed Hub domains
- [ ] Test postMessage communication
- [ ] Remove mock-bridge.js from production build

### Deployment
- [ ] Deploy to Vercel
- [ ] Verify custom domain (if applicable)
- [ ] Test iframe embedding from Tapseed Hub
- [ ] Test authentication flow
- [ ] Test payment flow
- [ ] Monitor error logs

### Post-Deployment
- [ ] Set up monitoring/analytics
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up CI/CD pipeline
- [ ] Document API endpoints

## 10. Troubleshooting

### Iframe Not Loading
- Check CSP `frame-ancestors` header
- Verify parent domain is whitelisted
- Check browser console for errors

### PostMessage Not Working
- Verify origin validation on both sides
- Check iframe sandbox permissions
- Ensure both windows are on HTTPS

### Token Not Received
- Check URL parameter parsing
- Verify postMessage event listener
- Check token expiration

### Payment Flow Issues
- Verify payment messages are properly formatted
- Check payment handler in Tapseed Hub
- Monitor network requests

## 11. Security Considerations

### ✅ Implemented
- CSP headers for frame embedding
- Origin validation for postMessage
- HTTPS enforcement (Vercel default)
- Token handling (avoid storing in localStorage)

### ⚠️ Recommendations
- Use short-lived tokens
- Implement token refresh mechanism
- Add rate limiting
- Monitor for security vulnerabilities
- Regular security audits

## 12. Performance Optimization

### Iframe Loading
- Lazy load iframe
- Preload critical resources
- Use `loading="lazy"` attribute

### Bundle Size
- Code splitting
- Tree shaking
- Minification (Vite default)
- CDN for static assets

### Caching
- Vercel edge caching
- Static asset caching
- API response caching

## Support

For issues or questions, contact the development team.

