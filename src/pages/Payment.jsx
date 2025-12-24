import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card } from '../components';
import { processPayment } from '../services/paymentBridge';
import { ROUTES } from '../data/constants';
import { colors } from '../data/colors';

// Local currency formatter (code + rounded amount)
const formatCurrencyDisplay = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const roundedAmount = Math.round(amountValue);
  return `${currencyCode} ${roundedAmount}`;
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service, provider, product, accountValue, amount, validationData } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [statusCard, setStatusCard] = useState(null);

  // Redirect if no required data
  useEffect(() => {
    if (!product || !country || !service || !provider || !accountValue || !amount) {
      navigate(ROUTES.ACCOUNT, { replace: true });
    }
  }, [product, country, service, provider, accountValue, amount, navigate]);

  // Get account name from validation data
  const getAccountName = () => {
    if (validationData?.DisplayData) {
      const accountNameItem = validationData.DisplayData.find(item => 
        item.Label?.toLowerCase().includes('account name') || 
        item.Label?.toLowerCase().includes('name')
      );
      return accountNameItem?.Value || accountValue;
    }
    return accountValue;
  };


  const handlePayment = async () => {
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setStatusCard({
      title: 'Processing Payment',
      message: 'Completing payment through Getbucks Bank…',
      tone: 'info'
    });
    
    try {
      // Process payment using appropriate bridge (native/iframe/mock)
      const paymentData = {
        amount,
        currency: product?.Currency || product?.currency || 'USD',
        accountValue,
        product,
        provider,
        country,
        service
      };

      const paymentResult = await processPayment(paymentData);

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment failed');
      }

      // Payment successful
      setStatusCard({
        title: 'Payment Complete',
        message: 'Your payment has been processed successfully.',
        tone: 'success'
      });

      // Notify parent if in iframe mode
      const { getMode } = await import('../utils/modeDetection');
      const { iframeBridge } = await import('../utils/iframeBridge');
      if (getMode() === 'iframe') {
        await iframeBridge.notifyPaymentComplete({
          transactionId: paymentResult.transactionId,
          amount: paymentResult.amount,
          currency: paymentResult.currency,
          status: paymentResult.status
        });
      }

      // Navigate to confirmation with payment result
      navigate(ROUTES.CONFIRMATION, {
        state: {
          // Payment result
          getbucksPayment: paymentResult,
          transactionId: paymentResult.transactionId,
          paymentStatus: paymentResult.status,
          timestamp: paymentResult.timestamp,
          
          // Original payment data
          country,
          service,
          provider,
          product,
          accountValue,
          amount,
          validationData
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
        
        if (error.message.includes('timeout')) {
          errorMessage = 'Payment request timed out. Please try again.';
          setStatusCard({
            title: 'Payment Timeout',
            message: 'The payment took too long. Please try again.',
            tone: 'error'
          });
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
          setStatusCard({
            title: 'Network Error',
            message: 'Unable to connect. Please check your internet connection.',
            tone: 'error'
          });
        } else {
          setStatusCard({
            title: 'Payment Failed',
            message: errorMessage,
            tone: 'error'
          });
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!product || !country || !service || !provider || !accountValue || !amount) {
    return null;
  }

  const currency = product?.Currency || product?.currency || 'USD';
  const accountName = getAccountName();

  const getStatusCardStyle = () => {
    if (!statusCard) return {};
    switch (statusCard.tone) {
      case 'success':
        return {
          backgroundColor: colors.state.successLight,
          color: colors.state.success,
          borderColor: colors.state.success
        };
      case 'warning':
        return {
          backgroundColor: colors.state.warningLight,
          color: colors.state.warning,
          borderColor: colors.state.warning
        };
      case 'error':
        return {
          backgroundColor: colors.state.errorLight,
          color: colors.state.error,
          borderColor: colors.state.error
        };
      default:
        return {
          backgroundColor: colors.background.secondary,
          color: colors.text.primary,
          borderColor: colors.border.primary
        };
    }
  };

  const renderStatusIcon = () => {
    if (!statusCard) return null;
    
    if (statusCard.tone === 'info') {
      return <Icon name="refresh" size={20} className="animate-spin" />;
    }
    if (statusCard.tone === 'success') {
      return <Icon name="check_circle" size={20} />;
    }
    if (statusCard.tone === 'warning') {
      return <Icon name="warning" size={20} />;
    }
    if (statusCard.tone === 'error') {
      return <Icon name="error" size={20} />;
    }
    return <Icon name="info" size={20} />;
  };

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title="Complete Payment" showBackButton={true} />
        
        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-40 overflow-y-auto">
          {/* Order Summary */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-lg border-2 border-gray-100 mb-6">
            {/* Top Accent Bar */}
            <div 
              className="h-1 w-full"
              style={{ backgroundColor: colors.app.primary }}
            />
            
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                <Icon name="receipt" size={24} style={{ color: colors.app.primary }} />
              </div>
              
              {/* Order Details */}
              <div className="space-y-3">
                {/* Provider & Product Group */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background.tertiary }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">Provider</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {provider?.Name || provider?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500">Product</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                      {product?.Name || product?.name || 'N/A'}
                    </span>
                  </div>
                </div>
                
                {/* Account Details Group */}
                <div className="p-3 rounded-lg border" style={{ 
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.primary 
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">Account Number</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">
                      {accountValue || 'N/A'}
                    </span>
                  </div>
                  {accountName && accountName !== accountValue && (
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-500">Account Name</span>
                      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">
                        {accountName}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Country */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500">Country</span>
                  <span className="text-sm font-medium text-gray-700">
                    {country?.countryName || 'N/A'}
                  </span>
                </div>
                
                {/* Total Price - Highlighted */}
                <div 
                  className="mt-4 pt-4 border-t-2 rounded-lg p-4"
                  style={{ 
                    borderColor: colors.app.primaryLight,
                    backgroundColor: colors.app.primaryLight + '20'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span 
                      className="text-xl font-bold"
                      style={{ color: colors.app.primaryDark }}
                    >
                      {formatCurrencyDisplay(amount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-4" style={{ backgroundColor: colors.state.errorLight, borderColor: colors.state.error }}>
              <div className="flex items-start space-x-2">
                <Icon name="error" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 text-sm">Payment Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Security Notice */}
          <Card className="mb-4" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary }}>
            <div className="flex items-center space-x-2">
              <Icon name="lock" size={20} style={{color: colors.app.primaryDark}} />
              <div>
                <p className="font-medium text-sm" style={{color: colors.text.primary}}>Secure Payment</p>
                <p className="text-xs" style={{color: colors.text.secondary}}>Your payment is encrypted and secure</p>
              </div>
            </div>
          </Card>

          {/* Status Card */}
          {statusCard && (
            <Card className="mb-4" style={getStatusCardStyle()}>
              <div className="flex items-start space-x-3">
                {renderStatusIcon()}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{statusCard.title}</p>
                  {statusCard.message && (
                    <p className="text-xs mt-1 opacity-80">{statusCard.message}</p>
                  )}
                </div>
              </div>
            </Card>
          )}


          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-4">
            Secure payment powered by Getbucks Bank
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 shadow-lg z-40"
        >
          <div className="max-w-md mx-auto">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              loading={isProcessing}
              fullWidth
              size="lg"
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrencyDisplay(amount, currency)}`}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Payment;

