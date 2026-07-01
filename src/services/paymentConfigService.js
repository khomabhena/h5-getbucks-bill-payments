import { API_BASE } from '../config/api.js';

const APP_ID = 'bill-payments';

/**
 * Fetch BankWare merchant (credit) account from VAS BFF.
 * @param {{ app?: string, currency?: string }} options
 */
export async function fetchMerchantAccount({ app = APP_ID, currency } = {}) {
  if (!API_BASE) {
    throw new Error('API base URL is not configured');
  }

  const params = new URLSearchParams({ app });
  if (currency) {
    params.set('currency', String(currency).trim().toUpperCase());
  }

  const response = await fetch(
    `${API_BASE}/api/payment-config/merchant-account?${params.toString()}`,
    { cache: 'no-store' }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Merchant account lookup failed (${response.status})`;
    throw new Error(message);
  }

  return {
    success: true,
    app: data.app || app,
    currency: data.currency || currency || null,
    merchantAccount: data.merchantAccount,
  };
}
