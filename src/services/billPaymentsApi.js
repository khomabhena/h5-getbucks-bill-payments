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

export default {
  validateBillPayment,
  postBillPayment,
};
