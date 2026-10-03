/**
 * Biller-specific details returned by ValidatePayment / PostPayment DisplayData
 * (e.g. client address, policy status, plan name, service provider).
 */

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
      if (omittedValues.has(value.toLowerCase())) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
