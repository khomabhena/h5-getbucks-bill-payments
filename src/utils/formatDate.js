const TIME_ZONE = 'Africa/Harare';
const ISO_DATE =
  /^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T ](\d{2})(?::(\d{2})(?::\d{2}(?:\.\d+)?)?)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i;

const DATE_PARTS = { day: '2-digit', month: 'short', year: 'numeric' };
const TIME_PARTS = { hour: '2-digit', minute: '2-digit', hour12: false };

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const format = (date, withTime, timeZone = TIME_ZONE) =>
  date.toLocaleString('en-GB', {
    ...DATE_PARTS,
    ...(withTime ? TIME_PARTS : {}),
    timeZone,
  });

/** e.g. "06 Oct 2026, 13:55" */
export const formatDateTime = (value) => format(toDate(value), true);

/** e.g. "06 Oct 2026" */
export const formatDate = (value) => format(toDate(value), false);

/**
 * Formats ISO-style dates in biller display values (e.g. a DSTV due/expiry date
 * "2026-10-31T00:00:00" becomes "31 Oct 2026"); other values are returned as-is.
 * Dates without a zone are biller wall-clock dates, so they are not shifted.
 */
export const formatDisplayValue = (value) => {
  const text = String(value ?? '').trim();
  const match = ISO_DATE.exec(text);
  if (!match) return text;

  const [, year, month, day, hour = '00', minute = '00', zone] = match;
  const hasTime = hour !== '00' || minute !== '00';

  if (zone) {
    const date = new Date(text.replace(/\//g, '-'));
    return Number.isNaN(date.getTime()) ? text : format(date, hasTime);
  }

  const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute));
  return Number.isNaN(date.getTime()) ? text : format(date, hasTime, 'UTC');
};
