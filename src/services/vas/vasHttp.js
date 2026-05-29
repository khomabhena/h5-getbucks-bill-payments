/**
 * HTTP helpers for VAS BFF endpoints.
 */

export async function vasJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text().catch(() => '');
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }
  }

  if (!response.ok) {
    const message =
      data.error ||
      data.ResultMessage ||
      data.Message ||
      data.message ||
      response.statusText ||
      `Request failed (${response.status})`;
    const err = new Error(message);
    err.statusCode = response.status;
    err.responseData = data;
    throw err;
  }

  if (data.Status === 'ERROR' || data.Status === 'NOTFOUND') {
    const err = new Error(data.ResultMessage || data.message || 'VAS request failed');
    err.responseData = data;
    throw err;
  }

  return data;
}
