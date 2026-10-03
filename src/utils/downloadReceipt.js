const isMobileDevice = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

/**
 * Save the proof of payment as a text file.
 * Mobile in-app WebViews usually ignore <a download>, so phones use the native share sheet when it
 * supports files; everything else gets a regular file download.
 * @returns {Promise<'shared'|'downloaded'|'cancelled'|'failed'>}
 */
export async function downloadReceiptFile(text, fileName) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  if (isMobileDevice() && typeof File !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: 'text/plain' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Proof of payment' });
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
