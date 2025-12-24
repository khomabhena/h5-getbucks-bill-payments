/**
 * Utility to get display label for credit party identifier fields
 * Maps technical field names to user-friendly labels
 */

const identifierLabelMap = {
  'AccountNumber': 'Account Number',
  'MeterNumber': 'Meter Number',
  'MemberNumber': 'Member Number',
  'CustomerNumber': 'Customer Number',
  'ReferenceNumber': 'Reference Number',
  'PhoneNumber': 'Phone Number',
  'MeterSerialNumber': 'Meter Serial Number',
  'BillNumber': 'Bill Number',
  'ContractNumber': 'Contract Number',
  'SubscriberNumber': 'Subscriber Number',
  'SmartCardNumber': 'Smart Card Number',
  'VoucherNumber': 'Voucher Number',
  'TokenNumber': 'Token Number',
  'PrepaidNumber': 'Prepaid Number',
  'PostpaidNumber': 'Postpaid Number',
};

/**
 * Get display label for identifier field
 * @param {string} fieldName - Technical field name (e.g., 'AccountNumber')
 * @param {Object} context - Context object with serviceName, providerName, productName
 * @returns {string} User-friendly label
 */
export const getDisplayIdentifierLabel = (fieldName, context = {}) => {
  const { serviceName, providerName, productName } = context;
  
  // Helper function to check if a value includes a keyword (case-insensitive)
  const includes = (value, keyword) =>
    typeof value === 'string' && value.toLowerCase().includes(keyword);
  
  // Check if this is an electricity context
  const isElectricityContext =
    includes(serviceName, 'electric') ||
    includes(providerName, 'zetdc') ||
    includes(productName, 'zetdc');
  
  // Normalize the field name for comparison
  const normalizedFieldName = fieldName?.toLowerCase().trim() || '';
  
  // Check if the label looks like a mobile/phone number
  const looksLikeMobileNumber =
    normalizedFieldName === 'mobile number' ||
    normalizedFieldName === 'phone1 number' ||
    normalizedFieldName === 'phone number' ||
    normalizedFieldName === 'mobile #' ||
    normalizedFieldName === 'msisdn' ||
    normalizedFieldName === 'mssdn' ||
    normalizedFieldName === 'mobile' ||
    normalizedFieldName === 'phonenumber';
  
  // Workaround: If it's electricity and looks like phone number, use Meter Number instead
  if (isElectricityContext && looksLikeMobileNumber) {
    return 'Meter Number';
  }
  
  if (!fieldName) {
    // Try to infer from context
    if (serviceName?.toLowerCase().includes('electricity')) {
      return 'Meter Number';
    }
    if (serviceName?.toLowerCase().includes('water')) {
      return 'Account Number';
    }
    if (serviceName?.toLowerCase().includes('tv') || serviceName?.toLowerCase().includes('television')) {
      return 'Smart Card Number';
    }
    if (serviceName?.toLowerCase().includes('gas')) {
      return 'Account Number';
    }
    
    return 'Account Number'; // Default
  }
  
  // Check if it's in our map
  if (identifierLabelMap[fieldName]) {
    return identifierLabelMap[fieldName];
  }
  
  // Convert PascalCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

