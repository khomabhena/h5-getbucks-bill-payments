/**
 * GetBucks Bank API Authentication Service
 * Handles OAuth token acquisition and refresh
 */

class GetBucksAuth {
  constructor() {
    this.baseUrl = import.meta.env.VITE_GETBUCKS_API_URL || 'http://s-bwopenapi.getbucksbank.com';
    this.tokenData = null;
    this.tokenExpiry = null;
    
    // Credentials from environment variables
    // TODO: Confirm where these come from (env vars, bridge service, etc.)
    this.credentials = {
      grant_type: import.meta.env.VITE_GETBUCKS_GRANT_TYPE || 'password',
      username: import.meta.env.VITE_GETBUCKS_USERNAME || '',
      password: import.meta.env.VITE_GETBUCKS_PASSWORD || '',
      systemId: import.meta.env.VITE_GETBUCKS_SYSTEM_ID || ''
    };
  }

  /**
   * Get access token (with automatic refresh if needed)
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Check if we have a valid token
    if (this.tokenData && this.isTokenValid()) {
      return this.tokenData.access_token;
    }

    // Token expired or doesn't exist - get new one
    await this.authenticate();
    return this.tokenData.access_token;
  }

  /**
   * Check if current token is still valid
   * @returns {boolean}
   */
  isTokenValid() {
    if (!this.tokenData || !this.tokenExpiry) {
      return false;
    }

    // Check if token expires in less than 5 minutes (refresh early)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() < (this.tokenExpiry - bufferTime);
  }

  /**
   * Authenticate and get access token
   * @returns {Promise<Object>} Token data
   */
  async authenticate() {
    try {
      // Build form data
      const formData = new URLSearchParams();
      formData.append('grant_type', this.credentials.grant_type);
      formData.append('username', this.credentials.username);
      formData.append('password', this.credentials.password);
      formData.append('systemId', this.credentials.systemId);

      const url = `${this.baseUrl}/token`;
      
      // Log request details
      console.log('🔐 Auth Request:', {
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: Object.fromEntries(formData.entries())
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData.toString()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.error_description || 
          errorData.error || 
          `Authentication failed: ${response.status} ${response.statusText}`
        );
        error.rawResponse = errorData;
        error.statusCode = response.status;
        throw error;
      }

      const tokenData = await response.json();

      // Validate response structure
      if (!tokenData.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      // Store token data
      this.tokenData = tokenData;
      
      // Calculate expiry time (expires_in is in seconds)
      const expiresInMs = (tokenData.expires_in || 86399) * 1000;
      this.tokenExpiry = Date.now() + expiresInMs;

      console.log('✅ GetBucks authentication successful');
      return tokenData;
    } catch (error) {
      console.error('❌ GetBucks authentication failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh_token
   * TODO: Implement if refresh endpoint exists
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    if (!this.tokenData?.refresh_token) {
      // No refresh token available, need to re-authenticate
      return this.authenticate();
    }

    // TODO: Implement refresh token endpoint when available
    // For now, fall back to full authentication
    console.warn('⚠️ Refresh token endpoint not implemented, re-authenticating');
    return this.authenticate();
  }

  /**
   * Clear stored token (force re-authentication on next request)
   */
  clearToken() {
    this.tokenData = null;
    this.tokenExpiry = null;
  }

  /**
   * Update credentials (useful if provided dynamically)
   * @param {Object} credentials - New credentials
   */
  updateCredentials(credentials) {
    this.credentials = { ...this.credentials, ...credentials };
    // Clear existing token to force re-authentication
    this.clearToken();
  }
}

// Export singleton instance
export const getBucksAuth = new GetBucksAuth();
export default getBucksAuth;

