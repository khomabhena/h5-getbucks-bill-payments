const formatCurrencyCode = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${currencyCode} ${Math.round(amountValue)}`;
};

export function resolveFulfillmentStatusLabel(fulfillmentResult) {
  if (!fulfillmentResult) return '';
  if (fulfillmentResult.success === true) return 'Payment Fulfilled';
  if (fulfillmentResult.isFailedRepeatable === true) return 'Fulfillment Pending';
  return 'Fulfillment Failed';
}

/** User-facing fulfillment copy. Raw upstream ResultMessage is intentionally not shown. */
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

  if (fulfillmentResult.isFailedRepeatable === true) {
    return 'The biller is still processing this transaction. Please try again shortly.';
  }

  return 'We could not complete bill fulfillment at this time. Your payment was received. Please contact support with your transaction ID if the issue persists.';
}

/**
 * Status card copy for Payment screen after bank transfer + VAS post.
 * Mirrors Tapseed Payment.jsx — never surfaces raw upstream ResultMessage.
 */
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

  if (postPaymentResult.success === true) {
    return {
      title: 'Voucher Ready',
      message,
      tone: 'success',
    };
  }

  if (postPaymentResult.isFailedRepeatable === true) {
    return {
      title,
      message,
      tone: 'warning',
    };
  }

  if (postPaymentResult.status) {
    return {
      title,
      message,
      tone: 'error',
    };
  }

  return {
    title: 'Fulfillment Failed',
    message,
    tone: 'error',
  };
}
