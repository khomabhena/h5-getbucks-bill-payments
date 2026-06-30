/**
 * VAS catalog via GetBucks VAS server (live V2 API).
 */

import { vasCatalogUrl } from '../../config/api.js';
import {
  getCatalogQueryCurrency,
  matchesCatalogCurrency,
} from '../../config/catalogCurrency.js';
import { filterBillPaymentServices } from '../../utils/billPaymentServices.js';
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
  const products = data.ServiceProducts || data.Products || data.Data || [];
  return Array.isArray(products) ? products : [];
}

function extractProviders(data) {
  return data.ServiceProviders || data.Providers || [];
}

function filterProductsByCurrency(products, preferredCurrency) {
  if (!Array.isArray(products)) return [];
  return products.filter((product) => matchesCatalogCurrency(product, preferredCurrency));
}

class VasCatalogService {
  async getServices(countryCode = null) {
    try {
      const query = countryCode ? { countryCode } : {};
      const data = await vasJson(catalogUrl('/services', query));
      const services = data.Services || data;
      return {
        success: true,
        data: Array.isArray(services) ? services : [],
        response: data,
        source: 'vas',
      };
    } catch (error) {
      console.error('VAS getServices failed:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Bill payment services for a country (Tapseed pattern).
   */
  async getBillPaymentServicesForCountry(countryCode) {
    const result = await this.getServices(countryCode);
    if (!result.success) {
      return result;
    }

    const billServices = filterBillPaymentServices(result.data);
    return { success: true, data: billServices, source: 'vas' };
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
      const preferredCurrency = filters.currency;
      const queryCurrency = getCatalogQueryCurrency(preferredCurrency);
      let query;

      if (filters.parentProduct) {
        query = {
          parentProduct: filters.parentProduct,
          ...(queryCurrency ? { currency: queryCurrency } : {}),
        };
      } else {
        if (!filters.countryCode || !filters.serviceId) {
          throw new Error('countryCode and serviceId are required');
        }

        query = {
          countryCode: filters.countryCode,
          service: filters.serviceId,
          ...(queryCurrency ? { currency: queryCurrency } : {}),
        };
        if (filters.serviceProviderId) {
          query.serviceProvider = filters.serviceProviderId;
        }
      }

      const data = await vasJson(catalogUrl('/products', query));
      const products = filterProductsByCurrency(extractProducts(data), preferredCurrency);
      return {
        success: true,
        data: products,
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
