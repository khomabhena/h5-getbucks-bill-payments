/**
 * Bill payment: BankWare transfer (VAS proxy) then VAS PostPayment fulfillment.
 */

import { getBucksAPI } from './getbucks';
import { resolveTransferValueDate } from '../utils/bankValueDate.js';
import {
  buildPostPaymentPayload,
  buildValidatePaymentPayload,
  mapVasPaymentErrorToUiResult,
  prepareFulfillmentValidation,
  resolveCustomerDetailsForVas,
} from './vas/billPaymentPayload.js';
import { productRequiresValidation } from '../utils/productValidation.js';

class BankPaymentService {
  constructor() {
    this.merchantAccountCache = new Map();
    this.envMerchantFallback = import.meta.env.VITE_GETBUCKS_MERCHANT_ACCOUNT || '';

    // Currency for transfers (default to USD, can be overridden)
    this.defaultCurrency = import.meta.env.VITE_GETBUCKS_DEFAULT_CURRENCY || 'USD';
  }

  async resolveMerchantAccount(currency = 'USD') {
    const key = String(currency || this.defaultCurrency).trim().toUpperCase();

    if (this.merchantAccountCache.has(key)) {
      return this.merchantAccountCache.get(key);
    }

    try {
      const { fetchMerchantAccount } = await import('./paymentConfigService.js');
      const result = await fetchMerchantAccount({
        app: 'bill-payments',
        currency: key,
      });

      if (result?.merchantAccount) {
        this.merchantAccountCache.set(key, result.merchantAccount);
        return result.merchantAccount;
      }
    } catch (error) {
      console.warn('Merchant account config fetch failed, using env fallback:', error);
    }

    const fallback = this.envMerchantFallback;
    if (!fallback) {
      throw new Error(
        'Merchant account is not configured on the server. Set BANKWARE_MERCHANT_ACCOUNT_BILL_PAYMENTS on the VAS server.'
      );
    }

    console.warn(`⚠️ Using VITE_GETBUCKS_MERCHANT_ACCOUNT fallback for ${key}`);
    this.merchantAccountCache.set(key, fallback);
    return fallback;
  }

  /**
   * Get customer account number from session context
   * @returns {Promise<string>} Customer account number
   */
  async getCustomerAccount() {
    // Account number should come from session context (URL params)
    // This is a fallback for standalone mode
    const customerAccount = import.meta.env.VITE_SAMPLE_CUSTOMER_ACCOUNT;
    if (customerAccount) {
      console.warn('⚠️ Using customer account from environment variable');
      return customerAccount;
    }

    const testAccount = import.meta.env.VITE_GETBUCKS_TEST_ACCOUNT;
    if (testAccount) {
      console.warn('⚠️ Using test account from environment variable');
      return testAccount;
    }

    // Default fallback
    console.warn('⚠️ Using default customer account: 00001203');
    return '00001203';
  }

  /**
   * Get customer/client number from session context
   * @returns {Promise<string>} Client number
   */
  async getClientNumber() {
    // Client number should come from session context (URL params)
    // This is a fallback for standalone mode
    const sampleClientNumber = import.meta.env.VITE_SAMPLE_CLIENT_NUMBER;
    if (sampleClientNumber) {
      return sampleClientNumber;
    }

    // Fallback to customer account if they're the same
    return await this.getCustomerAccount();
  }

  /**
   * Generate transaction reference
   */
  generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BP-${timestamp}-${random}`;
  }

  async resolveCustomerDetails(paymentData) {
    if (paymentData.validationData?.CustomerDetails) {
      return resolveCustomerDetailsForVas(paymentData.validationData.CustomerDetails);
    }
    if (paymentData.customerDetails) {
      return resolveCustomerDetailsForVas(paymentData.customerDetails);
    }

    try {
      const { getUserInfo } = await import('./paymentBridge');
      const userInfo = await getUserInfo();
      if (userInfo) {
        return resolveCustomerDetailsForVas(userInfo);
      }
    } catch (error) {
      console.warn('Could not get user info from bridge:', error);
    }

    return resolveCustomerDetailsForVas();
  }

  async ensureBillValidated(paymentData) {
    const { product } = paymentData;

    if (!productRequiresValidation(product)) {
      const prepared = prepareFulfillmentValidation(paymentData.validationData, product);
      return prepared.validationData;
    }

    const { validateBillPayment } = await import('./billPaymentsApi.js');
    const customerDetails = await this.resolveCustomerDetails(paymentData);
    const currency = paymentData.currency || this.defaultCurrency;

    const payload = buildValidatePaymentPayload({
      product,
      amount: paymentData.amount,
      currency,
      accountValue: paymentData.accountValue,
      notifyNumber: paymentData.notifyNumber,
      customerDetails,
      primaryFieldName: paymentData.primaryFieldName,
    });

    const result = await validateBillPayment(payload);
    if (!result.success || result.data?.Status !== 'VALIDATED') {
      throw new Error(
        result.data?.ResultMessage ||
          result.message ||
          'Bill account could not be validated. Please check your details.'
      );
    }

    return result.data;
  }

  async postBillPaymentToVas(paymentData, bankReference) {
    const { product } = paymentData;
    const prepared = prepareFulfillmentValidation(paymentData.validationData, product);

    if (!prepared.ok) {
      if (prepared.skipResult) {
        console.error('⚠️ Validation response missing RequestId; cannot post payment.');
        return prepared.skipResult;
      }

      console.warn('ℹ️ Validation not successful or missing; skipping VAS PostPayment.', {
        validationStatus: paymentData.validationData?.Status,
      });
      return null;
    }

    const fulfillmentValidation = prepared.validationData;
    const { postBillPayment } = await import('./billPaymentsApi.js');
    const customerDetails = await this.resolveCustomerDetails({
      ...paymentData,
      validationData: fulfillmentValidation,
    });

    const payload = buildPostPaymentPayload({
      product,
      amount: paymentData.amount,
      currency: paymentData.currency || this.defaultCurrency,
      accountValue: paymentData.accountValue,
      notifyNumber: paymentData.notifyNumber,
      customerDetails,
      validationData: fulfillmentValidation,
      bankReference,
      primaryFieldName: paymentData.primaryFieldName,
    });

    console.log('📤 VAS PostPayment (bill):', payload);

    try {
      return await postBillPayment(payload);
    } catch (error) {
      if (error.uiResult) {
        return error.uiResult;
      }
      return mapVasPaymentErrorToUiResult(error, payload.RequestId);
    }
  }

  /**
   * Process payment through GetBucks Bank
   * Creates an account transfer from customer to merchant account
   * @param {Object} paymentData - Payment data including amount, currency, etc.
   * @param {string|number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (USD, ZAR, etc.)
   * @param {string} paymentData.accountValue - Bill account number/identifier
   * @param {Object} paymentData.product - Product details
   * @param {Object} paymentData.provider - Provider details
   * @param {string} paymentData.accountNumber - Customer account number
   * @param {string} paymentData.clientNumber - Client number
   * @returns {Promise<Object>} Payment result with transactionId, status, etc.
   */
  async processGetBucksPayment(paymentData) {
    try {
      // Validate required data
      if (!paymentData.amount) {
        throw new Error('Amount is required');
      }

      if (!paymentData.product || !paymentData.accountValue) {
        throw new Error('Product and account details are required');
      }

      let validationData = paymentData.validationData;
      if (productRequiresValidation(paymentData.product)) {
        if (!validationData || validationData.Status !== 'VALIDATED') {
          validationData = await this.ensureBillValidated(paymentData);
        }
      } else {
        validationData = await this.ensureBillValidated(paymentData);
      }

      // Get customer account and client number (prefer values from session/context)
      const debitAccount = paymentData.accountNumber || await this.getCustomerAccount();
      const clientNumber = paymentData.clientNumber || await this.getClientNumber();

      // Generate transaction reference
      const reference = this.generateReference();

      // Prepare transfer data — bank debit uses account currency; VAS uses product currency.
      const amount = parseFloat(paymentData.amount);
      const vasCurrency = (paymentData.currency || this.defaultCurrency).toString().toUpperCase();
      const bankCurrency = (
        paymentData.bankCurrency ||
        paymentData.accountCurrency ||
        vasCurrency
      )
        .toString()
        .toUpperCase();
      const productName = paymentData.product?.Name || paymentData.product?.name || 'Bill Payment';
      const providerName = paymentData.provider?.Name || paymentData.provider?.name || 'Provider';
      const accountValue = paymentData.accountValue || '';

      const merchantAccount = await this.resolveMerchantAccount(bankCurrency);

      // Build narratives for bill payment transactions
      const debitNarrative1 = 'Bill Payment';
      const creditNarrative1 = 'Bill Payment Service';
      
      // Build transfer data
      const transferData = {
        externalReference: reference,
        clientNumber: clientNumber,
        debitAccount: debitAccount,
        debitCurrency: bankCurrency,
        debitAmount: amount,
        creditAccount: merchantAccount,
        creditCurrency: bankCurrency,
        creditAmount: amount,
        debitNarrative1: debitNarrative1,
        creditNarrative1: creditNarrative1,
        valueDate: resolveTransferValueDate(paymentData),
      };

      console.log('🏦 Bank transfer payload:', {
        ...transferData,
        vasCurrency,
        bankCurrency,
        merchantAccount,
      });
      
      // Add provider name to debit narrative 2 if available
      if (providerName) {
        transferData.debitNarrative2 = providerName;
      }
      
      // Add product name to debit narrative 3 if available
      if (productName) {
        transferData.debitNarrative3 = productName;
      }

      // Add account value to debit narrative 4 if available
      if (accountValue) {
        transferData.debitNarrative4 = accountValue;
      }

      const transferResult = await getBucksAPI.createAccountTransfer(transferData);

      if (!transferResult.success) {
        throw new Error(transferResult.message || 'Bank transfer failed');
      }

      const bankRef =
        transferResult.externalReference || reference || transferResult.bankwareReference;

      let postPaymentResult = null;
      try {
        postPaymentResult = await this.postBillPaymentToVas(
          { ...paymentData, validationData },
          bankRef
        );
      } catch (vasError) {
        console.warn('⚠️ VAS PostPayment failed after bank transfer:', vasError);
        postPaymentResult = mapVasPaymentErrorToUiResult(vasError, null);
      }

      const bankOk =
        transferResult.statusCode === 201 ||
        transferResult.statusCode === 202 ||
        transferResult.success;

      return {
        success: bankOk,
        transactionId: transferResult.externalReference || reference,
        reference,
        bankwareReference: transferResult.bankwareReference,
        status: transferResult.status === 'created' ? 'SUCCESS' : transferResult.status,
        statusCode: transferResult.statusCode,
        message: postPaymentResult?.success
          ? 'Payment and bill fulfillment completed'
          : 'Bank payment recorded; bill fulfillment pending or failed',
        timestamp: new Date().toISOString(),
        amount: paymentData.amount,
        currency: vasCurrency,
        validationData,
        postPaymentResult,
      };
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors,
        rawResponse: error.rawResponse
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error.message.includes('account number not available')) {
        errorMessage = 'Unable to access your account. Please ensure you are logged in.';
      } else if (
        error.message.includes('Merchant account') ||
        error.message.includes('settlement account')
      ) {
        errorMessage =
          error.message.includes('contact support')
            ? error.message
            : 'Bill payment settlement account is not configured. Please contact support.';
      } else if (
        error.message.includes('SessionID invalid') ||
        error.message.includes('sessionID') ||
        error.message.includes('Bank session validation failed')
      ) {
        errorMessage =
          'Your banking session could not be validated for this account. Close this page and open bill payments again from your bank app.';
      } else if (
        error.message.includes('Insufficient Funds') ||
        error.message.includes('Insufficient funds')
      ) {
        errorMessage = 'Insufficient funds in your account for this payment.';
      } else if (error.message.includes('Invalid Currency')) {
        errorMessage =
          'This payment currency does not match your account. Try a product in your account currency or contact support.';
      } else if (error.message.includes('Credit Narrative invalid') || error.message.includes('credit narrative')) {
        errorMessage = 'Payment configuration error. Please contact support.';
        console.error('❌ Credit Narrative Error - Check narrative format and length');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get payment status from GetBucks Bank
   * Gets account transfer status by external reference
   * @param {string} transactionId - Transaction ID (external reference) to check
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(transactionId) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      // Get transfer by external reference
      const transferData = await getBucksAPI.getAccountTransferByExternalReference(transactionId);

      // Check if transfer data is empty (transfer might not exist yet)
      if (!transferData || Object.keys(transferData).length === 0) {
        return {
          success: false,
          transactionId,
          status: 'not_found',
          message: 'Transaction not found or still processing',
          timestamp: new Date().toISOString()
        };
      }

      // Map GetBucks transfer status to our status format
      const status = this.mapTransferStatus(transferData);

      return {
        success: true,
        transactionId,
        status: status === 'completed' ? 'SUCCESS' : status,
        transferData: transferData,
        timestamp: transferData.approvedAt || 
                   transferData.approvedOn || 
                   transferData.enteredAt || 
                   transferData.enteredOn || 
                   transferData.valueDate || 
                   new Date().toISOString(),
        bankwareReference: transferData.bankwareReference
      };
    } catch (error) {
      console.error('❌ Status check failed:', error);
      
      // Handle 404 (transfer not found) gracefully
      if (error.message.includes('not found') || error.message.includes('404')) {
        return {
          success: false,
          transactionId,
          status: 'not_found',
          message: 'Transaction not found',
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error(error.message || 'Failed to check payment status.');
    }
  }

  /**
   * Map GetBucks transfer status to our status format
   * @param {Object} transferData - Transfer data from API
   * @returns {string} Status
   */
  mapTransferStatus(transferData) {
    // Check transactionStatus field
    // 0 = Completed/Settled
    if (transferData.transactionStatus !== undefined) {
      if (transferData.transactionStatus === 0) {
        return 'completed';
      }
      return 'processing';
    }

    // Check verified field (1 = verified)
    if (transferData.verified === 1) {
      return 'completed';
    }

    // Check accountingEntriesStatus (0 = posted)
    if (transferData.accountingEntriesStatus === 0) {
      return 'completed';
    }

    // Fallback: if we can retrieve the transfer, assume it exists
    return 'processing';
  }
}

// Export singleton instance
export const bankPaymentService = new BankPaymentService();

// Export individual functions for backward compatibility
export const processGetBucksPayment = (paymentData) => 
  bankPaymentService.processGetBucksPayment(paymentData);

export const getPaymentStatus = (transactionId) => 
  bankPaymentService.getPaymentStatus(transactionId);

export default bankPaymentService;

