import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card } from '../components';
import { colors } from '../data/colors';

// Format currency as "USD 10" or "ZAR 23" (currency code first, no decimals)
const formatCurrencyCode = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const roundedAmount = Math.round(amountValue);
  return `${currencyCode} ${roundedAmount}`;
};

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    getbucksPayment,
    transactionId, 
    paymentStatus,
    timestamp,
    country, 
    service, 
    provider, 
    product, 
    accountValue, 
    amount, 
    validationData,
    postPaymentResult
  } = location.state || {};

  const [copiedField, setCopiedField] = useState(null);

  // Redirect if no payment data
  React.useEffect(() => {
    if (!transactionId && !getbucksPayment?.transactionId) {
      navigate('/payment', { replace: true });
    }
  }, [transactionId, getbucksPayment, navigate]);

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDone = () => {
    // Navigate to home
    navigate('/');
  };

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

  const accountName = getAccountName();
  const currency = product?.Currency || product?.currency || 'USD';
  const finalTransactionId = transactionId || getbucksPayment?.transactionId;
  const isPaymentSuccessful = paymentStatus === 'SUCCESS' || getbucksPayment?.success === true;
  const fulfillmentResult = postPaymentResult || null;
  const fulfillmentStatus = fulfillmentResult?.status;
  const fulfillmentSuccess = fulfillmentResult?.success === true;
  const fulfillmentMessage = fulfillmentResult?.resultMessage;
  const fulfillmentReferenceNumber = fulfillmentResult?.referenceNumber;
  const fulfillmentRequestId = fulfillmentResult?.requestId;
  const vouchers = fulfillmentResult?.vouchers || [];
  const receiptHTML = fulfillmentResult?.receiptHTML || [];
  const receiptSmses = fulfillmentResult?.receiptSmses || [];
  const fulfillmentDisplayData = fulfillmentResult?.displayData || [];

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title={isPaymentSuccessful ? "Payment Successful" : "Payment Status"} showBackButton={false} />
        
        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 overflow-y-auto">
          {/* Success Header */}
          {isPaymentSuccessful && (
            <div className="text-center mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" 
                style={{backgroundColor: colors.app.primaryDark}}
              >
                <Icon name="check_circle" size={48} className="text-white" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </p>
              <p className="text-xs text-gray-600">
                Your bill payment has been processed successfully
              </p>
            </div>
          )}

          {/* Transaction Details */}
          <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 mb-6">
            {/* Top Accent Bar */}
            <div 
              className="h-1 w-full"
              style={{ backgroundColor: colors.app.primary }}
            />
            
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                <Icon name="receipt_long" size={24} style={{ color: colors.app.primary }} />
              </div>
              
              {/* Transaction Details */}
              <div className="space-y-3">
                {/* Transaction ID - Highlighted */}
                {finalTransactionId && (
                  <div 
                    className="p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: colors.app.primaryLight + '20',
                      borderColor: colors.app.primaryLight
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Transaction ID</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-gray-900">{finalTransactionId}</span>
                        <button
                          onClick={() => copyToClipboard(finalTransactionId, 'transactionId')}
                          className="p-1 rounded transition-colors hover:bg-white/50"
                          title="Copy Transaction ID"
                        >
                          {copiedField === 'transactionId' ? (
                            <Icon name="check" size={16} className="text-green-600" />
                          ) : (
                            <Icon name="content_copy" size={16} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Provider & Product Group */}
                {(provider || product) && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background.tertiary }}>
                    {provider && (
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">Provider</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                          {provider?.Name || provider?.name || 'N/A'}
                        </span>
                      </div>
                    )}
                    {product && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-500">Product</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                          {product?.Name || product?.name || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Account Details Group */}
                {(accountValue || accountName) && (
                  <div className="p-3 rounded-lg border" style={{ 
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.primary 
                  }}>
                    {accountValue && (
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">Account Number</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">
                          {accountValue}
                        </span>
                      </div>
                    )}
                    {accountName && accountName !== accountValue && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-500">Account Name</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">
                          {accountName}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Service & Country */}
                {(service || country) && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-500">
                      {service && country ? 'Service • Country' : service ? 'Service' : 'Country'}
                    </span>
                    <span className="text-sm font-medium text-gray-700 text-right">
                      {service?.Name && country?.countryName 
                        ? `${service.Name} • ${country.countryName}`
                        : service?.Name || country?.countryName || 'N/A'}
                    </span>
                  </div>
                )}
                
                {/* Date */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-sm font-medium text-gray-700">
                    {timestamp ? new Date(timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>
                
                {/* Total Paid - Highlighted */}
                <div 
                  className="mt-4 pt-4 border-t rounded-lg p-4"
                  style={{ 
                    borderColor: colors.app.primaryLight,
                    backgroundColor: colors.app.primaryLight + '20'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total Paid</span>
                    <span 
                      className="text-xl font-bold"
                      style={{ color: colors.app.primaryDark }}
                    >
                      {formatCurrencyCode(amount || 0, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Status */}
          {fulfillmentResult && (
            <Card 
              className="mb-6" 
              style={{ 
                backgroundColor: fulfillmentSuccess ? colors.state.successLight : colors.state.warningLight,
                borderColor: fulfillmentSuccess ? colors.state.success : colors.state.warning
              }}
            >
              <div className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: fulfillmentSuccess ? colors.state.success : colors.state.warning
                  }}
                >
                  {fulfillmentSuccess ? (
                    <Icon name="check_circle" size={20} className="text-white" />
                  ) : (
                    <Icon name="warning" size={20} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${fulfillmentSuccess ? 'text-green-800' : 'text-amber-900'}`}>
                    {fulfillmentSuccess ? 'Payment Fulfilled' : 'Fulfillment Pending'}
                  </p>
                  <p className={`text-xs mt-1 ${fulfillmentSuccess ? 'text-green-700' : 'text-amber-700'}`}>
                    {fulfillmentMessage ||
                      (fulfillmentSuccess
                        ? `Payment of ${formatCurrencyCode(amount || 0, currency)} has been processed for ${accountValue}`
                        : 'The biller has not yet confirmed this transaction. Please try again shortly.')}
                  </p>
                  {fulfillmentReferenceNumber && (
                    <p className={`text-xs mt-2 ${fulfillmentSuccess ? 'text-green-700' : 'text-amber-700'}`}>
                      Reference: {fulfillmentReferenceNumber}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Fulfillment Display Data */}
          {fulfillmentDisplayData.length > 0 && (
            <Card className="mb-6" style={{ backgroundColor: colors.state.successLight, borderColor: colors.state.success }}>
              <h3 className="font-bold text-sm text-green-800 mb-3">Voucher Details</h3>
              <div className="space-y-2">
                {fulfillmentDisplayData.map((item, index) => {
                  if (!item.Value || item.Value.trim() === '') {
                    return null;
                  }
                  return (
                    <div key={`fulfillment-display-${index}`} className="flex flex-col">
                      <span className="text-xs font-medium text-gray-600 mb-1">{item.Label}</span>
                      <span className="text-sm text-gray-800 whitespace-pre-line">{item.Value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Vouchers */}
          {vouchers.length > 0 && (
            <Card className="mb-6">
              <h3 className="font-bold mb-3 text-sm" style={{ color: colors.text.primary }}>Voucher Tokens</h3>
              <div className="space-y-3">
                {vouchers.map((voucher, index) => {
                  const expiryDate = voucher.ExpiryDate ? new Date(voucher.ExpiryDate) : null;
                  const daysUntilExpiry = expiryDate
                    ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={`voucher-${index}`}
                      className="rounded-lg p-4 border"
                      style={{
                        background: `linear-gradient(to bottom right, ${colors.background.secondary}, ${colors.app.primaryLight})`,
                        borderColor: colors.border.primary
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-sm" style={{ color: colors.text.primary }}>Token #{index + 1}</h4>
                        {vouchers.length > 1 && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: colors.state.successLight,
                            color: colors.text.primary
                          }}>
                            {index + 1} of {vouchers.length}
                          </span>
                        )}
                      </div>

                      {voucher.SerialNumber && (
                        <div className="mb-3">
                          <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>Serial Number</span>
                          <p className="font-mono font-semibold text-sm bg-white px-3 py-2 rounded border mt-1" style={{ borderColor: colors.border.primary }}>
                            {voucher.SerialNumber}
                          </p>
                        </div>
                      )}

                      {voucher.VoucherCode && (
                        <div className="mb-3">
                          <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>Token</span>
                          <p className="font-mono font-semibold text-base bg-white px-3 py-2 rounded border mt-1 break-all text-center" style={{ color: colors.app.primaryDark, borderColor: colors.border.secondary }}>
                            {voucher.VoucherCode}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {voucher.ValidDays !== undefined && (
                          <div className="bg-white rounded px-2 py-1 border" style={{ borderColor: colors.border.primary }}>
                            <span style={{ color: colors.text.secondary }}>Valid For:</span>
                            <span className="font-semibold ml-1" style={{ color: colors.text.primary }}>{voucher.ValidDays} days</span>
                          </div>
                        )}
                        {expiryDate && (
                          <div className="bg-white rounded px-2 py-1 border" style={{ borderColor: colors.border.primary }}>
                            <span style={{ color: colors.text.secondary }}>Expires:</span>
                            <span className="font-semibold ml-1" style={{
                              color: daysUntilExpiry !== null && daysUntilExpiry < 7 ? colors.state.error : colors.text.primary
                            }}>
                              {expiryDate.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Receipt HTML */}
          {receiptHTML.length > 0 && (
            <Card className="mb-6" style={{ borderColor: colors.state.success }}>
              <h3 className="font-bold mb-3 text-sm text-green-800">Receipt</h3>
              <div className="space-y-3">
                {receiptHTML.map((html, index) => (
                  <div key={`receipt-${index}`} className="rounded-lg border border-green-200 overflow-hidden">
                    <div className="px-3 py-2 bg-green-600 text-white flex items-center justify-between text-xs">
                      <span>Receipt #{index + 1}</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-3 max-h-80 overflow-y-auto text-[11px] text-gray-800">
                      <div dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Receipt SMS */}
          {receiptSmses.length > 0 && (
            <Card className="mb-6" style={{ borderColor: colors.state.success }}>
              <h3 className="font-bold mb-3 text-sm text-green-800">Receipt SMS</h3>
              <div className="space-y-2">
                {receiptSmses.map((sms, index) => (
                  <div key={`sms-${index}`} className="text-xs text-gray-700 bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="font-semibold mb-1">Message #{index + 1}</p>
                    <p>{sms}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Display Validation Data (if available) */}
          {validationData && validationData.DisplayData && validationData.DisplayData.length > 0 && (
            <Card className="mb-6" style={{ backgroundColor: colors.state.successLight, borderColor: colors.state.success }}>
              <h3 className="font-bold text-sm text-green-800 mb-3">Account Information</h3>
              <div className="space-y-2">
                {validationData.DisplayData.map((item, index) => {
                  if (!item.Value || item.Value.trim() === '') {
                    return null;
                  }
                  return (
                    <div key={index} className="flex flex-col">
                      <span className="text-xs font-medium text-gray-600 mb-1">{item.Label}</span>
                      <span className="text-sm text-gray-800 whitespace-pre-line">{item.Value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-4">
            Thank you for using Getbucks Bill Payments
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white pb-6 z-40"
        >
          <div className="max-w-md mx-auto px-4 pt-4">
            <Button
              onClick={handleDone}
              fullWidth
              size="lg"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Confirmation;

