/**
 * Whether the product catalog requires a ValidatePayment call before PostPayment.
 * Defaults to true when the field is absent (safe fallback for billers like ZESA).
 */
export function productRequiresValidation(product = {}) {
  if (product.ValidationRequired === false) return false;
  if (product.validationRequired === false) return false;
  return true;
}
