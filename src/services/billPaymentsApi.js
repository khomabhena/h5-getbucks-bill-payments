/**
 * Bill payment validate/post via VAS server.
 */

import { vasPaymentUrl } from '../config/api.js';
import { vasJson } from './vas/vasHttp.js';
import {
  mapVasPaymentToUiResult,
  mapVasPaymentErrorToUiResult,
} from './vas/billPaymentPayload.js';

export const validateBillPayment = async (paymentData) => {
  try {
    const data = await vasJson(`${vasPaymentUrl}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    return {
      success: data.Status === 'VALIDATED',
      data,
      message: data.ResultMessage || 'Validation successful',
    };
  } catch (error) {
    console.error('Error validating bill payment:', error);
    return {
      success: false,
      error: error.message,
      message: error.message,
      data: error.responseData,
    };
  }
};

export const postBillPayment = async (paymentData) => {
  const requestId = paymentData?.RequestId;
  try {
    const data = await vasJson(vasPaymentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    console.log('📥 VAS PostPayment response:', data);
    return mapVasPaymentToUiResult(data, requestId);
  } catch (error) {
    console.error('Error posting bill payment:', error);
    throw Object.assign(error, {
      uiResult: mapVasPaymentErrorToUiResult(error, requestId),
    });
  }
};

/** Official ZB PDF; receiptId = PostPayment Receipt Number. */
export async function downloadOfficialReceiptPdf(receiptId) {
  const id = String(receiptId || '').trim();
  if (!id) throw new Error('Receipt Id is required');

  const response = await fetch(`${vasPaymentUrl}/receipt?id=${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/pdf' },
  });

  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.error || data.ResultMessage || message;
    } catch {
      // PDF error bodies may not be JSON
    }
    throw new Error(message);
  }

  return response.blob();
}

export default {
  validateBillPayment,
  postBillPayment,
  downloadOfficialReceiptPdf,
};
