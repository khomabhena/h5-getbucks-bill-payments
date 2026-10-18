const isMobileDevice = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

/**
 * Save a Blob (or text) as a file. Mobile WebViews use the share sheet when possible.
 * @returns {Promise<'shared'|'downloaded'|'cancelled'|'failed'>}
 */
export async function downloadBlobFile(blob, fileName, title = 'Proof of payment') {
  if (isMobileDevice() && typeof File !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title });
        return 'shared';
      }
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}

/**
 * Save the proof of payment as a text file.
 * Mobile in-app WebViews usually ignore <a download>, so phones use the native share sheet when it
 * supports files; everything else gets a regular file download.
 * @returns {Promise<'shared'|'downloaded'|'cancelled'|'failed'>}
 */
export async function downloadReceiptFile(text, fileName) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  return downloadBlobFile(blob, fileName, 'Proof of payment');
}
