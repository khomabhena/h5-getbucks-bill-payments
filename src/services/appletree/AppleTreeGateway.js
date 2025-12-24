/**
 * AppleTree Gateway
 * API client for AppleTree Payments Gateway
 */

export default class AppleTreeGateway {
  constructor(config = {}) {
    // Default credentials from reference project
    // Can be overridden via environment variables or config parameter
    this.merchantId = config.merchantId || import.meta.env.VITE_APPLETREE_MERCHANT_ID || '23de4621-ea24-433f-9b45-dc1e383d8c2b';
    this.baseUrl = config.baseUrl || import.meta.env.VITE_APPLETREE_BASE_URL || 'https://sandbox-dev.appletreepayments.com';
    this.apiVersion = config.apiVersion || 'V2';
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}/vas/${this.apiVersion}/${endpoint}`;
    
    const options = {
      method: method.toUpperCase(),
      headers: {
        'MerchantId': this.merchantId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && method.toUpperCase() !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorJson;
      try {
        errorJson = JSON.parse(responseText);
      } catch (e) {
        const error = new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
        error.status = response.status;
        error.responseText = responseText;
        throw error;
      }
      const error = new Error(errorJson.ResultMessage || errorJson.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.responseBody = errorJson;
      error.responseText = responseText;
      throw error;
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${e.message}`);
    }
    
    if (result.Status === 'ERROR' || result.Status === 'NOTFOUND') {
      throw new Error(result.ResultMessage || result.message || 'API request failed');
    }

    return result;
  }

  async getCountries() {
    const response = await this.request('GET', 'Countries');
    return response.Countries || [];
  }

  async getServices(countryCode = null) {
    const endpoint = countryCode ? `Services?CountryCode=${countryCode}` : 'Services';
    const response = await this.request('GET', endpoint);
    return response;
  }

  async getServiceProviders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.countryCode) params.append('countryCode', filters.countryCode);
    if (filters.serviceId) params.append('service', filters.serviceId);
    
    const endpoint = params.toString() ? `ServiceProviders?${params}` : 'ServiceProviders';
    const response = await this.request('GET', endpoint);
    return response.ServiceProviders || [];
  }

  async getProducts(filters) {
    if (!filters.countryCode || !filters.serviceId) {
      throw new Error('countryCode and serviceId are required');
    }

    const params = new URLSearchParams({
      countryCode: filters.countryCode,
      service: filters.serviceId
    });

    if (filters.serviceProviderId) {
      params.append('serviceProviderId', filters.serviceProviderId);
    }

    const endpoint = `Products?${params}`;
    const response = await this.request('GET', endpoint);
    
    // Try all possible product array property names
    let products = response.ServiceProducts || response.Products || response.Data || [];
    
    return products;
  }

  async getProductById(productId) {
    if (!productId) throw new Error('productId is required');
    const response = await this.request('GET', `Product?id=${productId}`);
    return response.ServiceProduct || null;
  }

  async validatePayment(paymentData) {
    return await this.request('POST', 'ValidatePayment', paymentData);
  }

  async postPayment(paymentData) {
    return await this.request('POST', 'PostPayment', paymentData);
  }

  static generateRequestId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Service ID constants
export const Services = {
  MOBILE_AIRTIME: 1,
  MOBILE_DATA: 2,
  MOBILE_BUNDLES: 3,
  INTERNET_BROADBAND: 5,
  ELECTRICITY: 6,
  GAS: 8,
  EDUCATION: 9,
  INSURANCE: 10,
  PHONE: 12,
  TELEVISION: 13,
  LOCAL_AUTHORITIES: 17,
  RETAIL_SHOPS: 18
};

