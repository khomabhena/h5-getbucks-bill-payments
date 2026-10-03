/**
 * Catalog-driven extra CreditPartyIdentifiers (e.g. student details for universities / schools)
 * and payment codes (VAS V2 PaymentCodeRequired + PaymentCodes).
 *
 * ValidatePayment sends only the primary identifier (+ PaymentCode);
 * PostPayment sends every identifier with its own value.
 */

export const PAYMENT_REASON_MAX_LENGTH = 13;

const FIELD_PRESETS = {
  studentname: { maxLength: 60, placeholder: 'e.g. George Mbwando', autoComplete: 'name' },
  semester: {
    type: 'select',
    options: [
      { value: '1', label: 'Semester 1' },
      { value: '2', label: 'Semester 2' },
    ],
  },
  level: { maxLength: 20, placeholder: 'e.g. 2nd Year' },
  studentgrade: { maxLength: 10, placeholder: 'e.g. 7' },
  studentterm: {
    type: 'select',
    options: [
      { value: 'First', label: 'First term' },
      { value: 'Second', label: 'Second term' },
      { value: 'Third', label: 'Third term' },
    ],
  },
  paymentreason: {
    maxLength: PAYMENT_REASON_MAX_LENGTH,
    showCounter: true,
    placeholder: 'e.g. Tuition',
  },
  studentregistrationnumber: { maxLength: 30, placeholder: 'e.g. R123456A' },
};

const STUDENT_NAME_DISPLAY_LABELS = new Set([
  'studentname',
  'name',
  'fullname',
  'customername',
  'accountname',
  'accountholder',
]);

const normalize = (name) => String(name || '').toLowerCase().replace(/[\s_.-]/g, '');

const identifierName = (identifier = {}) =>
  identifier.Name || identifier.IdentifierFieldName || identifier.FieldName || '';

const isNotifyField = (name) => {
  const normalized = normalize(name);
  return normalized.includes('notify') || normalized === 'notificationnumber';
};

/** Primary identifier = first required catalog identifier (falls back to the first one). */
export function getPrimaryIdentifierName(product) {
  const identifiers = product?.CreditPartyIdentifiers || [];
  if (!identifiers.length) return 'AccountNumber';
  const primary = identifiers.find((identifier) => identifier.Required !== false) || identifiers[0];
  return identifierName(primary) || 'AccountNumber';
}

/** Catalog identifiers the user must type in besides the primary account field and notify number. */
export function getExtraIdentifierFields(product) {
  const identifiers = product?.CreditPartyIdentifiers || [];
  const primary = normalize(getPrimaryIdentifierName(product));

  return identifiers
    .map((identifier) => {
      const name = identifierName(identifier);
      if (!name || normalize(name) === primary || isNotifyField(name)) return null;

      const preset = FIELD_PRESETS[normalize(name)] || {};
      return {
        name,
        label: identifier.Title?.trim() || name,
        required: identifier.Required !== false,
        type: preset.type || 'text',
        options: preset.options || null,
        maxLength: preset.maxLength || null,
        showCounter: Boolean(preset.showCounter),
        placeholder: preset.placeholder || '',
        autoComplete: preset.autoComplete || 'off',
        regex: identifier.RegexExpression || null,
      };
    })
    .filter(Boolean);
}

export function getExtraIdentifierNames(product) {
  return new Set(getExtraIdentifierFields(product).map((field) => field.name));
}

export function getPaymentCodeConfig(product) {
  const codes = Array.isArray(product?.PaymentCodes)
    ? product.PaymentCodes.filter((code) => code && code.Code != null && code.Code !== '')
    : [];

  if (product?.PaymentCodeRequired !== true && codes.length === 0) return null;

  return {
    required: product?.PaymentCodeRequired === true,
    options: codes.map((code) => ({
      value: String(code.Code),
      label: code.Name || String(code.Code),
    })),
  };
}

export function getPaymentCodeLabel(product, paymentCode) {
  if (!paymentCode) return null;
  const option = getPaymentCodeConfig(product)?.options.find(
    (item) => item.value === String(paymentCode)
  );
  return option ? option.label : String(paymentCode);
}

/** Map of fieldName → error message for missing / too long / regex-invalid values. */
export function getExtraFieldErrors(fields, values = {}) {
  const errors = {};

  for (const field of fields) {
    const value = String(values[field.name] ?? '').trim();

    if (!value) {
      if (field.required) errors[field.name] = `${field.label} is required`;
      continue;
    }

    if (field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `${field.label} must be ${field.maxLength} characters or fewer`;
      continue;
    }

    if (field.regex) {
      try {
        if (!new RegExp(field.regex).test(value)) {
          errors[field.name] = `Enter a valid ${field.label.toLowerCase()}`;
        }
      } catch {
        // Ignore invalid catalog regex
      }
    }
  }

  return errors;
}

/** Trimmed, non-empty extra values keyed by catalog field name. */
export function cleanExtraValues(fields, values = {}) {
  const cleaned = {};
  for (const field of fields) {
    const value = String(values[field.name] ?? '').trim();
    if (value) cleaned[field.name] = value;
  }
  return cleaned;
}

/** Suggest a Student Name from the ValidatePayment DisplayData when the biller returns one. */
export function getStudentNameFromValidation(validationData) {
  const items = validationData?.DisplayData || [];
  const match = items.find(
    (item) => item?.Value && STUDENT_NAME_DISPLAY_LABELS.has(normalize(item.Label))
  );
  return match ? String(match.Value).trim() : '';
}

/** Label / value rows for order summary, confirmation and receipt. */
export function describeBillIdentifierExtras(product, { extraValues = {}, paymentCode = null } = {}) {
  const rows = [];

  const paymentCodeLabel = getPaymentCodeLabel(product, paymentCode);
  if (paymentCodeLabel) rows.push({ label: 'Payment type', value: paymentCodeLabel });

  for (const field of getExtraIdentifierFields(product)) {
    const value = String(extraValues?.[field.name] ?? '').trim();
    if (!value) continue;
    const option = field.options?.find((item) => item.value === value);
    rows.push({ label: field.label, value: option ? option.label : value });
  }

  return rows;
}
