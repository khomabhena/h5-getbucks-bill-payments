/**
 * BankWare token via VAS server proxy (credentials on server only).
 */

import { bankwareUrl, usesVasBankWareProxy } from '../../config/api.js';

class GetBucksAuth {
  constructor() {
    this.baseUrl = bankwareUrl;
    this.tokenData = null;
    this.tokenExpiry = null;
    this.useServerProxy = usesVasBankWareProxy();
  }

  async getAccessToken() {
    if (this.tokenData && this.isTokenValid()) {
      return this.tokenData.access_token;
    }
    await this.authenticate();
    return this.tokenData.access_token;
  }

  isTokenValid() {
    if (!this.tokenData || !this.tokenExpiry) return false;
    const bufferTime = 5 * 60 * 1000;
    return Date.now() < this.tokenExpiry - bufferTime;
  }

  async authenticate() {
    try {
      const url = `${this.baseUrl}/token`;
      if (!this.useServerProxy) {
        throw new Error(
          'Direct BankWare auth is disabled. Set VITE_API_BASE_URL to your VAS server.'
        );
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
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
      if (!tokenData.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      this.tokenData = tokenData;
      this.tokenExpiry = Date.now() + (tokenData.expires_in || 86399) * 1000;
      return tokenData;
    } catch (error) {
      console.error('❌ BankWare authentication failed:', error);
      throw error;
    }
  }

  clearToken() {
    this.tokenData = null;
    this.tokenExpiry = null;
  }

  updateCredentials() {
    this.clearToken();
  }
}

export const getBucksAuth = new GetBucksAuth();
export default getBucksAuth;
