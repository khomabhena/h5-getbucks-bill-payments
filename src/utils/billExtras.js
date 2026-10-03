/**
 * DSTV add-ons, charge breakdown, and pay-by-reference helpers
 * (VAS catalog fields from AppleTree / Hot Recharge V2).
 */

export function getProductAddOns(product) {
  return Array.isArray(product?.ProductAddOns) ? product.ProductAddOns : [];
}

export function supportsDstvAddOns(product) {
  return product?.IsDSTVProduct === true && getProductAddOns(product).length > 0;
}

export function supportsPayUsingReferenceNumber(product) {
  return product?.PayUsingReferenceNumberSupported === true;
}

export function resolveValidateAmount(baseAmount, selectedAddon) {
  const base = Number(baseAmount) || 0;
  const addonPrice = selectedAddon ? Number(selectedAddon.Price) || 0 : 0;
  return base + addonPrice;
}

const DEFAULT_VALIDATION_PROBE_AMOUNT = 5;

/**
 * Amount sent with ValidatePayment before the customer has entered one.
 * ZB rejects 0 ("Transaction amount is outside the allowed limits"), so the account is checked
 * with an in-limits placeholder and re-quoted with the real amount on Continue.
 */
export function resolveValidationAmount(product, enteredAmount, selectedAddon = null) {
  const min = Number(product?.MinimumAmount) || 0;
  const max = Number(product?.MaximumAmount) || 0;
  const price = Number(product?.Price) || 0;
  const entered = parseFloat(enteredAmount);
  const withinLimits = (value) => value > 0 && (!min || value >= min) && (!max || value <= max);

  if (Number.isFinite(entered) && withinLimits(entered)) return entered;

  const base = price > 0 ? price : min > 0 ? min : DEFAULT_VALIDATION_PROBE_AMOUNT;
  const capped = max > 0 ? Math.min(base, max) : base;
  return resolveValidateAmount(capped, price > 0 ? selectedAddon : null);
}

export function buildSelectedProductAddOns(selectedAddon) {
  // VAS expects ProductAddOns as string[] of Codes, not objects
  if (!selectedAddon?.Code) return undefined;
  return [String(selectedAddon.Code)];
}

export function getChargeBreakdown(validationData) {
  const calc = validationData?.TotalPayableAmountCalculations;
  if (!calc || typeof calc !== 'object') return null;

  return {
    principalAmount: Number(calc.PrincipalAmount) || 0,
    billerCharge: Number(calc.BillerCharge) || 0,
    taxCharge: Number(calc.TaxCharge) || 0,
    totalCharges: Number(calc.TotalCharges) || 0,
    totalAmount: Number(calc.TotalAmount) || 0,
  };
}

/** Show charge lines when VAS returned calculations and there are charges (or CheckCharges). */
export function shouldDisplayCharges(product, validationData) {
  const breakdown = getChargeBreakdown(validationData);
  if (!breakdown) return false;
  if (product?.CheckCharges === true) return true;
  return (
    breakdown.billerCharge > 0 ||
    breakdown.taxCharge > 0 ||
    breakdown.totalCharges > 0
  );
}

/** Amount to debit from customer (bank / SuperApp) — TotalAmount when present. */
export function resolveDebitAmount(validationData, fallbackAmount) {
  const breakdown = getChargeBreakdown(validationData);
  if (breakdown && breakdown.totalAmount > 0) {
    return breakdown.totalAmount;
  }
  return Number(fallbackAmount) || 0;
}

/** Amount for VAS PostPayment — PrincipalAmount when present. */
export function resolveVasPostAmount(validationData, fallbackAmount) {
  const breakdown = getChargeBreakdown(validationData);
  if (breakdown && Number.isFinite(breakdown.principalAmount)) {
    return breakdown.principalAmount;
  }
  return Number(fallbackAmount) || 0;
}
