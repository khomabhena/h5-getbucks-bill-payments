import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card } from '../components';
import { colors } from '../data/colors';
import { productRequiresNotifyNumber } from '../utils/creditPartyIdentifiers';
import {
  resolveFulfillmentStatusCard,
  resolveFulfillmentStatusLabel,
  resolveFulfillmentUserMessage,
} from '../utils/fulfillmentMessages';
import { getBillPaymentReceiptPlainText } from '../utils/receiptText';
import { copyText } from '../utils/copyText';

// Format currency as "USD 10" or "ZAR 23" (currency code first, no decimals)
const formatCurrencyCode = (amount, currency = 'USD') => {
  const currencyCode = (currency || 'USD').toUpperCase();
  const amountValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const roundedAmount = Math.round(amountValue);
  return `${currencyCode} ${roundedAmount}`;
};

function getVoucherToken(voucher = {}) {
  return (
    voucher.VoucherCode ||
    voucher.Token ||
    voucher.TokenNumber ||
    voucher.Code ||
    null
  );
}

function isCopyableTokenLabel(label = '') {
  const normalized = label.toLowerCase();
  return (
    normalized.includes('token') ||
    normalized.includes('voucher') ||
    normalized.includes('pin') ||
    normalized.includes('recharge') ||
    normalized.includes('serial')
  );
}

function CopyButton({ fieldKey, copiedField, onCopy, compact = false }) {
  const isCopied = copiedField === fieldKey;

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`p-1 rounded transition-colors hover:bg-white/50 ${compact ? '' : ''}`}
      title="Copy"
    >
      {isCopied ? (
        <Icon name="check" size={16} className="text-green-600" />
      ) : (
        <Icon name="content_copy" size={16} className="text-gray-400" />
      )}
    </button>
  );
}

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
    notifyNumber,
    amount, 
    validationData,
    postPaymentResult
  } = location.state || {};

  const [copiedField, setCopiedField] = useState(null);
  const [receiptCopyStatus, setReceiptCopyStatus] = useState(null);
  const autoCopiedForRef = useRef(null);

  const isPaymentSuccessful =
    paymentStatus === 'SUCCESS' || getbucksPayment?.success === true;
  const finalTransactionId = transactionId || getbucksPayment?.transactionId;

  const receiptInput = useMemo(
    () => ({
      success: isPaymentSuccessful,
      transactionId: finalTransactionId,
      paymentStatus: paymentStatus || getbucksPayment?.status,
      timestamp: timestamp || getbucksPayment?.timestamp,
      country,
      service,
      provider,
      product,
      accountValue,
      notifyNumber,
      amount,
      validationData,
      postPaymentResult,
    }),
    [
      isPaymentSuccessful,
      finalTransactionId,
      paymentStatus,
      getbucksPayment,
      timestamp,
      country,
      service,
      provider,
      product,
      accountValue,
      notifyNumber,
      amount,
      validationData,
      postPaymentResult,
    ]
  );

  const receiptPlainText = useMemo(
    () => getBillPaymentReceiptPlainText(receiptInput),
    [receiptInput]
  );

  const handleCopyReceipt = useCallback(
    async (source = 'manual') => {
      const ok = await copyText(receiptPlainText);
      if (ok) {
        setReceiptCopyStatus(source === 'auto' ? 'auto' : 'manual');
        return true;
      }
      setReceiptCopyStatus('failed');
      return false;
    },
    [receiptPlainText]
  );

  // Redirect if no payment data
  useEffect(() => {
    if (!finalTransactionId) {
      navigate('/payment', { replace: true });
    }
  }, [finalTransactionId, navigate]);

  // Auto-copy full receipt on payment completion (once per transaction)
  useEffect(() => {
    if (!finalTransactionId || !receiptPlainText) return;
    if (autoCopiedForRef.current === finalTransactionId) return;

    handleCopyReceipt('auto').then((ok) => {
      if (ok) {
        autoCopiedForRef.current = finalTransactionId;
      }
    });
  }, [finalTransactionId, receiptPlainText, handleCopyReceipt]);

  const copyToClipboard = async (text, fieldName) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
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
  const fulfillmentResult = postPaymentResult || null;
  const fulfillmentContext = {
    amount,
    currency,
    accountValue,
    providerName: provider?.Name || provider?.name,
  };
  const fulfillmentCard = resolveFulfillmentStatusCard(fulfillmentResult, fulfillmentContext);
  const fulfillmentSuccess = fulfillmentResult?.success === true;
  const fulfillmentPending = fulfillmentResult?.isFailedRepeatable === true;
  const fulfillmentFailedHard =
    Boolean(fulfillmentResult) && !fulfillmentSuccess && !fulfillmentPending;
  const fulfillmentUnavailable = isPaymentSuccessful && !fulfillmentResult;
  const fulfillmentMessage = fulfillmentResult
    ? resolveFulfillmentUserMessage(fulfillmentResult, fulfillmentContext)
    : fulfillmentCard.message;
  const fulfillmentStatusLabel = fulfillmentResult
    ? resolveFulfillmentStatusLabel(fulfillmentResult)
    : fulfillmentCard.title;
  const fulfillmentReferenceNumber = fulfillmentResult?.referenceNumber;
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
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-44 overflow-y-auto border-x border-gray-200">
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
                {fulfillmentSuccess
                  ? 'Your bill payment has been processed successfully'
                  : fulfillmentMessage}
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
                    {productRequiresNotifyNumber(product) && notifyNumber && (
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">Notification number</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">
                          {notifyNumber}
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
          {(fulfillmentResult || fulfillmentUnavailable) && (
            <Card 
              className="mb-6" 
              style={{ 
                backgroundColor: fulfillmentSuccess
                  ? colors.state.successLight
                  : fulfillmentFailedHard || fulfillmentUnavailable
                    ? colors.state.errorLight
                    : colors.state.warningLight,
                borderColor: fulfillmentSuccess
                  ? colors.state.success
                  : fulfillmentFailedHard || fulfillmentUnavailable
                    ? colors.state.error
                    : colors.state.warning
              }}
            >
              <div className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: fulfillmentSuccess
                      ? colors.state.success
                      : fulfillmentFailedHard || fulfillmentUnavailable
                        ? colors.state.error
                        : colors.state.warning
                  }}
                >
                  {fulfillmentSuccess ? (
                    <Icon name="check_circle" size={20} className="text-white" />
                  ) : fulfillmentFailedHard || fulfillmentUnavailable ? (
                    <Icon name="error" size={20} className="text-white" />
                  ) : (
                    <Icon name="warning" size={20} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm ${
                      fulfillmentSuccess
                        ? 'text-green-800'
                        : fulfillmentFailedHard || fulfillmentUnavailable
                          ? 'text-red-800'
                          : 'text-amber-900'
                    }`}
                  >
                    {fulfillmentStatusLabel}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      fulfillmentSuccess
                        ? 'text-green-700'
                        : fulfillmentFailedHard || fulfillmentUnavailable
                          ? 'text-red-700'
                          : 'text-amber-700'
                    }`}
                  >
                    {fulfillmentMessage}
                  </p>
                  {fulfillmentReferenceNumber && (
                    <p
                      className={`text-xs mt-2 ${
                        fulfillmentSuccess
                          ? 'text-green-700'
                          : fulfillmentFailedHard || fulfillmentUnavailable
                            ? 'text-red-700'
                            : 'text-amber-700'
                      }`}
                    >
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
                  const fieldKey = `fulfillment-display-${index}`;
                  const canCopy = isCopyableTokenLabel(item.Label);
                  return (
                    <div key={fieldKey} className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{item.Label}</span>
                        {canCopy && (
                          <CopyButton
                            fieldKey={fieldKey}
                            copiedField={copiedField}
                            onCopy={() => copyToClipboard(item.Value.trim(), fieldKey)}
                            compact
                          />
                        )}
                      </div>
                      {canCopy ? (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.Value.trim(), fieldKey)}
                          className="w-full text-sm text-gray-800 whitespace-pre-line text-left font-mono font-semibold bg-white px-3 py-2 rounded border border-green-200 break-all"
                        >
                          {item.Value}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-800 whitespace-pre-line">{item.Value}</span>
                      )}
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
                  const tokenValue = getVoucherToken(voucher);
                  const serialFieldKey = `serial-${index}`;
                  const tokenFieldKey = `token-${index}`;

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
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>Serial Number</span>
                            <CopyButton
                              fieldKey={serialFieldKey}
                              copiedField={copiedField}
                              onCopy={() => copyToClipboard(voucher.SerialNumber, serialFieldKey)}
                              compact
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(voucher.SerialNumber, serialFieldKey)}
                            className="w-full font-mono font-semibold text-sm bg-white px-3 py-2 rounded border mt-1 text-left break-all"
                            style={{ borderColor: colors.border.primary }}
                          >
                            {voucher.SerialNumber}
                          </button>
                        </div>
                      )}

                      {tokenValue && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>Token</span>
                            <CopyButton
                              fieldKey={tokenFieldKey}
                              copiedField={copiedField}
                              onCopy={() => copyToClipboard(tokenValue, tokenFieldKey)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tokenValue, tokenFieldKey)}
                            className="w-full font-mono font-semibold text-base bg-white px-3 py-2 rounded border break-all text-center"
                            style={{ color: colors.app.primaryDark, borderColor: colors.border.secondary }}
                          >
                            {tokenValue}
                          </button>
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
            Thank you for using GetBucks Bill Payments
          </p>
        </div>

        {/* Fixed Buttons at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white pb-6 z-40 border-t border-gray-100"
        >
          <div className="max-w-md mx-auto px-4 pt-4 space-y-3">
            {receiptCopyStatus === 'auto' && (
              <p className="text-xs text-center text-gray-600">
                Receipt copied to clipboard. Paste into Notes or WhatsApp to save it.
              </p>
            )}
            {receiptCopyStatus === 'manual' && (
              <p className="text-xs text-center text-gray-600">Receipt copied again.</p>
            )}
            {receiptCopyStatus === 'failed' && (
              <p className="text-xs text-center text-amber-700">
                Could not copy automatically. Tap the button below to try again.
              </p>
            )}
            <Button
              onClick={() => handleCopyReceipt('manual')}
              variant="secondary"
              fullWidth
              size="lg"
            >
              {receiptCopyStatus === 'manual' ? 'Copied!' : 'Copy receipt info'}
            </Button>
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

