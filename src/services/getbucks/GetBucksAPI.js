/**
 * GetBucks Bank API Client
 * Main service for interacting with GetBucks Bank API endpoints
 */

import { getBucksAuth } from './GetBucksAuth.js';

class GetBucksAPI {
  constructor() {
    this.baseUrl = import.meta.env.VITE_GETBUCKS_API_URL || 'http://s-bwopenapi.getbucksbank.com';
    this.ifsProgramId = import.meta.env.VITE_GETBUCKS_IFS_PROGRAM_ID || '';
  }

  /**
   * Safely parse JSON response, handling empty or invalid responses
   * @param {Response} response - Fetch response object
   * @param {*} defaultValue - Default value if response is empty or invalid
   * @returns {Promise<Object>} Parsed JSON or default value
   */
  async parseJsonResponse(response, defaultValue = {}) {
    try {
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        return defaultValue;
      }
      
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.error('Response status:', response.status, response.statusText);
      return defaultValue;
    }
  }

  /**
   * Get authorization header with Bearer token
   * @returns {Promise<string>} Authorization header value
   */
  async getAuthHeader() {
    const token = await getBucksAuth.getAccessToken();
    return `Bearer ${token}`;
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>}
   */
  async makeRequest(endpoint, options = {}) {
    const authHeader = await this.getAuthHeader();
    
    const headers = {
      'Accept': 'application/json',
      'Authorization': authHeader,
      ...options.headers
    };

    // Add IFS-Program-Id if configured
    if (this.ifsProgramId) {
      headers['IFS-Program-Id'] = this.ifsProgramId;
    }

    // Add Content-Type for requests with body
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Log request details
    console.log('🌐 API Request:', {
      method: options.method || 'GET',
      url: url,
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined },
      body: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        console.warn('⚠️ Received 401, clearing token and retrying...');
        getBucksAuth.clearToken();
        
        // Retry once with new token
        const newAuthHeader = await this.getAuthHeader();
        headers['Authorization'] = newAuthHeader;
        
        const retryResponse = await fetch(url, {
          ...options,
          headers
        });
        return retryResponse;
      }

      return response;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  /**
   * Get account transfer by external reference
   * @param {string} externalReference - External reference
   * @returns {Promise<Object>} Account transfer
   */
  async getAccountTransferByExternalReference(externalReference) {
    if (!externalReference) {
      throw new Error('External reference is required');
    }

    const queryParams = new URLSearchParams({ externalReference });
    const response = await this.makeRequest(`/api/v2/account-transfers?${queryParams.toString()}`, {
      method: 'GET'
    });

    if (!response.ok) {
      // Try to parse error response, but handle empty/invalid JSON gracefully
      let errorData = {};
      const responseText = await response.text().catch(() => '');
      
      if (responseText) {
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          // Response is not valid JSON - use empty object
          console.warn('⚠️ Response is not valid JSON:', responseText);
        }
      }
      
      // Handle GetBucks error format: { errors: [{ code, message }] }
      let errorMessage = `Failed to get account transfer: ${response.status} ${response.statusText}`;
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        errorMessage = firstError.message || errorMessage;
        if (firstError.code) {
          errorMessage = `[${firstError.code}] ${errorMessage}`;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      const error = new Error(errorMessage);
      error.rawResponse = errorData;
      error.statusCode = response.status;
      error.errors = errorData.errors || [];
      throw error;
    }

    // Parse successful response, handle empty/invalid JSON
    // Note: If response is empty, return empty object (transfer might not exist yet)
    const result = await this.parseJsonResponse(response, {});
    
    // If result is empty, the transfer might not be found or still processing
    if (!result || Object.keys(result).length === 0) {
      console.warn('⚠️ Empty response from GetBucks API - transfer might not exist yet');
    }
    
    return result;
  }

  /**
   * Create account transfer
   * @param {Object} transferData - Transfer data
   * @param {string} transferData.externalReference - External reference
   * @param {string} transferData.clientNumber - Client number
   * @param {string} transferData.debitAccount - Debit account number
   * @param {string} transferData.debitCurrency - Debit currency code
   * @param {number} transferData.debitAmount - Debit amount
   * @param {string} transferData.creditAccount - Credit account number
   * @param {string} transferData.creditCurrency - Credit currency code
   * @param {number} transferData.creditAmount - Credit amount
   * @param {string} transferData.valueDate - Value date (ISO 8601)
   * @param {string} [transferData.debitNarrative1-5] - Debit narratives
   * @param {string} [transferData.creditNarrative1-5] - Credit narratives
   * @param {number} [transferData.exchangeRate] - Exchange rate
   * @param {number} [transferData.chargesBourneBy] - Charges borne by (0 or 1)
   * @param {string} [transferData.blockReference] - Block reference
   * @param {string} [transferData.sessionID] - Session ID for iBank validation
   * @returns {Promise<Object>} Transfer result
   */
  async createAccountTransfer(transferData) {
    // Validate required fields
    const requiredFields = [
      'externalReference',
      'clientNumber',
      'debitAccount',
      'debitCurrency',
      'debitAmount',
      'creditAccount',
      'creditCurrency',
      'creditAmount'
    ];

    const missingFields = requiredFields.filter(field => !transferData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Build request body
    const body = {
      externalReference: transferData.externalReference,
      clientNumber: transferData.clientNumber,
      debitAccount: transferData.debitAccount,
      debitCurrency: transferData.debitCurrency,
      debitAmount: transferData.debitAmount,
      creditAccount: transferData.creditAccount,
      creditCurrency: transferData.creditCurrency,
      creditAmount: transferData.creditAmount,
      valueDate: transferData.valueDate || new Date().toISOString(),
      exchangeRate: transferData.exchangeRate || 0,
      chargesBourneBy: transferData.chargesBourneBy || 0,
      blockReference: transferData.blockReference || ''
    };

    // Add sessionID if provided (for iBank validation)
    if (transferData.sessionID) {
      body.sessionID = transferData.sessionID;
    }

    // Add narratives (optional)
    // GetBucks requires narratives to be strings (empty string if not provided)
    for (let i = 1; i <= 5; i++) {
      const debitNarrative = transferData[`debitNarrative${i}`];
      const creditNarrative = transferData[`creditNarrative${i}`];
      
      // Only include if explicitly provided (not undefined)
      // If provided but empty, send empty string
      if (debitNarrative !== undefined) {
        body[`debitNarrative${i}`] = debitNarrative || '';
      }
      if (creditNarrative !== undefined) {
        body[`creditNarrative${i}`] = creditNarrative || '';
      }
    }

    const response = await this.makeRequest('/api/v2/account-transfers', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    // Handle different success status codes
    if (response.status === 201 || response.status === 202) {
      // Parse response - successful response contains externalReference and bankwareReference
      const responseData = await this.parseJsonResponse(response, {});
      return {
        success: true,
        status: response.status === 201 ? 'created' : 'accepted',
        statusCode: response.status,
        data: responseData,
        externalReference: responseData.externalReference || transferData.externalReference,
        bankwareReference: responseData.bankwareReference
      };
    }

    if (!response.ok) {
      const errorData = await this.parseJsonResponse(response, {});
      
      // Handle GetBucks error format: { errors: [{ code, message }] }
      let errorMessage = `Failed to create account transfer: ${response.status} ${response.statusText}`;
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        errorMessage = firstError.message || errorMessage;
        // Include error code if available
        if (firstError.code) {
          errorMessage = `[${firstError.code}] ${errorMessage}`;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      const error = new Error(errorMessage);
      error.rawResponse = errorData;
      error.statusCode = response.status;
      error.errors = errorData.errors || [];
      throw error;
    }

    const responseData = await this.parseJsonResponse(response, {});
    return {
      success: true,
      status: 'created',
      statusCode: response.status,
      data: responseData,
      externalReference: responseData.externalReference || transferData.externalReference,
      bankwareReference: responseData.bankwareReference
    };
  }

  /**
   * Cancel account transfer by external reference
   * @param {string} externalReference - External reference of transfer to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelAccountTransfer(externalReference) {
    if (!externalReference) {
      throw new Error('External reference is required');
    }

    const queryParams = new URLSearchParams({ externalReference });
    const response = await this.makeRequest(`/api/v2/account-transfers/cancel?${queryParams.toString()}`, {
      method: 'DELETE'
    });

    // Handle different success status codes
    if (response.status === 200 || response.status === 202) {
      const responseData = await this.parseJsonResponse(response, {});
      return {
        success: true,
        status: response.status === 200 ? 'cancelled' : 'accepted',
        statusCode: response.status,
        data: responseData,
        externalReference
      };
    }

    if (!response.ok) {
      const errorData = await this.parseJsonResponse(response, {});
      
      // Handle GetBucks error format: { errors: [{ code, message }] }
      let errorMessage = `Failed to cancel account transfer: ${response.status} ${response.statusText}`;
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        errorMessage = firstError.message || errorMessage;
        if (firstError.code) {
          errorMessage = `[${firstError.code}] ${errorMessage}`;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      const error = new Error(errorMessage);
      error.rawResponse = errorData;
      error.statusCode = response.status;
      error.errors = errorData.errors || [];
      throw error;
    }

    const responseData = await this.parseJsonResponse(response, {});
    return {
      success: true,
      status: 'cancelled',
      statusCode: response.status,
      data: responseData,
      externalReference
    };
  }
}

// Export singleton instance
export const getBucksAPI = new GetBucksAPI();
export default getBucksAPI;

