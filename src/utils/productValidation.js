/**
 * Whether the product catalog requires a ValidatePayment call before PostPayment.
 * Defaults to true when the field is absent (safe fallback for billers like ZESA).
 */
export function productRequiresValidation(product = {}) {
  if (product.ValidationRequired === false) return false;
  if (product.validationRequired === false) return false;
  return true;
}

/**
 * Clean up a VAS ValidatePayment ResultMessage for display.
 * Billers often prefix the message with the account number (e.g. "4555… Kindly use…").
 */
export function formatValidationMessage(message, accountValue = '') {
  let text = String(message || '').trim();
  if (!text) return 'We could not verify these details. Please check and try again.';

  const account = String(accountValue || '').trim();
  if (account && text.startsWith(account)) {
    text = text.slice(account.length).replace(/^[\s:,\-–]+/, '');
  }

  if (!text) return 'We could not verify these details. Please check and try again.';

  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}
