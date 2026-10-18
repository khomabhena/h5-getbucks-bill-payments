/**
 * ZB VAS official PDF proof of payment helpers.
 * Sp3ndl (South Africa) does not expose DownloadReceipt — only ZB when ReceiptPDFAvailable.
 */

/** Receipt Number from PostPayment DisplayData (same value used as DownloadReceipt Id). */
export function resolveOfficialReceiptId(postPaymentResult) {
  if (!postPaymentResult) return null;

  const displayData =
    postPaymentResult.displayData ||
    postPaymentResult.raw?.DisplayData ||
    postPaymentResult.data?.DisplayData ||
    [];

  const fromDisplay = (Array.isArray(displayData) ? displayData : []).find((item) =>
    /receipt\s*number/i.test(String(item?.Label || ''))
  )?.Value;
  if (fromDisplay != null && String(fromDisplay).trim()) {
    return String(fromDisplay).trim();
  }

  const receiptJSON =
    postPaymentResult.receiptJSON ||
    postPaymentResult.raw?.ReceiptJSON ||
    postPaymentResult.data?.ReceiptJSON;
  if (receiptJSON?.popReference) return String(receiptJSON.popReference).trim();
  if (receiptJSON?.orderReference) return String(receiptJSON.orderReference).trim();

  if (postPaymentResult.referenceNumber) {
    return String(postPaymentResult.referenceNumber).trim();
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
