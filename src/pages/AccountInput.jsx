import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card, InputField } from '../components';
import { appleTreeService } from '../services/appleTreeService';
import AppleTreeGateway from '../services/appletree/AppleTreeGateway';
import { ROUTES } from '../data/constants';
import { colors } from '../data/colors';
import { getDisplayIdentifierLabel } from '../utils/identifierLabel';
import { getServiceIconName } from '../utils/serviceIcons';

const AccountInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service, provider, product } = location.state || {};

  const [accountValue, setAccountValue] = useState('');
  const [amount, setAmount] = useState('');
  const [validationData, setValidationData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const validationTimeoutRef = useRef(null);
  const currentValidationRequestRef = useRef(null);

  // Calculate if amount is fixed
  const minAmount = product?.MinimumAmount || product?.MinAmount || 0;
  const maxAmount = product?.MaximumAmount || product?.MaxAmount || 0;
  const productPrice = product?.Price || product?.price || 0;
  const currency = product?.Currency || product?.currency || 'USD';
  
  // Amount is fixed if:
  // 1. Price > 0, OR
  // 2. MinAmount === MaxAmount and both > 0
  const amountsEqual = minAmount > 0 && maxAmount > 0 && Math.abs(minAmount - maxAmount) < 0.01;
  const isFixedAmount = productPrice > 0 || amountsEqual;
  const fixedAmount = isFixedAmount ? (productPrice > 0 ? productPrice : minAmount) : null;

  // Set fixed amount on mount
  useEffect(() => {
    if (product) {
      if (isFixedAmount && fixedAmount) {
        setAmount(fixedAmount.toString());
      } else if (minAmount > 0) {
        setAmount(minAmount.toString());
      }
    }
  }, [product?.Id]);

  // Redirect if no product selected
  useEffect(() => {
    if (!product || !country || !service || !provider) {
      navigate(ROUTES.PRODUCTS, { replace: true });
    }
  }, [product, country, service, provider, navigate]);

  // Get credit party identifier info from product
  const creditPartyIdentifier = product?.CreditPartyIdentifiers?.[0];
  const fieldLabel = getDisplayIdentifierLabel(
    creditPartyIdentifier?.Title || creditPartyIdentifier?.Name,
    {
      serviceName: service?.Name,
      providerName: provider?.Name || provider?.name,
      productName: product?.Name || product?.name
    }
  );
  const fieldName = creditPartyIdentifier?.Name || 'AccountNumber';

  // Get customer details from bridge (native/iframe/mock)
  const getCustomerDetails = async () => {
    try {
      const { getUserInfo } = await import('../services/paymentBridge');
      const userInfo = await getUserInfo();
      
      if (userInfo) {
        return {
          CustomerId: userInfo.CustomerId || userInfo.id || userInfo.userId || '1',
          Fullname: userInfo.Fullname || userInfo.name || userInfo.fullName || 'Customer',
          MobileNumber: userInfo.MobileNumber || userInfo.phoneNumber || userInfo.msisdn || '+263777077921',
          EmailAddress: userInfo.EmailAddress || userInfo.email || null
        };
      }
    } catch (error) {
      console.warn('Could not get user info from bridge:', error);
    }
    
    // Fallback to default
    return {
      CustomerId: '1',
      Fullname: 'Customer',
      MobileNumber: '+263777077921',
      EmailAddress: null
    };
  };

  // Use refs to get current values without triggering re-validation on amount change
  const amountRef = useRef(amount);
  const accountValueRef = useRef(accountValue);
  
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);
  
  useEffect(() => {
    accountValueRef.current = accountValue;
  }, [accountValue]);

  const performValidation = useCallback(async () => {
    const currentAccountValue = accountValueRef.current;
    const currentAmount = amountRef.current;
    
    if (!currentAccountValue.trim() || !product) {
      return;
    }

    const requestId = AppleTreeGateway.generateRequestId();
    currentValidationRequestRef.current = requestId;

    setValidating(true);
    setValidationError(null);

    try {
      const amountValue = parseFloat(currentAmount) || 0;
      const customerDetails = await getCustomerDetails();

      const validationPayload = {
        RequestId: requestId,
        Amount: amountValue,
        CreditPartyIdentifiers: [
          {
            IdentifierFieldName: fieldName,
            IdentifierFieldValue: currentAccountValue.trim()
          }
        ],
        Currency: currency,
        CustomerDetails: customerDetails,
        POSDetails: {
          CashierId: 'Getbucks',
          StoreId: 'Getbucks',
          TerminalId: 'Getbucks'
        },
        ProductId: product.Id || product.id,
        Quantity: 1
      };

      console.log('Validating payment with payload:', validationPayload);

      const result = await appleTreeService.validatePayment(validationPayload);

      // Only update state if this is still the current validation request
      if (currentValidationRequestRef.current === requestId) {
        if (result.success && result.data.Status === 'VALIDATED') {
          setValidationData(result.data);
          setValidationError(null);
        } else {
          setValidationError(result.data?.ResultMessage || result.error || 'Failed to validate account details.');
          setValidationData(null);
        }
        setValidating(false);
      }
    } catch (error) {
      console.error('Validation error:', error);
      
      if (currentValidationRequestRef.current === requestId) {
        const isNetworkError = error.message?.includes('Failed to fetch') ||
                              error.message?.includes('NetworkError') ||
                              error.name === 'TypeError';

        if (isNetworkError) {
          setValidationError('Network connection issue. Please check your internet connection and try again.');
        } else {
          setValidationError(error.message || 'Failed to validate account details.');
        }
        
        setValidationData(null);
        setValidating(false);
      }
    }
  }, [product, fieldName, currency]);

  // Debounced validation - trigger 1 second after user stops typing
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (accountValue.trim().length > 0) {
      validationTimeoutRef.current = setTimeout(() => {
        performValidation();
      }, 1000);
    } else {
      setValidationData(null);
      setValidationError(null);
      setValidating(false);
    }

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [accountValue, performValidation]);

  const handleContinue = () => {
    const amountValue = parseFloat(amount);
    
    if (product && country && service && provider) {
      navigate(ROUTES.PAYMENT, {
        state: {
          country,
          service,
          provider,
          product,
          accountValue,
          amount: amountValue,
          validationData
        },
      });
    }
  };

  if (!product || !country || !service || !provider) {
    return null;
  }

  const amountValue = parseFloat(amount);
  const hasValidAmount = amount && !isNaN(amountValue) && amountValue > 0;
  const hasValidAccount = accountValue.trim().length > 0;
  const isValidationSuccessful = validationData && validationData.Status === 'VALIDATED';
  const hasValidationFailed = !validating && !isValidationSuccessful && validationError;
  const canContinue = hasValidAccount && hasValidAmount;

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title={`Enter ${fieldLabel}`} showBackButton={true} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-40 overflow-y-auto">
          {/* Product Info */}
          <div className="mb-6">
            <Card>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icon 
                    name={getServiceIconName(provider?.Name || provider?.name)} 
                    size={32} 
                    className="text-[#faa819]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-800 truncate">
                    {product?.Name || product?.name || 'Product'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {provider?.Name || provider?.name || 'Provider'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Account Input Field */}
          <Card className="mb-4">
            <InputField
              type="text"
              label={fieldLabel}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              value={accountValue}
              onChange={(e) => setAccountValue(e.target.value)}
              error={validationError && !validating ? validationError : null}
              loading={validating}
              required
            />
            
            {validating && (
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Icon name="refresh" size={16} className="text-[#faa819] animate-spin mr-2" />
                Validating account...
              </div>
            )}
          </Card>

          {/* Validation Success Display */}
          {validationData && validationData.DisplayData && validationData.DisplayData.length > 0 && (
            <Card className="mb-4" style={{ backgroundColor: colors.state.successLight, borderColor: colors.state.success }}>
              <div className="flex items-center mb-3">
                <Icon name="check_circle" size={24} className="text-green-600 mr-2" />
                <h3 className="text-sm font-semibold text-green-800">Account Verified</h3>
              </div>
              
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

              {/* Bill Amount Display (if available) */}
              {validationData.BillAmount !== undefined && validationData.BillAmount !== null && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Bill Amount:</span>
                    <span className="text-sm font-semibold text-green-700">
                      {currency} {validationData.BillAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Amount Input Field */}
          <Card className="mb-4">
            <InputField
              type="number"
              label="Payment Amount"
              placeholder={isFixedAmount ? "Fixed amount" : `Enter amount (${currency})`}
              value={amount}
              onChange={(e) => {
                if (!isFixedAmount) {
                  setAmount(e.target.value);
                }
              }}
              disabled={isFixedAmount}
              required
            />
            
            {/* Amount limits display */}
            {(minAmount > 0 || maxAmount > 0) && (
              <div className="mt-2 text-xs text-gray-500">
                {minAmount > 0 && maxAmount > 0 && Math.abs(minAmount - maxAmount) < 0.01 && (
                  <span>Amount: {currency} {minAmount.toFixed(2)}</span>
                )}
                {minAmount > 0 && maxAmount > 0 && Math.abs(minAmount - maxAmount) >= 0.01 && (
                  <span>Min: {currency} {minAmount.toFixed(2)} - Max: {currency} {maxAmount.toFixed(2)}</span>
                )}
                {minAmount > 0 && maxAmount === 0 && (
                  <span>Minimum: {currency} {minAmount.toFixed(2)}</span>
                )}
                {minAmount === 0 && maxAmount > 0 && (
                  <span>Maximum: {currency} {maxAmount.toFixed(2)}</span>
                )}
              </div>
            )}
            
            {isFixedAmount && productPrice > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Fixed amount for this product
              </div>
            )}
          </Card>

          {/* Warning Message if validation failed */}
          {hasValidationFailed && !validating && (
            <Card className="mb-4" style={{ backgroundColor: colors.state.warningLight, borderColor: colors.state.warning }}>
              <div className="flex items-start space-x-2">
                <Icon name="warning" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: colors.app.primaryDark }}>
                    We do not recognise the account details. Are you sure you want to continue?
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 mb-4">
            Enter your account details to continue
          </p>
        </div>

        {/* Fixed Button at Bottom */}
        <div 
          style={{ backgroundColor: colors.background.secondary }} 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 shadow-lg z-40"
        >
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              fullWidth
              size="lg"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AccountInput;

