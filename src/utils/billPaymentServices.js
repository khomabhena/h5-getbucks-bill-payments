/** VAS catalog service IDs that are mobile/airtime (not bill payments). */
export const MOBILE_SERVICE_IDS = new Set([1, 2, 3, 4, 18, 19, 26]);

export function isBillPaymentService(service) {
  const id = Number(service?.Id ?? service?.id);
  if (Number.isFinite(id) && MOBILE_SERVICE_IDS.has(id)) {
    return false;
  }

  const name = String(service?.Name ?? service?.name ?? '');
  return !/\bmobile\b/i.test(name);
}

export function filterBillPaymentServices(services) {
  if (!Array.isArray(services)) return [];
  return services.filter(isBillPaymentService);
}
