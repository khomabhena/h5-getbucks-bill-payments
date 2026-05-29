/**
 * Single backend base URL — all H5 traffic goes through the VAS server.
 */
const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_VAS_API_BASE_URL || '';

export const API_BASE = raw.replace(/\/$/, '');

export const bankwareUrl = `${API_BASE}/api/getbucks`;
export const vasCatalogUrl = `${API_BASE}/api/vas/catalog`;
export const vasPaymentUrl = `${API_BASE}/api/vas/payment`;

export const usesVasBankWareProxy = () =>
  Boolean(API_BASE) && bankwareUrl.includes('/api/getbucks');
