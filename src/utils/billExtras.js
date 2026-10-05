/**
 * DSTV add-ons, charge breakdown, and pay-by-reference helpers
 * (VAS catalog fields from AppleTree / Hot Recharge V2).
 */

import { SERVICE_CHARGE } from '../config/serviceCharge.js';

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

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

/** Our service charge on a bill amount (see config/serviceCharge.js). */
export function getServiceCharge(billAmount, currency = 'USD') {
  const base = Number(billAmount) || 0;
  const { percent, minUsd, maxUsd } = SERVICE_CHARGE;
  if (!(percent > 0) || base <= 0) return 0;

  let charge = (base * percent) / 100;
  if (String(currency || 'USD').toUpperCase() === 'USD') {
    if (minUsd > 0) charge = Math.max(charge, minUsd);
    if (maxUsd > 0) charge = Math.min(charge, maxUsd);
  }
  return roundMoney(charge);
}

/** Service charge for a quote: on the VAS PrincipalAmount when present, else the entered amount. */
export function resolveServiceCharge(validationData, fallbackAmount, currency = 'USD') {
  const breakdown = getChargeBreakdown(validationData);
  const billAmount =
    breakdown && breakdown.principalAmount > 0 ? breakdown.principalAmount : Number(fallbackAmount) || 0;
  return getServiceCharge(billAmount, currency);
}

/** Amount to debit from the customer (bank): VAS TotalAmount (or entered amount) plus our service charge. */
export function resolveDebitAmount(validationData, fallbackAmount, currency = 'USD') {
  const breakdown = getChargeBreakdown(validationData);
  const vasTotal =
    breakdown && breakdown.totalAmount > 0 ? breakdown.totalAmount : Number(fallbackAmount) || 0;
  return roundMoney(vasTotal + resolveServiceCharge(validationData, fallbackAmount, currency));
}

/** Amount for VAS PostPayment — PrincipalAmount when present. */
export function resolveVasPostAmount(validationData, fallbackAmount) {
  const breakdown = getChargeBreakdown(validationData);
  if (breakdown && Number.isFinite(breakdown.principalAmount)) {
    return breakdown.principalAmount;
  }
  return Number(fallbackAmount) || 0;
}
