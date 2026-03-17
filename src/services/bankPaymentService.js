/**
 * GetBucks Bank Payment Service
 * Direct BankWare integration for Bill Payments
 */

import { getBucksAPI } from './getbucks';

class BankPaymentService {
  constructor() {
    // Merchant/Bill Payments account number (credit account)
    // Default: 00001205 (can be overridden via env var)
    this.merchantAccount = import.meta.env.VITE_GETBUCKS_MERCHANT_ACCOUNT || '00001205';
    
    // Currency for transfers (default to USD, can be overridden)
    this.defaultCurrency = import.meta.env.VITE_GETBUCKS_DEFAULT_CURRENCY || 'USD';
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

  /**
   * Process payment through GetBucks Bank
   * Creates an account transfer from customer to merchant account
   * @param {Object} paymentData - Payment data including amount, currency, etc.
   * @param {string|number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (USD, ZAR, etc.)
   * @param {string} paymentData.accountValue - Bill account number/identifier
   * @param {Object} paymentData.product - Product details
   * @param {Object} paymentData.provider - Provider details
   * @param {string} paymentData.sessionID - Session ID for iBank validation
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

      if (!this.merchantAccount) {
        throw new Error('Merchant account not configured. Please set VITE_GETBUCKS_MERCHANT_ACCOUNT');
      }

      // Get customer account and client number (prefer values from session/context)
      const debitAccount = paymentData.accountNumber || await this.getCustomerAccount();
      const clientNumber = paymentData.clientNumber || await this.getClientNumber();

      // Generate transaction reference
      const reference = this.generateReference();

      // Prepare transfer data
      const amount = parseFloat(paymentData.amount);
      const currency = paymentData.currency || this.defaultCurrency;
      const productName = paymentData.product?.Name || paymentData.product?.name || 'Bill Payment';
      const providerName = paymentData.provider?.Name || paymentData.provider?.name || 'Provider';
      const accountValue = paymentData.accountValue || '';

      // Build narratives for bill payment transactions
      const debitNarrative1 = 'Bill Payment';
      const creditNarrative1 = 'Bill Payment Service';
      
      // Build transfer data
      const transferData = {
        externalReference: reference,
        clientNumber: clientNumber,
        debitAccount: debitAccount,
        debitCurrency: currency,
        debitAmount: amount,
        creditAccount: this.merchantAccount,
        creditCurrency: currency,
        creditAmount: amount,
        debitNarrative1: debitNarrative1,
        creditNarrative1: creditNarrative1,
        valueDate: new Date().toISOString(),
        sessionID: paymentData.sessionID || null
      };
      
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

      // Create account transfer
      const transferResult = await getBucksAPI.createAccountTransfer(transferData);

      // Map GetBucks response to our payment result format
      return {
        success: transferResult.success,
        transactionId: transferResult.externalReference,
        reference: reference,
        bankwareReference: transferResult.bankwareReference,
        status: transferResult.status === 'created' ? 'SUCCESS' : transferResult.status,
        statusCode: transferResult.statusCode,
        message: 'Payment processed successfully',
        timestamp: new Date().toISOString(),
        amount: paymentData.amount,
        currency: currency
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
      } else if (error.message.includes('Merchant account not configured')) {
        errorMessage = 'Payment service is not properly configured. Please contact support.';
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

