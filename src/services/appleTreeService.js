/**
 * AppleTree Service Layer
 * Centralized service for managing VAS products (bill payments)
 */

import { AppleTreeGateway, Services } from './appletree';

class AppleTreeService {
  constructor() {
    // Initialize AppleTree gateway with configuration
    this.gateway = new AppleTreeGateway({
      // Can be overridden via environment variables
      // merchantId: import.meta.env.VITE_APPLETREE_MERCHANT_ID,
      // baseUrl: import.meta.env.VITE_APPLETREE_BASE_URL
    });

    // Cache for products
    this.cache = {
      products: new Map(),
      lastUpdate: null
    };

    // Cache duration (5 minutes)
    this.cacheDuration = 5 * 60 * 1000;
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    if (!this.cache.lastUpdate) return false;
    return Date.now() - this.cache.lastUpdate < this.cacheDuration;
  }

  /**
   * Get services for a specific country
   * @param {string} countryCode - Country code (e.g., 'ZW')
   * @returns {Promise<Object>} Services list
   */
  async getServices(countryCode) {
    try {
      console.log(`Fetching services for country: ${countryCode}`);
      const response = await this.gateway.getServices(countryCode);
      
      console.log('Services API response:', response);
      
      // Handle different response formats
      // API might return { Services: [...] } or just the response object
      const services = response.Services || response || [];
      
      console.log(`Found ${Array.isArray(services) ? services.length : 0} services for ${countryCode}`);
      
      return {
        success: true,
        data: Array.isArray(services) ? services : [],
        source: 'api'
      };
    } catch (error) {
      console.error('Failed to get services:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get service providers for a country and service
   * @param {Object} filters - Provider filters
   * @param {string} filters.countryCode - Country code
   * @param {number} filters.serviceId - Service ID
   * @returns {Promise<Object>} Service providers
   */
  async getServiceProviders(filters) {
    try {
      const response = await this.gateway.getServiceProviders(filters);
      
      // Handle different response formats
      // API might return { ServiceProviders: [...] } or just an array
      const providers = response.ServiceProviders || response || [];
      
      return {
        success: true,
        data: Array.isArray(providers) ? providers : [],
        response: response // Include full response for status checking
      };
    } catch (error) {
      console.error('Failed to get service providers:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get products for a specific country and service
   * @param {Object} filters - Product filters
   * @param {string} filters.countryCode - Country code (e.g., 'ZW')
   * @param {number} filters.serviceId - Service ID
   * @param {number} filters.serviceProviderId - Optional provider ID
   * @param {boolean} useCache - Use cached data if available
   * @returns {Promise<Object>} Products list
   */
  async getProducts(filters, useCache = true) {
    try {
      const cacheKey = `${filters.countryCode}_${filters.serviceId}_${filters.serviceProviderId || 'all'}`;

      // Check cache
      if (useCache && this.cache.products.has(cacheKey) && this.isCacheValid()) {
        return {
          success: true,
          data: this.cache.products.get(cacheKey),
          source: 'cache'
        };
      }

      // Fetch from API
      const products = await this.gateway.getProducts(filters);
      
      // Update cache
      this.cache.products.set(cacheKey, products);
      this.cache.lastUpdate = Date.now();

      return {
        success: true,
        data: products,
        source: 'api'
      };
    } catch (error) {
      console.error('Failed to get products:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Validate payment before processing
   * @param {Object} paymentData - Payment data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validatePayment(paymentData) {
    try {
      const { validateBillPayment } = await import('./billPaymentsApi');
      const result = await validateBillPayment(paymentData);
      
      return {
        success: result.Status === 'VALIDATED',
        data: result,
        message: result.ResultMessage || 'Validation successful'
      };
    } catch (error) {
      console.error('Payment validation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Payment validation failed'
      };
    }
  }
}

// Export singleton instance
export const appleTreeService = new AppleTreeService();
export { Services };
export default appleTreeService;

