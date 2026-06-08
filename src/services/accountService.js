import { API_BASE } from '../config/api.js';

export const DEFAULT_ACCOUNT_CURRENCY = 'USD';

export async function fetchAccountCurrency(accountNumber) {
  if (!accountNumber || !API_BASE) {
    return {
      success: true,
      vasCurrency: DEFAULT_ACCOUNT_CURRENCY,
      currencyCode: DEFAULT_ACCOUNT_CURRENCY,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/accounts/${encodeURIComponent(accountNumber)}/currency`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Account currency lookup failed (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      ...data,
      vasCurrency: data.vasCurrency || data.currencyCode || DEFAULT_ACCOUNT_CURRENCY,
    };
  } catch (error) {
    console.warn('Account currency lookup failed, defaulting to USD:', error);
    return {
      success: false,
      vasCurrency: DEFAULT_ACCOUNT_CURRENCY,
      currencyCode: DEFAULT_ACCOUNT_CURRENCY,
    };
  }
}
