/**
 * Our service charge, added on top of the bill amount and any VAS biller charges.
 * The biller (VAS PostPayment) still receives only the bill amount.
 *
 * VITE_SERVICE_CHARGE_PERCENT  e.g. 1 (set 0 to switch the charge off)
 * VITE_SERVICE_CHARGE_MIN      minimum charge in USD, e.g. 0.10
 * VITE_SERVICE_CHARGE_MAX      maximum charge in USD, e.g. 5.00 (0 = no maximum)
 *
 * Min / max apply to USD only; other currencies pay the percentage alone.
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

const readNumber = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const SERVICE_CHARGE = {
  percent: readNumber(env.VITE_SERVICE_CHARGE_PERCENT, 1),
  minUsd: readNumber(env.VITE_SERVICE_CHARGE_MIN, 0.1),
  maxUsd: readNumber(env.VITE_SERVICE_CHARGE_MAX, 5),
};
