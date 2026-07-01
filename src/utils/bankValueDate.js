/**
 * BankWare value date: align with bank business calendar / EOD, not raw client UTC.
 * Users can override the calendar day when cut-over differs from "now".
 */

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * @param {number} offsetHours - May be fractional (e.g. 5.5)
 */
export function formatUtcOffsetFromHours(offsetHours) {
  const totalMinutes = Math.round(Number(offsetHours) * 60);
  const sign = totalMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(totalMinutes);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${pad2(hh)}:${pad2(mm)}`;
}

/**
 * @param {Date} date
 * @param {string} timeZone - IANA, e.g. 'Africa/Harare'
 */
export function formatCalendarDateInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  if (y && m && d) {
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

/**
 * Today's calendar date (YYYY-MM-DD) in the bank business timezone.
 */
export function getBankCalendarDateToday() {
  const timeZone = import.meta.env.VITE_BANK_VALUE_DATE_TZ || 'Africa/Harare';
  return formatCalendarDateInTimeZone(new Date(), timeZone);
}

/**
 * Default transfer value date: start of bank business day with configured UTC offset.
 */
export function getBankValueDateIso() {
  const timeZone = import.meta.env.VITE_BANK_VALUE_DATE_TZ || 'Africa/Harare';
  const offsetHours = Number(
    import.meta.env.VITE_BANK_VALUE_DATE_UTC_OFFSET_HOURS ?? 2
  );
  const ymd = formatCalendarDateInTimeZone(new Date(), timeZone);
  const offset = formatUtcOffsetFromHours(offsetHours);
  return `${ymd}T00:00:00${offset}`;
}

/**
 * Build value date ISO from a user-chosen calendar day (input type="date").
 * @param {string} ymd - YYYY-MM-DD
 */
export function formatBankValueDateFromCalendarDate(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) {
    throw new Error('Value date must be YYYY-MM-DD');
  }
  const offsetHours = Number(
    import.meta.env.VITE_BANK_VALUE_DATE_UTC_OFFSET_HOURS ?? 2
  );
  const offset = formatUtcOffsetFromHours(offsetHours);
  return `${ymd.trim()}T00:00:00${offset}`;
}

/**
 * Resolve the ISO string sent on account transfers.
 * Optional full ISO override → calendar override from UI → automatic bank "today".
 *
 * @param {object} paymentData
 * @param {string} [paymentData.valueDateIso] - Full ISO string when caller sends exact instant
 * @param {string} [paymentData.valueDateCalendar] - YYYY-MM-DD from date input
 */
export function resolveTransferValueDate(paymentData = {}) {
  if (
    paymentData.valueDateIso &&
    typeof paymentData.valueDateIso === 'string' &&
    paymentData.valueDateIso.trim().length > 0
  ) {
    return paymentData.valueDateIso.trim();
  }
  const cal = paymentData.valueDateCalendar;
  if (
    cal &&
    typeof cal === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(cal.trim())
  ) {
    try {
      return formatBankValueDateFromCalendarDate(cal.trim());
    } catch {
      return getBankValueDateIso();
    }
  }
  return getBankValueDateIso();
}
