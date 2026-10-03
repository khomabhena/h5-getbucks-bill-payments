const formatCurrencyCode = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${currencyCode} ${amountValue.toFixed(2)}`;
};

const PENDING_STATUS_PATTERN = /PENDING|PROCESSING|SUBMITTED|IN_?PROGRESS|QUEUED/i;

/**
 * Payment reached ZB but the biller has not confirmed yet
 * (e.g. "Payment received. Biller update is pending — please do not pay again.").
 */
export function isFulfillmentPending(fulfillmentResult) {
  if (!fulfillmentResult || fulfillmentResult.success === true) return false;
  if (fulfillmentResult.isFailedRepeatable === true || fulfillmentResult.isPending === true) {
    return true;
  }
  const status = String(fulfillmentResult.status || '');
  const message = String(fulfillmentResult.resultMessage || '');
  return PENDING_STATUS_PATTERN.test(status) || /\bpending\b/i.test(message);
}

export function resolveFulfillmentStatusLabel(fulfillmentResult) {
  if (!fulfillmentResult) return '';
  if (fulfillmentResult.success === true) return 'Payment Fulfilled';
  if (isFulfillmentPending(fulfillmentResult)) return 'Biller Update Pending';
  return 'Fulfillment Failed';
}

export function resolveFulfillmentUserMessage(fulfillmentResult, {
  amount,
  currency = 'USD',
  accountValue,
  providerName,
} = {}) {
  if (!fulfillmentResult) return '';

  if (fulfillmentResult.success === true) {
    const target = accountValue || providerName || 'your account';
    return `Payment of ${formatCurrencyCode(amount, currency)} has been processed for ${target}.`;
  }

  if (isFulfillmentPending(fulfillmentResult)) {
    return 'Your payment was received and the biller is still updating your account. Please do not pay again.';
  }

  return 'We could not complete bill fulfillment at this time. Your payment was received. Please contact support with your transaction ID if the issue persists.';
}

/** Upstream ResultMessage for non-successful fulfilment, so the cause is visible to the customer / support. */
export function resolveFulfillmentBillerMessage(fulfillmentResult) {
  if (!fulfillmentResult || fulfillmentResult.success === true) return null;
  const message = String(fulfillmentResult.resultMessage || '').trim();
  return message || null;
}

/** Status card copy for Payment screen after bank transfer + VAS post. */
export function resolveFulfillmentStatusCard(postPaymentResult, context = {}) {
  if (!postPaymentResult) {
    return {
      title: 'Fulfillment Unavailable',
      message:
        'Your payment was received, but we could not complete bill fulfillment. Please contact support with your transaction ID.',
      tone: 'warning',
    };
  }

  const message = resolveFulfillmentUserMessage(postPaymentResult, context);
  const title = resolveFulfillmentStatusLabel(postPaymentResult);
  const billerMessage = resolveFulfillmentBillerMessage(postPaymentResult);

  if (postPaymentResult.success === true) {
    return {
      title: 'Voucher Ready',
      message,
      tone: 'success',
    };
  }

  return {
    title,
    message,
    billerMessage,
    tone: isFulfillmentPending(postPaymentResult) ? 'warning' : 'error',
  };
}
