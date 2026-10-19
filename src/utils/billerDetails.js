/**
 * Biller-specific details returned by ValidatePayment / PostPayment DisplayData
 * (e.g. client address, policy status, plan name, service provider).
 */

import { formatDisplayValue } from './formatDate.js';

/** Charge / limit rows are shown from TotalPayableAmountCalculations instead. */
const CHARGE_AND_LIMIT_LABELS = new Set([
  'principalamount',
  'billercharge',
  'totalcharges',
  'totalamount',
  'taxcharge',
  'limits',
  'minimumlimit',
  'maximumlimit',
]);

const normalizeLabel = (label) => String(label || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Always keep these validation rows even if the value matches account / account name. */
const PRIORITY_BILLER_LABELS = new Set(['schemecode', 'schemereference']);

/** True only for holder-name rows — not "Scheme Name" or other *Name labels. */
export function isAccountNameLabel(label) {
  const key = normalizeLabel(label);
  return key === 'accountname' || key === 'customername' || key === 'clientname';
}

const DUE_DATE_LABEL = /^(due|expiry|expiration|expires|validuntil|validto|nextdue|renewal)(date)?$/;

/** First due / expiry date row (e.g. DSTV "Due Date") from rows shaped { label, value }. */
export function findDueDateRow(rows = []) {
  return rows.find((row) => DUE_DATE_LABEL.test(normalizeLabel(row?.label))) || null;
}

/**
 * @param {Object} validationData - ValidatePayment response
 * @param {Object} [options]
 * @param {string[]} [options.omitLabels] - Labels already shown elsewhere (e.g. 'Account Number')
 * @param {string[]} [options.omitValues] - Values already shown elsewhere (e.g. the account name)
 */
export function getBillerDetailRows(validationData, { omitLabels = [], omitValues = [] } = {}) {
  const items = Array.isArray(validationData?.DisplayData) ? validationData.DisplayData : [];
  const omittedLabels = new Set(omitLabels.map(normalizeLabel));
  const omittedValues = new Set(
    omitValues.filter(Boolean).map((value) => String(value).trim().toLowerCase())
  );
  const seen = new Set();

  return items
    .map((item) => ({
      label: String(item?.Label ?? '').trim(),
      value: String(item?.Value ?? '').trim(),
    }))
    .filter(({ label, value }) => {
      if (!label || !value) return false;
      const key = normalizeLabel(label);
      if (CHARGE_AND_LIMIT_LABELS.has(key) || omittedLabels.has(key)) return false;
      // Scheme Code / Scheme Reference must stay visible after validation.
      if (!PRIORITY_BILLER_LABELS.has(key) && omittedValues.has(value.toLowerCase())) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row) => ({ ...row, value: formatDisplayValue(row.value) }));
}
