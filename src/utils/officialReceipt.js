/**
 * ZB VAS official PDF proof of payment helpers.
 * Sp3ndl (South Africa) does not expose DownloadReceipt — only ZB when ReceiptPDFAvailable.
 *
 * DownloadReceipt?Id= must be the PostPayment RequestId (GUID). Receipt Number / ReferenceNumber
 * are display fields only — VAS rejects them ("The value '…' is not valid").
 */

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** DownloadReceipt Id = PostPayment RequestId (GUID). */
export function resolveOfficialReceiptId(postPaymentResult) {
  if (!postPaymentResult) return null;

  const candidates = [
    postPaymentResult.requestId,
    postPaymentResult.receiptId,
    postPaymentResult.raw?.RequestId,
    postPaymentResult.data?.RequestId,
  ];

  for (const value of candidates) {
    const id = String(value || '').trim();
    if (GUID_PATTERN.test(id)) return id;
  }

  return null;
}

export function isOfficialReceiptPdfAvailable(postPaymentResult) {
  if (!postPaymentResult) return false;
  const flag =
    postPaymentResult.receiptPDFAvailable ??
    postPaymentResult.raw?.ReceiptPDFAvailable ??
    postPaymentResult.data?.ReceiptPDFAvailable;
  return flag === true && Boolean(resolveOfficialReceiptId(postPaymentResult));
}
