/**
 * Build VAS ValidatePayment / PostPayment payloads for bill payments.
 * Mirrors Tapseed BillPaymentFlowManager + AccountInput patterns.
 */

import {
  buildCreditPartyIdentifiers,
  buildPaymentRecipient,
} from '../../utils/creditPartyIdentifiers.js';
import { productRequiresValidation } from '../../utils/productValidation.js';

export function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const DEFAULT_CUSTOMER_EMAIL = 'test@test.com';

/** VAS requires CustomerDetails.EmailAddress — never send null. */
export function resolveCustomerDetailsForVas(details = {}) {
  return {
    CustomerId:
      details.CustomerId ||
      details.openId ||
      details.id ||
      details.userId ||
      details.userInfo?.userId ||
      details.userInfo?.id ||
      '1',
    Fullname:
      details.Fullname ||
      details.FullName ||
      details.name ||
      details.fullName ||
      details.displayName ||
      details.userInfo?.name ||
      details.userInfo?.fullName ||
      details.userInfo?.displayName ||
      'Customer',
    MobileNumber:
      details.MobileNumber ||
      details.phoneNumber ||
      details.msisdn ||
      details.userInfo?.msisdn ||
      details.userInfo?.phoneNumber ||
      details.userInfo?.phone ||
      '+263777077921',
    EmailAddress: DEFAULT_CUSTOMER_EMAIL,
  };
}

function deriveAccountNameFromValidation(validationData, accountValue) {
  if (validationData?.DisplayData) {
    const nameEntry = validationData.DisplayData.find((item = {}) => {
      const label = item.Label?.toLowerCase() || '';
      return label.includes('name');
    });
    if (nameEntry?.Value) {
      return nameEntry.Value;
    }
  }
  return accountValue || 'Customer';
}

function buildCreditPartySection({
  product,
  accountValue,
  notifyNumber,
  customerDetails,
  primaryFieldName,
}) {
  const resolvedCustomer = resolveCustomerDetailsForVas(customerDetails);
  const primaryField = primaryFieldName;

  return {
    Recipient: buildPaymentRecipient({
      accountValue,
      notifyNumber,
      primaryFieldName: primaryField,
      customerDetails: resolvedCustomer,
      product,
    }),
    CreditPartyIdentifiers: buildCreditPartyIdentifiers({
      product,
      accountValue,
      customerDetails: resolvedCustomer,
      notifyNumber,
      primaryFieldName: primaryField,
    }),
  };
}

/**
 * Prepare validation state for PostPayment (Tapseed postPaymentToAppleTree prelude).
 */
export function prepareFulfillmentValidation(validationData, product) {
  const validationRequired = productRequiresValidation(product);
  let fulfillmentValidation = validationData;

  if (validationRequired) {
    if (!fulfillmentValidation || fulfillmentValidation.Status !== 'VALIDATED') {
      return {
        ok: false,
        validationData: fulfillmentValidation,
        skipResult: null,
        reason: 'not_validated',
      };
    }

    if (!fulfillmentValidation.RequestId && !fulfillmentValidation.requestId) {
      return {
        ok: false,
        validationData: fulfillmentValidation,
        skipResult: {
          success: false,
          status: 'MISSING_REQUEST_ID',
          resultMessage: 'Validation response missing RequestId.',
        },
        reason: 'missing_request_id',
      };
    }
  } else {
    fulfillmentValidation = {
      ...(fulfillmentValidation || {}),
      RequestId:
        fulfillmentValidation?.RequestId ||
        fulfillmentValidation?.requestId ||
        generateRequestId(),
      Status: fulfillmentValidation?.Status || 'SKIPPED',
    };
  }

  return {
    ok: true,
    validationData: fulfillmentValidation,
    skipResult: null,
    reason: null,
  };
}

export function buildValidatePaymentPayload({
  product,
  amount,
  currency,
  accountValue,
  notifyNumber,
  customerDetails,
  primaryFieldName,
  requestId = generateRequestId(),
  billReferenceNumber,
}) {
  const resolvedCustomer = resolveCustomerDetailsForVas(customerDetails);
  const creditParty = buildCreditPartySection({
    product,
    accountValue,
    notifyNumber,
    customerDetails: resolvedCustomer,
    primaryFieldName,
  });

  const payload = {
    RequestId: requestId,
    Amount: parseFloat(amount) || 0,
    ...creditParty,
    Currency: (currency || 'USD').toString().toUpperCase(),
    CustomerDetails: resolvedCustomer,
    POSDetails: {
      CashierId: 'GetBucks',
      StoreId: 'GetBucks',
      TerminalId: 'GetBucks',
    },
    ProductId: product?.Id || product?.id,
    Quantity: 1,
  };

  if (billReferenceNumber) {
    payload.BillReferenceNumber = billReferenceNumber;
  }

  return payload;
}

export function buildPostPaymentPayload({
  product,
  amount,
  currency,
  accountValue,
  notifyNumber,
  customerDetails,
  validationData,
  bankReference,
  requestId,
  primaryFieldName,
}) {
  const fulfillmentValidation = validationData || {};
  const resolvedRequestId =
    requestId ||
    fulfillmentValidation?.RequestId ||
    fulfillmentValidation?.requestId ||
    generateRequestId();

  const currencyCode = (
    fulfillmentValidation?.Currency ||
    product?.Currency ||
    product?.currency ||
    currency ||
    'USD'
  )
    .toString()
    .toUpperCase();

  const baseCustomer = resolveCustomerDetailsForVas(customerDetails);
  const fullName =
    baseCustomer.Fullname ||
    deriveAccountNameFromValidation(fulfillmentValidation, accountValue);

  const resolvedCustomer = {
    ...baseCustomer,
    Fullname: fullName,
    FullName: fullName,
  };

  const creditParty = buildCreditPartySection({
    product,
    accountValue,
    notifyNumber,
    customerDetails: resolvedCustomer,
    primaryFieldName,
  });

  const posDetails = {
    CashierId: fulfillmentValidation?.POSDetails?.CashierId || 'GetBucks',
    StoreId: fulfillmentValidation?.POSDetails?.StoreId || 'GetBucks',
    TerminalId: fulfillmentValidation?.POSDetails?.TerminalId || 'GetBucks',
  };

  const paymentReference = bankReference || `BP-${Date.now()}`;

  return {
    RequestId: resolvedRequestId,
    ProductId: product?.Id || product?.id,
    BillReferenceNumber:
      fulfillmentValidation?.BillReferenceNumber ??
      fulfillmentValidation?.billReferenceNumber ??
      null,
    PaymentChannel: 'BankAccount',
    PaymentReferenceNumber: paymentReference,
    Quantity: 1,
    Currency: currencyCode,
    Amount: typeof amount === 'number' ? amount : Number(amount) || 0,
    CustomerDetails: resolvedCustomer,
    ...creditParty,
    POSDetails: posDetails,
  };
}

export function mapVasPaymentToUiResult(response, requestId) {
  const isSuccess =
    response?.Status === 'SUCCESSFUL' || response?.Status === 'VALIDATED';
  const isRetryable = response?.Status === 'FAILEDREPEATABLE';
  const receiptHTML = response?.ReceiptHTML;
  const receiptSmses = response?.ReceiptSmses;

  return {
    success: isSuccess,
    status: response?.Status,
    requestId: response?.RequestId || requestId,
    referenceNumber: response?.ReferenceNumber,
    resultMessage: response?.ResultMessage || response?.ResultInformation || response?.Message,
    vouchers: response?.Vouchers || [],
    receiptHTML: Array.isArray(receiptHTML) ? receiptHTML : receiptHTML ? [receiptHTML] : [],
    receiptSmses: Array.isArray(receiptSmses) ? receiptSmses : receiptSmses ? [receiptSmses] : [],
    displayData: response?.DisplayData || [],
    isRetryable,
    isFailedRepeatable: isRetryable,
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
      error.responseData?.ResultInformation ||
      error.message ||
      'VAS payment request failed',
    referenceNumber: error.responseData?.ReferenceNumber,
    vouchers: [],
    receiptHTML: [],
    receiptSmses: [],
    displayData: error.responseData?.DisplayData || [],
    isRetryable: error.responseData?.Status === 'FAILEDREPEATABLE',
    isFailedRepeatable: error.responseData?.Status === 'FAILEDREPEATABLE',
    source: 'vas',
  };
}
