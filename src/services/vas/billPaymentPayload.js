/**
 * Build VAS ValidatePayment / PostPayment payloads for bill payments.
 */

export function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getCreditPartyFieldName(product) {
  const creditPartyIdentifier = product?.CreditPartyIdentifiers?.[0];
  return creditPartyIdentifier?.Name || 'AccountNumber';
}

/**
 * @param {object} params
 * @param {object} params.product
 * @param {string|number} params.amount
 * @param {string} params.currency
 * @param {string} params.accountValue
 * @param {object} params.customerDetails
 * @param {string} [params.requestId]
 * @param {string} [params.billReferenceNumber]
 */
export function buildValidatePaymentPayload({
  product,
  amount,
  currency,
  accountValue,
  customerDetails,
  requestId = generateRequestId(),
  billReferenceNumber = 'validate',
}) {
  const fieldName = getCreditPartyFieldName(product);

  return {
    RequestId: requestId,
    Amount: parseFloat(amount) || 0,
    CreditPartyIdentifiers: [
      {
        IdentifierFieldName: fieldName,
        IdentifierFieldValue: String(accountValue || '').trim(),
      },
    ],
    Currency: currency || 'USD',
    CustomerDetails: customerDetails,
    POSDetails: {
      CashierId: 'GetBucks',
      StoreId: 'GetBucks',
      TerminalId: 'GetBucks',
    },
    ProductId: product?.Id || product?.id,
    Quantity: 1,
    BillReferenceNumber: billReferenceNumber,
  };
}

/**
 * PostPayment after BankWare transfer — links bank reference to VAS fulfillment.
 */
export function buildPostPaymentPayload({
  product,
  amount,
  currency,
  accountValue,
  customerDetails,
  bankReference,
  requestId = generateRequestId(),
}) {
  const fieldName = getCreditPartyFieldName(product);
  const ref = bankReference || `BP-${Date.now()}`;

  return {
    RequestId: requestId,
    Amount: parseFloat(amount) || 0,
    Currency: currency || 'USD',
    ProductId: product?.Id || product?.id,
    Quantity: 1,
    PaymentChannel: 'BankAccount',
    PaymentReferenceNumber: ref,
    BillReferenceNumber: ref,
    CustomerDetails: customerDetails,
    POSDetails: {
      CashierId: 'GetBucks',
      StoreId: 'GetBucks',
      TerminalId: 'GetBucks',
    },
    CreditPartyIdentifiers: [
      {
        IdentifierFieldName: fieldName,
        IdentifierFieldValue: String(accountValue || '').trim(),
      },
    ],
  };
}

export function mapVasPaymentToUiResult(response, requestId) {
  const isSuccess =
    response?.Status === 'SUCCESSFUL' || response?.Status === 'VALIDATED';
  const isRetryable = response?.Status === 'FAILEDREPEATABLE';

  return {
    success: isSuccess,
    status: response?.Status,
    requestId: response?.RequestId || requestId,
    referenceNumber: response?.ReferenceNumber,
    resultMessage: response?.ResultMessage || response?.Message,
    vouchers: response?.Vouchers || [],
    receiptHTML: response?.ReceiptHTML,
    receiptSmses: response?.ReceiptSmses,
    displayData: response?.DisplayData || [],
    isRetryable,
    data: response,
    source: 'vas',
  };
}

export function mapVasPaymentErrorToUiResult(error, requestId) {
  return {
    success: false,
    status: error.responseData?.Status || 'ERROR',
    requestId,
    error: error.message,
    resultMessage:
      error.responseData?.ResultMessage ||
      error.message ||
      'VAS payment request failed',
    referenceNumber: error.responseData?.ReferenceNumber,
    vouchers: [],
    displayData: error.responseData?.DisplayData || [],
    isRetryable: error.responseData?.Status === 'FAILEDREPEATABLE',
    source: 'vas',
  };
}
