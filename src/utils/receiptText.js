import {
  resolveFulfillmentStatusLabel,
  resolveFulfillmentUserMessage,
} from './fulfillmentMessages.js';
import { stripHtml } from './stripHtml.js';

const formatCurrencyCode = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${currencyCode} ${Math.round(amountValue)}`;
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
  const validationDisplayData = Array.isArray(validationData?.DisplayData)
    ? validationData.DisplayData.filter((item) => item?.Value?.trim?.())
    : [];

  const accountName = getAccountName(validationData, accountValue);
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
    paymentSuccessful: isPaymentSuccessful,
    fulfillmentSuccessful: fulfillmentSuccess,
    transactionId: transactionId || `TXN${Date.now()}`,
    referenceNumber: fulfillmentReferenceNumber || null,
    paymentStatus: paymentStatus || null,
    vasStatus: fulfillmentResult?.status || null,
    providerName: provider?.Name || provider?.name || 'N/A',
    productName: product?.Name || product?.name || 'N/A',
    productId: product?.Id || product?.id || null,
    accountValue: accountValue || 'N/A',
    accountName: accountName && accountName !== accountValue ? accountName : null,
    notifyNumber: notifyNumber || null,
    countryName: country?.countryName || null,
    serviceName: service?.Name || null,
    amountPaid: formatCurrencyCode(amount || 0, currency),
    date: timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString(),
    fulfillmentDisplayData,
    validationDisplayData,
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
    'GETBUCKS — BILL PAYMENT RECEIPT',
    '===============================',
    '',
    receiptData.headline,
    '',
    'TRANSACTION',
    `Transaction ID: ${receiptData.transactionId}`,
    receiptData.referenceNumber ? `Reference: ${receiptData.referenceNumber}` : null,
    `Date: ${receiptData.date}`,
    receiptData.paymentStatus ? `Payment status: ${receiptData.paymentStatus}` : null,
    receiptData.vasStatus ? `VAS status: ${receiptData.vasStatus}` : null,
    '',
    'BILL DETAILS',
    `Provider: ${receiptData.providerName}`,
    `Product: ${receiptData.productName}`,
    receiptData.productId ? `Product ID: ${receiptData.productId}` : null,
    `Account: ${receiptData.accountValue}`,
    receiptData.accountName ? `Account name: ${receiptData.accountName}` : null,
    receiptData.notifyNumber ? `Notification number: ${receiptData.notifyNumber}` : null,
    receiptData.countryName ? `Country: ${receiptData.countryName}` : null,
    receiptData.serviceName ? `Service: ${receiptData.serviceName}` : null,
    `Total paid: ${receiptData.amountPaid}`,
    '',
    'FULFILLMENT',
    `Status: ${receiptData.statusLabel}`,
    receiptData.statusDetail,
    '',
  ].filter((line) => line !== null && line !== undefined);

  if (receiptData.validationDisplayData.length > 0) {
    lines.push('ACCOUNT INFORMATION');
    receiptData.validationDisplayData.forEach((item) => {
      lines.push(`${item.Label}: ${item.Value}`);
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
