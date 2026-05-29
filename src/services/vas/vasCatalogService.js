/**
 * VAS catalog via GetBucks VAS server (live V2 API).
 */

import { vasCatalogUrl } from '../../config/api.js';
import { vasJson } from './vasHttp.js';

function catalogUrl(path, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return `${vasCatalogUrl}${path}${qs ? `?${qs}` : ''}`;
}

function extractProducts(data) {
  return data.ServiceProducts || data.Products || data.Data || [];
}

function extractProviders(data) {
  return data.ServiceProviders || data.Providers || [];
}

class VasCatalogService {
  async getServices(countryCode) {
    try {
      const query = countryCode ? { countryCode } : {};
      const data = await vasJson(catalogUrl('/services', query));
      const services = data.Services || data;
      return {
        success: true,
        data: Array.isArray(services) ? services : [],
        source: 'vas',
      };
    } catch (error) {
      console.error('VAS getServices failed:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getServiceProviders(filters) {
    try {
      const data = await vasJson(
        catalogUrl('/service-providers', {
          countryCode: filters.countryCode,
          service: filters.serviceId,
        })
      );
      return {
        success: true,
        data: extractProviders(data),
        response: data,
      };
    } catch (error) {
      console.error('VAS getServiceProviders failed:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getProducts(filters, useCache = true) {
    void useCache;
    try {
      if (!filters.countryCode || !filters.serviceId) {
        throw new Error('countryCode and serviceId are required');
      }

      const query = {
        countryCode: filters.countryCode,
        service: filters.serviceId,
      };
      if (filters.serviceProviderId) {
        query.serviceProviderId = filters.serviceProviderId;
      }

      const data = await vasJson(catalogUrl('/products', query));
      return {
        success: true,
        data: extractProducts(data),
        source: 'vas',
      };
    } catch (error) {
      console.error('VAS getProducts failed:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async validatePayment(paymentData) {
    const { validateBillPayment } = await import('../billPaymentsApi.js');
    return validateBillPayment(paymentData);
  }

  async postPayment(paymentData) {
    const { postBillPayment } = await import('../billPaymentsApi.js');
    return postBillPayment(paymentData);
  }
}

export const vasCatalogService = new VasCatalogService();
export { SERVICES } from '../../data/constants.js';
export default vasCatalogService;
