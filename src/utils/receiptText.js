import {
  isFulfillmentPending,
  resolveFulfillmentBillerMessage,
  resolveFulfillmentStatusLabel,
  resolveFulfillmentUserMessage,
} from './fulfillmentMessages.js';
import { stripHtml } from './stripHtml.js';
import { describeBillIdentifierExtras } from './billIdentifierFields.js';
import { getBillerDetailRows } from './billerDetails.js';
import { getChargeBreakdown, resolveDebitAmount } from './billExtras.js';

export const PAYMENT_METHOD_LABEL = 'GetBucks bank account';

/** "GetBucks bank account (••••1234)" — never the full account number. */
export const formatPaymentMethod = (accountNumber) => {
  const digits = String(accountNumber || '').trim();
  return digits ? `${PAYMENT_METHOD_LABEL} (••••${digits.slice(-4)})` : PAYMENT_METHOD_LABEL;
};

const formatCurrencyCode = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${currencyCode} ${amountValue.toFixed(2)}`;
};

const getVoucherToken = (voucher = {}) =>
  voucher.VoucherCode ||
  voucher.Token ||
  voucher.TokenNumber ||
  voucher.Code ||
  null;

const getAccountName = (validationData, accountValue) => {
  if (validationData?.DisplayData) {
    const accountNameItem = validationData.DisplayData.find(
      (item) =>
        item.Label?.toLowerCase().includes('account name') ||
        item.Label?.toLowerCase().includes('name')
    );
    return accountNameItem?.Value || accountValue;
  }
  return accountValue;
};

export const buildBillPaymentReceiptData = ({
  success,
  transactionId,
  paymentStatus,
  timestamp,
  country,
  service,
  provider,
  product,
  accountValue,
  notifyNumber,
  amount,
  validationData,
  postPaymentResult,
  extraIdentifierValues,
  paymentCode,
  selectedAddon,
  bankAccountNumber,
}) => {
  const currency = product?.Currency || product?.currency || 'USD';
  const isPaymentSuccessful = success === true || paymentStatus === 'SUCCESS';
  const fulfillmentResult = postPaymentResult || null;
  const fulfillmentSuccess = fulfillmentResult?.success === true;
  const fulfillmentReferenceNumber = fulfillmentResult?.referenceNumber;

  const vouchers = Array.isArray(fulfillmentResult?.vouchers) ? fulfillmentResult.vouchers : [];
  const receiptHTML = Array.isArray(fulfillmentResult?.receiptHTML)
    ? fulfillmentResult.receiptHTML
    : fulfillmentResult?.receiptHTML
      ? [fulfillmentResult.receiptHTML]
      : [];
  const receiptSmses = Array.isArray(fulfillmentResult?.receiptSmses)
    ? fulfillmentResult.receiptSmses
    : fulfillmentResult?.receiptSmses
      ? [fulfillmentResult.receiptSmses]
      : [];
  const fulfillmentDisplayData = Array.isArray(fulfillmentResult?.displayData)
    ? fulfillmentResult.displayData.filter((item) => item?.Value?.trim?.())
    : [];

  const accountName = getAccountName(validationData, accountValue);
  const charges = getChargeBreakdown(validationData);
  const statusLabel = resolveFulfillmentStatusLabel(fulfillmentResult);
  const statusDetail = resolveFulfillmentUserMessage(fulfillmentResult, {
    amount,
    currency,
    accountValue,
    providerName: provider?.Name || provider?.name,
  });

  return {
    generatedAt: new Date().toISOString(),
    headline: isPaymentSuccessful ? 'Payment Successful' : 'Payment Status',
    statusLabel,
    statusDetail,
    billerMessage: resolveFulfillmentBillerMessage(fulfillmentResult),
    paymentSuccessful: isPaymentSuccessful,
    fulfillmentSuccessful: fulfillmentSuccess,
    transactionId: transactionId || `TXN${Date.now()}`,
    referenceNumber: fulfillmentReferenceNumber || null,
    paymentStatus: paymentStatus || null,
    vasStatus: isFulfillmentPending(fulfillmentResult) ? 'PENDING' : fulfillmentResult?.status || null,
    paymentMethod: formatPaymentMethod(bankAccountNumber),
    providerName: provider?.Name || provider?.name || 'N/A',
    productName: product?.Name || product?.name || 'N/A',
    productId: product?.Id || product?.id || null,
    addonName: selectedAddon?.Name || null,
    accountValue: accountValue || 'N/A',
    accountName: accountName && accountName !== accountValue ? accountName : null,
    notifyNumber: notifyNumber || null,
    identifierExtraRows: describeBillIdentifierExtras(product, {
      extraValues: extraIdentifierValues,
      paymentCode,
    }),
    billerDetailRows: getBillerDetailRows(validationData, {
      omitValues: [accountValue, accountName],
    }),
    countryName: country?.countryName || null,
    serviceName: service?.Name || null,
    currency: currency.toUpperCase(),
    principalAmount: charges ? formatCurrencyCode(charges.principalAmount, currency) : null,
    serviceCharge:
      charges && charges.billerCharge + charges.taxCharge > 0
        ? formatCurrencyCode(charges.billerCharge + charges.taxCharge, currency)
        : null,
    amountPaid: formatCurrencyCode(resolveDebitAmount(validationData, amount || 0), currency),
    date: timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString(),
    fulfillmentDisplayData,
    vouchers,
    receiptTexts: receiptHTML
      .map((html, index) => ({
        index: index + 1,
        text: stripHtml(html),
      }))
      .filter((item) => item.text),
    receiptSmses: receiptSmses.filter(Boolean),
    getVoucherToken,
  };
};

export const generateBillPaymentReceiptPlainText = (receiptData) => {
  const lines = [
    'GETBUCKS — PROOF OF PAYMENT',
    '===========================',
    '',
    receiptData.headline,
    '',
    'TRANSACTION',
    `Proof of payment reference: ${receiptData.transactionId}`,
    receiptData.referenceNumber ? `Receipt number: ${receiptData.referenceNumber}` : null,
    `Date: ${receiptData.date}`,
    `Payment method: ${receiptData.paymentMethod}`,
    receiptData.paymentStatus ? `Payment status: ${receiptData.paymentStatus}` : null,
    receiptData.vasStatus ? `Biller status: ${receiptData.vasStatus}` : null,
    '',
    'BILL DETAILS',
    `Biller: ${receiptData.providerName}`,
    `Product: ${receiptData.productName}`,
    receiptData.addonName ? `Add-on: ${receiptData.addonName}` : null,
    `Customer account: ${receiptData.accountValue}`,
    receiptData.accountName ? `Customer name: ${receiptData.accountName}` : null,
    receiptData.notifyNumber ? `Notification number: ${receiptData.notifyNumber}` : null,
    ...(receiptData.identifierExtraRows || []).map((row) => `${row.label}: ${row.value}`),
    receiptData.countryName ? `Country: ${receiptData.countryName}` : null,
    receiptData.serviceName ? `Service: ${receiptData.serviceName}` : null,
    `Currency: ${receiptData.currency}`,
    receiptData.principalAmount ? `Amount: ${receiptData.principalAmount}` : null,
    receiptData.serviceCharge ? `Service charge: ${receiptData.serviceCharge}` : null,
    `Total paid: ${receiptData.amountPaid}`,
    '',
    'FULFILLMENT',
    `Status: ${receiptData.statusLabel}`,
    receiptData.statusDetail,
    receiptData.billerMessage ? `Biller response: ${receiptData.billerMessage}` : null,
    '',
  ].filter((line) => line !== null && line !== undefined);

  if (receiptData.billerDetailRows.length > 0) {
    lines.push('ACCOUNT INFORMATION');
    receiptData.billerDetailRows.forEach((row) => {
      lines.push(`${row.label}: ${row.value}`);
    });
    lines.push('');
  }

  if (receiptData.fulfillmentDisplayData.length > 0) {
    lines.push('TOKEN / VOUCHER DETAILS');
    receiptData.fulfillmentDisplayData.forEach((item) => {
      lines.push(`${item.Label}: ${item.Value}`);
    });
    lines.push('');
  }

  receiptData.vouchers.forEach((voucher, index) => {
    lines.push(`TOKEN ${index + 1}`);
    if (voucher.SerialNumber) lines.push(`Serial: ${voucher.SerialNumber}`);
    const token = receiptData.getVoucherToken(voucher);
    if (token) lines.push(`Token: ${token}`);
    if (voucher.ValidDays !== undefined) lines.push(`Valid days: ${voucher.ValidDays}`);
    if (voucher.ExpiryDate) {
      lines.push(`Expires: ${new Date(voucher.ExpiryDate).toLocaleDateString()}`);
    }
    lines.push('');
  });

  receiptData.receiptTexts.forEach((receipt) => {
    lines.push(`RECEIPT ${receipt.index}`);
    lines.push(receipt.text);
    lines.push('');
  });

  receiptData.receiptSmses.forEach((sms, index) => {
    lines.push(`SMS ${index + 1}`);
    lines.push(sms);
    lines.push('');
  });

  lines.push(`Generated: ${new Date(receiptData.generatedAt).toLocaleString()}`);

  return lines.join('\n').trim();
};

export const getBillPaymentReceiptPlainText = (input) => {
  const receiptData = buildBillPaymentReceiptData(input);
  return generateBillPaymentReceiptPlainText(receiptData);
};

export const getReceiptFileName = (transactionId) =>
  `proof-of-payment-${String(transactionId || Date.now()).replace(/[^\w-]/g, '')}.txt`;
