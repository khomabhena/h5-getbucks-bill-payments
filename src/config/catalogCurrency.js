/**
 * Catalog currency filter — controlled via env, no code change required.
 *
 * VITE_CATALOG_CURRENCIES
 *   - Comma-separated ISO codes, e.g. `USD` or `USD,ZWG`
 *   - `*` or `ALL` disables filtering (show every currency from VAS)
 *
 * Default: USD only.
 */

const CURRENCY_ALIASES = {
  ZWG: ['ZWG', 'ZWL', 'ZIG'],
  ZWL: ['ZWG', 'ZWL', 'ZIG'],
  ZIG: ['ZWG', 'ZWL', 'ZIG'],
};

const parseAllowlist = () => {
  const raw =
    import.meta.env.VITE_CATALOG_CURRENCIES ??
    import.meta.env.VITE_CATALOG_CURRENCY ??
    'USD';

  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === '*' || trimmed.toUpperCase() === 'ALL') {
    return null;
  }

  const codes = trimmed
    .split(',')
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);

  return codes.length ? [...new Set(codes)] : null;
};

/** Allowed catalog currencies, or null = no filter. */
export const CATALOG_CURRENCY_ALLOWLIST = parseAllowlist();

export const isCatalogCurrencyFilterEnabled = () =>
  Array.isArray(CATALOG_CURRENCY_ALLOWLIST) && CATALOG_CURRENCY_ALLOWLIST.length > 0;

export const getProductCurrency = (product) =>
  String(product?.Currency || product?.currency || 'USD')
    .trim()
    .toUpperCase();

const currencyMatchesAllowlist = (productCurrency, allowedCode) => {
  if (productCurrency === allowedCode) return true;
  const aliases = CURRENCY_ALIASES[allowedCode];
  return aliases?.includes(productCurrency) ?? false;
};

/** True when the product should appear in catalog lists for the current filter. */
export const matchesCatalogCurrency = (product, preferredCurrency) => {
  const productCurrency = getProductCurrency(product);

  if (preferredCurrency) {
    const preferred = String(preferredCurrency).trim().toUpperCase();
    if (currencyMatchesAllowlist(productCurrency, preferred)) return true;
    if (productCurrency === preferred) return true;
  }

  if (!isCatalogCurrencyFilterEnabled()) return true;

  return CATALOG_CURRENCY_ALLOWLIST.some((allowed) =>
    currencyMatchesAllowlist(productCurrency, allowed)
  );
};

/**
 * Currency query param for VAS catalog API.
 * Single-code allowlists are sent upstream; multi-code lists are filtered client-side only.
 */
export const getCatalogQueryCurrency = (preferredCurrency) => {
  if (preferredCurrency) {
    return String(preferredCurrency).trim().toUpperCase();
  }
  if (!isCatalogCurrencyFilterEnabled()) return undefined;
  if (CATALOG_CURRENCY_ALLOWLIST.length === 1) return CATALOG_CURRENCY_ALLOWLIST[0];
  return undefined;
};

/** Primary checkout currency (first allowed code, or USD). */
export const getDefaultCheckoutCurrency = () =>
  CATALOG_CURRENCY_ALLOWLIST?.[0] || 'USD';
