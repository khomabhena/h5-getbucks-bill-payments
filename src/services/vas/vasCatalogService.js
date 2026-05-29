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

function extractCountries(data) {
  return data.Countries || data.countries || [];
}

const MOBILE_SERVICE_IDS = new Set([1, 2, 3]);

function isBillPaymentService(service) {
  const id = Number(service?.Id ?? service?.id);
  return Number.isFinite(id) && !MOBILE_SERVICE_IDS.has(id);
}

class VasCatalogService {
  /**
   * Full service list from VAS (no country filter on this call).
   */
  async getServices(_countryCodeIgnored) {
    try {
      const data = await vasJson(catalogUrl('/services'));
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

  async getCountriesForService(serviceId) {
    try {
      const data = await vasJson(catalogUrl('/countries', { service: serviceId }));
      return {
        success: true,
        data: extractCountries(data),
      };
    } catch (error) {
      console.error('VAS getCountriesForService failed:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Bill payment services for a country.
   * VAS /Services?countryCode=ZW often returns only a subset (e.g. Electricity + DSTV);
   * we load the full catalog then keep services that list the country (or all bill types as fallback).
   */
  async getBillPaymentServicesForCountry(countryCode) {
    const allResult = await this.getServices();
    if (!allResult.success) {
      return allResult;
    }

    const billServices = allResult.data.filter(isBillPaymentService);
    if (!countryCode) {
      return { success: true, data: billServices, source: 'vas' };
    }

    const checks = await Promise.all(
      billServices.map(async (service) => {
        const serviceId = service.Id ?? service.id;
        const countriesResult = await this.getCountriesForService(serviceId);
        const countries = countriesResult.data || [];
        const supportsCountry = countries.some(
          (c) =>
            String(c.Code || c.code || '').toUpperCase() ===
            String(countryCode).toUpperCase()
        );
        return supportsCountry ? service : null;
      })
    );

    const forCountry = checks.filter(Boolean);

    if (forCountry.length > 0) {
      console.log(
        `ℹ️ ${forCountry.length} bill service(s) support ${countryCode}:`,
        forCountry.map((s) => s.Name).join(', ')
      );
      return { success: true, data: forCountry, source: 'vas' };
    }

    console.warn(
      `⚠️ No bill services matched ${countryCode} via /countries — showing full bill catalog (${billServices.length})`
    );
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
