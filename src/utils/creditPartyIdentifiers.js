/**
 * Build CreditPartyIdentifiers for VAS ValidatePayment / PostPayment.
 * Products may require multiple identifiers (e.g. AccountNumber + NotifyNumber for ZESA).
 */

export function getFieldName(identifier = {}) {
  return (
    identifier.Name ||
    identifier.IdentifierFieldName ||
    identifier.FieldName ||
    'AccountNumber'
  );
}

function normalizeFieldName(fieldName) {
  return (fieldName || '').toLowerCase().replace(/[\s_-]/g, '');
}

export function isNotificationPhoneField(fieldName) {
  const normalized = normalizeFieldName(fieldName);
  return (
    normalized === 'notifynumber' ||
    normalized === 'notificationnumber' ||
    normalized.includes('notify')
  );
}

function getCatalogEntry(product, fieldName) {
  return (product?.CreditPartyIdentifiers || []).find(
    (identifier) =>
      normalizeFieldName(getFieldName(identifier)) === normalizeFieldName(fieldName)
  );
}

function isNameLikeMemberNumberField(product, fieldName, rawValue = '') {
  if (normalizeFieldName(fieldName) !== 'membernumber') {
    return false;
  }

  const entry = getCatalogEntry(product, fieldName);
  const title = (entry?.Title || '').toLowerCase();
  if (title.includes('name') || title.includes('full')) {
    return true;
  }

  const text = String(rawValue || '').trim();
  return Boolean(text) && /[a-zA-Z]/.test(text) && !/\d{5,}/.test(text);
}

function isPhoneField(fieldName, product, rawValue = '') {
  const normalized = normalizeFieldName(fieldName);
  if (isNotificationPhoneField(fieldName)) {
    return true;
  }

  if (normalized === 'membernumber') {
    if (isNameLikeMemberNumberField(product, fieldName, rawValue)) {
      return false;
    }

    const entry = getCatalogEntry(product, fieldName);
    const regex = entry?.RegexExpression || '';
    return Boolean(regex) && /263|\(0|\\d|\\\+/.test(regex);
  }

  return (
    normalized === 'mobilenumber' ||
    normalized === 'phonenumber' ||
    normalized === 'msisdn'
  );
}

function isNameField(fieldName) {
  const normalized = normalizeFieldName(fieldName);
  return (
    normalized === 'fullname' ||
    normalized === 'name' ||
    normalized === 'customername' ||
    normalized === 'donorname'
  );
}

export function isElectricityProduct(product = {}) {
  const serviceName = product.Service?.Name || product.service?.Name || '';
  const providerName =
    product.ServiceProvider?.Name || product.serviceProvider?.Name || '';
  const productName = product.Name || product.name || '';

  return (
    /electric/i.test(serviceName) ||
    /zetdc|zesa/i.test(providerName) ||
    /zetdc|zesa/i.test(productName)
  );
}

export function getPrimaryIdentifierFieldName(product = {}) {
  const catalogIdentifiers = product?.CreditPartyIdentifiers;
  if (!Array.isArray(catalogIdentifiers) || catalogIdentifiers.length === 0) {
    return 'AccountNumber';
  }

  const primary =
    catalogIdentifiers.find((identifier) => identifier.Required !== false) ||
    catalogIdentifiers[0];

  return getFieldName(primary);
}

export function getNotifyIdentifierConfig(product = {}) {
  const catalogEntry = (product.CreditPartyIdentifiers || []).find((identifier) =>
    isNotificationPhoneField(getFieldName(identifier))
  );

  if (catalogEntry) {
    const title = catalogEntry.Title?.trim() || '';
    const normalizedTitle = title.toLowerCase();
    const useCatalogTitle =
      title &&
      (normalizedTitle.includes('notif') ||
        normalizedTitle.includes('sms') ||
        normalizedTitle.includes('token') ||
        normalizedTitle.includes('mobile'));

    return {
      fieldName: getFieldName(catalogEntry),
      label: useCatalogTitle ? title : 'Notification number',
      required: catalogEntry.Required !== false,
    };
  }

  if (isElectricityProduct(product)) {
    return {
      fieldName: 'NotifyNumber',
      label: 'Notification number',
      required: false,
    };
  }

  return null;
}

export function productRequiresNotifyNumber(product = {}) {
  return getNotifyIdentifierConfig(product) !== null;
}

function resolveNotifyNumber({ notifyNumber, overrides, customerDetails }) {
  const userEntered =
    notifyNumber !== undefined && notifyNumber !== null
      ? String(notifyNumber).trim()
      : '';

  if (userEntered) {
    return userEntered;
  }

  const override =
    overrides.NotifyNumber !== undefined && overrides.NotifyNumber !== null
      ? String(overrides.NotifyNumber).trim()
      : '';

  if (override) {
    return override;
  }

  return (customerDetails.MobileNumber || '').trim();
}

/**
 * Recipient block for VAS BFF enrichment (matches 24-getbucks-vas-server creditParty.js).
 */
export function buildPaymentRecipient({
  accountValue,
  notifyNumber,
  primaryFieldName,
  customerDetails = {},
  product,
}) {
  const trimmed = String(accountValue ?? '').trim();
  const primary = primaryFieldName || 'AccountNumber';
  const normalizedPrimary = normalizeFieldName(primary);
  const recipient = {};

  if (trimmed) {
    recipient.accountNumber = trimmed;

    if (isNameLikeMemberNumberField(product, primary, trimmed) || isNameField(primary)) {
      recipient.fullName = trimmed;
    } else if (
      normalizedPrimary === 'membernumber' ||
      isPhoneField(primary, product, trimmed)
    ) {
      recipient.memberNumber = trimmed;
      recipient.msisdn = trimmed;
      recipient.phoneNumber = trimmed;
    }
  }

  const notify = String(notifyNumber ?? '').trim();
  if (notify) {
    recipient.notifyNumber = notify;
  }

  const profileName = (customerDetails.Fullname || customerDetails.FullName || '').trim();
  if (!recipient.fullName && profileName && profileName !== 'Customer') {
    recipient.fullName = profileName;
  }

  return recipient;
}

export function buildCreditPartyIdentifiers({
  product,
  accountValue,
  customerDetails = {},
  notifyNumber,
  overrides = {},
  primaryFieldName,
}) {
  const catalogIdentifiers = product?.CreditPartyIdentifiers;
  const mobileNumber = resolveNotifyNumber({ notifyNumber, overrides, customerDetails });
  const primaryField = primaryFieldName || getPrimaryIdentifierFieldName(product);

  const trimmedAccount =
    accountValue !== undefined && accountValue !== null
      ? String(accountValue).trim()
      : '';

  const profileName = (customerDetails.Fullname || customerDetails.FullName || '').trim();

  const resolveValue = (fieldName) => {
    if (overrides[fieldName] !== undefined && overrides[fieldName] !== null) {
      return String(overrides[fieldName]).trim();
    }

    if (normalizeFieldName(fieldName) === normalizeFieldName(primaryField)) {
      return trimmedAccount;
    }

    if (isNotificationPhoneField(fieldName)) {
      return mobileNumber;
    }

    if (isNameField(fieldName) || isNameLikeMemberNumberField(product, fieldName, trimmedAccount)) {
      return trimmedAccount || profileName;
    }

    if (isPhoneField(fieldName, product, trimmedAccount || mobileNumber)) {
      return trimmedAccount || mobileNumber;
    }

    return trimmedAccount;
  };

  if (!Array.isArray(catalogIdentifiers) || catalogIdentifiers.length === 0) {
    const entries = [
      {
        IdentifierFieldName: primaryField,
        IdentifierFieldValue: trimmedAccount,
      },
    ];

    if (isElectricityProduct(product) && mobileNumber) {
      entries.push({
        IdentifierFieldName: 'NotifyNumber',
        IdentifierFieldValue: mobileNumber,
      });
    }

    return entries.filter((entry) => entry.IdentifierFieldValue);
  }

  const entries = catalogIdentifiers
    .filter((identifier) => identifier.Required !== false)
    .map((identifier) => {
      const fieldName = getFieldName(identifier);
      const value = resolveValue(fieldName);
      return {
        IdentifierFieldName: fieldName,
        IdentifierFieldValue: value,
      };
    })
    .filter((entry) => entry.IdentifierFieldValue);

  const hasNotifyNumber = entries.some((entry) =>
    isNotificationPhoneField(entry.IdentifierFieldName)
  );

  if (!hasNotifyNumber && isElectricityProduct(product) && mobileNumber) {
    entries.push({
      IdentifierFieldName: 'NotifyNumber',
      IdentifierFieldValue: mobileNumber,
    });
  }

  if (entries.length === 0 && trimmedAccount) {
    entries.push({
      IdentifierFieldName: primaryField,
      IdentifierFieldValue: trimmedAccount,
    });
  }

  return entries;
}
