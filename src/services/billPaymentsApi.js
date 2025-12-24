/**
 * Bill Payments API helpers for AppleTree Gateway
 * Provides direct wrappers for payment validation and posting endpoints.
 */

import AppleTreeGateway from './appletree/AppleTreeGateway';

// Create a dedicated gateway instance for bill payment calls
const gateway = new AppleTreeGateway();

/**
 * Validate a bill payment payload with AppleTree Gateway.
 *
 * @param {object} paymentData - The payload to validate
 * @returns {Promise<object>} Gateway response
 */
export const validateBillPayment = async (paymentData) => {
  try {
    return await gateway.validatePayment(paymentData);
  } catch (error) {
    console.error('Error validating bill payment:', error);
    throw error;
  }
};

/**
 * Post a bill payment payload to AppleTree Gateway for fulfillment.
 *
 * @param {object} paymentData - The payload to submit
 * @returns {Promise<object>} Gateway response
 */
export const postBillPayment = async (paymentData) => {
  try {
    return await gateway.postPayment(paymentData);
  } catch (error) {
    console.error('Error posting bill payment:', error);
    throw error;
  }
};

export default {
  validateBillPayment,
  postBillPayment
};

