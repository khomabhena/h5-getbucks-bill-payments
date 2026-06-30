/**
 * Display label for credit party identifier fields.
 * Prefer catalog Title (Tapseed pattern) with electricity-specific overrides.
 */

export const getDisplayIdentifierLabel = (
  identifierTitle,
  { serviceName, providerName, productName } = {}
) => {
  const fallbackLabel = identifierTitle?.trim() || 'Account Number';
  const normalizedLabel = fallbackLabel.toLowerCase();

  const includes = (value, keyword) =>
    typeof value === 'string' && value.toLowerCase().includes(keyword);

  const isElectricityContext =
    includes(serviceName, 'electric') ||
    includes(providerName, 'zetdc') ||
    includes(providerName, 'zesa') ||
    includes(productName, 'zetdc') ||
    includes(productName, 'zesa');

  const looksLikeMobileNumber =
    normalizedLabel === 'mobile number' ||
    normalizedLabel === 'phone1 number' ||
    normalizedLabel === 'phone number' ||
    normalizedLabel === 'mobile #' ||
    normalizedLabel === 'msisdn' ||
    normalizedLabel === 'mssdn' ||
    normalizedLabel === 'mobile';

  const looksLikeAccountNumber =
    normalizedLabel === 'account number' || normalizedLabel === 'account';

  if (isElectricityContext && (looksLikeMobileNumber || looksLikeAccountNumber)) {
    return 'Meter Number';
  }

  return fallbackLabel;
};

/**
 * Minimum characters before calling VAS validate (avoids errors while typing).
 */
export const getMinIdentifierLength = (fieldLabel, fieldName) => {
  const label = (fieldLabel || '').toLowerCase();
  const name = (fieldName || '').toLowerCase();

  if (label.includes('meter') || name.includes('meter')) return 10;
  if (label.includes('smart card') || name.includes('smartcard')) return 10;
  if (
    label.includes('mobile') ||
    label.includes('phone') ||
    name.includes('mobile') ||
    name.includes('phone')
  ) {
    return 9;
  }
  return 8;
};
