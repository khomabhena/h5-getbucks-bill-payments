# Token Architecture & Hosting Strategy

## Handshake Flow (Confirmed)

```
┌─────────────────┐
│  iBank Mobile   │
│      App        │
└────────┬────────┘
         │
         │ 1. POST /api/token/request
         │    { clientId, clientSecret, userId? }
         │
         ▼
┌─────────────────┐
│  Token Endpoint │  ← We provide credentials to iBank
│   (Our Server)  │     They use these to request tokens
└────────┬────────┘
         │
         │ 2. Validate credentials
         │    Generate JWT token
         │    Return: { token, expiresIn, iframeUrl }
         │
         ▼
┌─────────────────┐
│  iBank Mobile   │
│      App        │
└────────┬────────┘
         │
         │ 3. Embed iframe with token
         │    <iframe src="https://app.vercel.app/?token=xxx&mode=iframe">
         │
         ▼
┌─────────────────┐
│  Bill Payments  │
│  App (Vercel)   │
└────────┬────────┘
         │
         │ 4. Validate token on load
         │    Serve app if valid
         │    Return 401 if invalid
         │
         ▼
    ✅ App Loaded
```

## Token Generation & Refresh Strategy

### Option 1: Short-Lived Tokens (Recommended)

**Approach**: Generate tokens with short expiration (15-60 minutes), require new token request when expired.

**Pros**:
- Simple implementation
- No refresh token management
- Better security (shorter window if compromised)
- Stateless (no token storage needed)

**Cons**:
- More API calls if user stays longer
- User experience: iframe might break if token expires mid-session

**Implementation**:
```javascript
// Token lifetime: 1 hour
const TOKEN_EXPIRY = 3600; // seconds

// iBank requests new token when:
// 1. Initial iframe load
// 2. Token expires (detect via 401 response)
// 3. User navigates back to iframe
```

### Option 2: Access Token + Refresh Token

**Approach**: Long-lived refresh token, short-lived access tokens.

**Pros**:
- Better UX (seamless refresh)
- Fewer token generation calls
- Can revoke refresh tokens

**Cons**:
- More complex
- Need to store refresh tokens securely
- Requires token storage/management

**Implementation**:
```javascript
// Access token: 15 minutes
// Refresh token: 7 days

// Flow:
// 1. iBank gets accessToken + refreshToken
// 2. Use accessToken in iframe URL
// 3. When accessToken expires, use refreshToken to get new accessToken
// 4. Refresh endpoint: POST /api/token/refresh
```

### Option 3: Sliding Window Tokens

**Approach**: Token auto-refreshes if used within expiration window.

**Pros**:
- Seamless experience
- Tokens stay valid as long as user is active

**Cons**:
- More complex validation logic
- Need to track token usage

## Recommended Approach: Short-Lived Tokens

For simplicity and security, we recommend **Option 1** with the following:

1. **Token Lifetime**: 1 hour (3600 seconds)
2. **Refresh Strategy**: iBank requests new token when:
   - Initial iframe load
   - Token expires (detect 401, request new token)
   - User returns to iframe after inactivity

3. **Error Handling**: 
   - If token expires mid-session, iframe shows error
   - iBank can detect and request new token
   - User can retry

## Hosting Options

### Option A: Vercel Serverless Functions (Recommended)

**Location**: Same Vercel deployment as the app

**Structure**:
```
project/
├── api/
│   ├── token/
│   │   ├── request.js      # POST /api/token/request
│   │   └── refresh.js      # POST /api/token/refresh (optional)
│   └── validate-token.js   # GET /api/validate-token
├── src/
└── vercel.json
```

**Pros**:
- ✅ Same deployment as app (simpler)
- ✅ No separate infrastructure
- ✅ Automatic scaling
- ✅ Built-in HTTPS
- ✅ Free tier available
- ✅ Easy environment variable management

**Cons**:
- ⚠️ Cold start latency (first request)
- ⚠️ Function timeout limits (10s on free, 60s on pro)
- ⚠️ Vercel-specific (vendor lock-in)

**Cost**: 
- Free tier: 100GB-hours/month
- Pro: $20/month (unlimited)

**Implementation**:
```javascript
// api/token/request.js
export default async function handler(req, res) {
  // Token generation logic
}
```

### Option B: Separate Backend Service

**Location**: Separate Node.js/Express service

**Options**:
1. **Vercel (separate project)**: Another Vercel deployment
2. **AWS Lambda**: Serverless on AWS
3. **Heroku**: Traditional hosting
4. **Your own server**: Full control

**Pros**:
- ✅ Separation of concerns
- ✅ Independent scaling
- ✅ Can use existing backend infrastructure
- ✅ More control over resources

**Cons**:
- ❌ Additional infrastructure to manage
- ❌ Separate deployment pipeline
- ❌ Additional costs
- ❌ More complex setup

**Cost**: Varies by provider ($0-50+/month)

### Option C: Existing Backend API

**Location**: Your existing backend infrastructure

**Pros**:
- ✅ Reuse existing infrastructure
- ✅ Centralized authentication
- ✅ No new services to manage

**Cons**:
- ❌ Depends on existing backend availability
- ❌ May need modifications to existing API

## Recommended: Vercel Serverless Functions

**Why**:
1. **Simplicity**: Same deployment, same repo
2. **Cost**: Free tier sufficient for most use cases
3. **Performance**: Fast, global CDN
4. **Security**: Built-in HTTPS, environment variables
5. **Scalability**: Auto-scales with traffic

## Implementation Plan

### Phase 1: Token Endpoint (Vercel Serverless)

1. **Create API directory structure**:
   ```
   api/
   ├── token/
   │   └── request.js
   └── validate-token.js
   ```

2. **Install dependencies**:
   ```bash
   npm install jsonwebtoken
   ```

3. **Set environment variables in Vercel**:
   - `IBANK_CLIENT_ID`
   - `IBANK_CLIENT_SECRET`
   - `JWT_SECRET` (min 32 chars)
   - `APP_URL`

4. **Implement token generation**:
   - Validate iBank credentials
   - Generate JWT with 1-hour expiration
   - Return token + iframe URL

5. **Implement token validation**:
   - Validate JWT on app load
   - Check expiration
   - Return 401 if invalid

### Phase 2: App Integration

1. **Update App.jsx**:
   - Validate token on load (iframe mode only)
   - Show error if invalid
   - Allow access if not in iframe mode

2. **Error handling**:
   - Token expired: Show message, allow retry
   - Invalid token: Show error
   - No token: Request via postMessage (fallback)

### Phase 3: Testing & Documentation

1. **API Documentation**:
   - Endpoint specs
   - Request/response examples
   - Error codes
   - Rate limiting info

2. **Integration Testing**:
   - Test token generation
   - Test token validation
   - Test iframe embedding
   - Test token expiration

## Token Refresh Flow

### Simple Approach (Recommended)

```
User opens iframe
    ↓
iBank requests token → GET /api/token/request
    ↓
Token valid for 1 hour
    ↓
User uses app
    ↓
Token expires after 1 hour
    ↓
App detects 401 → Shows error
    ↓
iBank requests new token → GET /api/token/request
    ↓
New iframe with new token
```

### Enhanced Approach (Optional)

```
User opens iframe
    ↓
iBank requests token → GET /api/token/request
    ↓
Token valid for 1 hour
    ↓
App monitors token expiration (30 min remaining)
    ↓
App requests refresh via postMessage
    ↓
iBank gets new token → GET /api/token/request
    ↓
iBank sends new token via postMessage
    ↓
App updates URL with new token (no reload needed)
```

## Security Considerations

1. **HTTPS Only**: All endpoints must use HTTPS
2. **Rate Limiting**: Limit token requests per client
3. **Token Storage**: Never store tokens in localStorage
4. **Secret Management**: Use Vercel environment variables
5. **Token Validation**: Always validate server-side
6. **CORS**: Configure CORS for iBank domain only
7. **Audit Logging**: Log token generation requests

## Next Steps

1. ✅ **Decide on hosting**: Vercel serverless (recommended)
2. ✅ **Decide on token strategy**: Short-lived tokens (1 hour)
3. ⏳ **Implement token endpoint**: `/api/token/request`
4. ⏳ **Implement validation**: `/api/validate-token`
5. ⏳ **Update app**: Token validation on load
6. ⏳ **Test**: Full integration testing
7. ⏳ **Document**: API docs for iBank team

## Questions to Answer

1. **Token Lifetime**: 1 hour acceptable? (Can adjust)
2. **Refresh Strategy**: Simple (new request) or enhanced (auto-refresh)?
3. **Hosting**: Vercel serverless or separate backend?
4. **Rate Limiting**: How many requests per minute/hour?
5. **Monitoring**: Do we need token usage analytics?

