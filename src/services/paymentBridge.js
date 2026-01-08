/**
 * Payment Bridge Service
 * Unified interface for payment processing across different modes:
 * - Native SuperApp (window.payment)
 * - Iframe (postMessage)
 * - Standalone (mock)
 */

import { getMode } from '../utils/modeDetection';
import { iframeBridge } from '../utils/iframeBridge';

/**
 * Process payment using the appropriate bridge based on mode
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment result
 */
export const processPayment = async (paymentData) => {
  const mode = getMode();
  console.log('Processing payment in mode:', mode);

  switch (mode) {
    case 'native':
      return processNativePayment(paymentData);
    
    case 'iframe':
      return processIframePayment(paymentData);
    
    case 'standalone':
    default:
      return processMockPayment(paymentData);
  }
};

/**
 * Process payment using native SuperApp bridge
 */
const processNativePayment = async (paymentData) => {
  if (!window.payment || typeof window.payment.pay !== 'function') {
    throw new Error('Native payment bridge not available');
  }

  try {
    const result = await window.payment.pay({
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: `Bill Payment: ${paymentData.provider?.Name || 'Bill'}`,
      metadata: {
        accountValue: paymentData.accountValue,
        productId: paymentData.product?.Id,
        providerId: paymentData.provider?.Id
      }
    });

    return {
      success: result.status === 'SUCCESS' || result.status === 'COMPLETED',
      transactionId: result.transactionId || result.id,
      status: result.status || 'SUCCESS',
      message: result.message || 'Payment processed successfully',
      timestamp: new Date().toISOString(),
      amount: paymentData.amount,
      currency: paymentData.currency
    };
  } catch (error) {
    console.error('Native payment error:', error);
    throw error;
  }
};

/**
 * Process payment using iframe postMessage bridge
 */
const processIframePayment = async (paymentData) => {
  try {
    const result = await iframeBridge.requestPayment({
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: `Bill Payment: ${paymentData.provider?.Name || 'Bill'}`,
      accountValue: paymentData.accountValue,
      product: paymentData.product,
      provider: paymentData.provider,
      country: paymentData.country,
      service: paymentData.service
    });

    return {
      success: result.success !== false,
      transactionId: result.transactionId || result.id,
      status: result.status || 'SUCCESS',
      message: result.message || 'Payment processed successfully',
      timestamp: result.timestamp || new Date().toISOString(),
      amount: paymentData.amount,
      currency: paymentData.currency,
      raw: result
    };
  } catch (error) {
    console.error('Iframe payment error:', error);
    throw error;
  }
};

/**
 * Process payment using mock (for standalone/development)
 */
const processMockPayment = async (paymentData) => {
  // Import mock service
  const { processGetBucksPayment } = await import('./bankPaymentService');
  return processGetBucksPayment(paymentData);
};

/**
 * Get user information based on mode
 */
export const getUserInfo = async () => {
  const mode = getMode();

  switch (mode) {
    case 'native':
      if (window.payment && typeof window.payment.getUserInfo === 'function') {
        return await window.payment.getUserInfo();
      }
      return null;
    
    case 'iframe':
      return await iframeBridge.getUserInfo();
    
    case 'standalone':
    default:
      // Return mock user info for development
      return {
        CustomerId: '1',
        Fullname: 'Test User',
        MobileNumber: '+263777077921',
        EmailAddress: 'test@example.com'
      };
  }
};

export default {
  processPayment,
  getUserInfo
};

