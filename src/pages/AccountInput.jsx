import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, PageWrapper, Icon, Card, InputField } from '../components';
import { appleTreeService } from '../services/appleTreeService';
import { ROUTES } from '../data/constants';
import { colors } from '../data/colors';
import { getDisplayIdentifierLabel, getMinIdentifierLength } from '../utils/identifierLabel';
import {
  generateRequestId,
  resolveCustomerDetailsForVas,
} from '../services/vas/billPaymentPayload.js';
import {
  buildCreditPartyIdentifiers,
  buildPaymentRecipient,
  getFieldName,
  productRequiresNotifyNumber,
} from '../utils/creditPartyIdentifiers';
import { productRequiresValidation } from '../utils/productValidation';
import { getServiceIconName } from '../utils/serviceIcons';
import {
  buildSelectedProductAddOns,
  getChargeBreakdown,
  getProductAddOns,
  resolveValidateAmount,
  shouldDisplayCharges,
  supportsDstvAddOns,
  supportsPayUsingReferenceNumber,
} from '../utils/billExtras';

/** Bill amount from VAS, or payment field for variable-amount products. */
function resolveDisplayBillAmount(validationData, amount, isFixedAmount) {
  if (!validationData || validationData.Status !== 'VALIDATED') return null;

  const calc = getChargeBreakdown(validationData);
  if (calc && calc.totalAmount > 0) return calc.totalAmount;

  const apiAmount = validationData.BillAmount;
  const entered = parseFloat(amount);

  if (apiAmount != null && apiAmount > 0) return apiAmount;
  if (!isFixedAmount && !isNaN(entered) && entered > 0) return entered;
  if (apiAmount != null) return apiAmount;
  return null;
}

const AccountInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service, provider, product } = location.state || {};

  const [accountValue, setAccountValue] = useState('');
  const [notifyNumber, setNotifyNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAddonCode, setSelectedAddonCode] = useState('');
  const [payUsingReferenceNumber, setPayUsingReferenceNumber] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const validationTimeoutRef = useRef(null);
  const currentValidationRequestRef = useRef(null);
  const accountInputRef = useRef(null);
  const cursorPositionRef = useRef(null);
  const customerDetailsRef = useRef(resolveCustomerDetailsForVas());

  const showNotifyField = productRequiresNotifyNumber(product);
  const validationRequired = productRequiresValidation(product);
  const showAddOns = supportsDstvAddOns(product);
  const productAddOns = getProductAddOns(product);
  const showReferenceToggle = supportsPayUsingReferenceNumber(product);
  const selectedAddon =
    showAddOns && selectedAddonCode
      ? productAddOns.find((addon) => addon.Code === selectedAddonCode) || null
      : null;

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

  // Set fixed amount on mount / when add-on changes (amount includes selected add-on)
  useEffect(() => {
    if (product) {
      if (isFixedAmount && fixedAmount != null) {
        setAmount(resolveValidateAmount(fixedAmount, selectedAddon).toString());
      } else if (minAmount > 0 && !selectedAddonCode) {
        setAmount(minAmount.toString());
      }
    }
  }, [product?.Id, selectedAddonCode]);

  // Reset add-on / reference mode when product changes
  useEffect(() => {
    setSelectedAddonCode('');
    setPayUsingReferenceNumber(false);
  }, [product?.Id]);

  // Redirect if no product selected
  useEffect(() => {
    if (!product || !country || !service || !provider) {
      navigate(ROUTES.PRODUCTS, { replace: true });
    }
  }, [product, country, service, provider, navigate]);

  // Get credit party identifier info from product
  const creditPartyIdentifier = product?.CreditPartyIdentifiers?.[0];
  const baseFieldLabel = getDisplayIdentifierLabel(
    creditPartyIdentifier?.Title,
    {
      serviceName: service?.Name,
      providerName: provider?.Name || provider?.name,
      productName: product?.Name || product?.name
    }
  );
  const fieldLabel = payUsingReferenceNumber ? 'Reference number' : baseFieldLabel;
  const fieldName = getFieldName(creditPartyIdentifier);
  const primaryFieldName = fieldName;
  const minAccountLength = getMinIdentifierLength(fieldLabel, fieldName);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { getUserInfo } = await import('../services/paymentBridge');
        const userInfo = await getUserInfo();
        if (!cancelled && userInfo) {
          customerDetailsRef.current = resolveCustomerDetailsForVas(userInfo);
        }
      } catch {
        // Standalone / iframe without user info — defaults are fine
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Refs for validation payload (account, notify number, amount, addon, reference mode)
  const amountRef = useRef(amount);
  const accountValueRef = useRef(accountValue);
  const notifyNumberRef = useRef(notifyNumber);
  const selectedAddonRef = useRef(selectedAddon);
  const payUsingReferenceNumberRef = useRef(payUsingReferenceNumber);
  
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);
  
  useEffect(() => {
    accountValueRef.current = accountValue;
  }, [accountValue]);

  useEffect(() => {
    notifyNumberRef.current = notifyNumber;
  }, [notifyNumber]);

  useEffect(() => {
    selectedAddonRef.current = selectedAddon;
  }, [selectedAddon]);

  useEffect(() => {
    payUsingReferenceNumberRef.current = payUsingReferenceNumber;
  }, [payUsingReferenceNumber]);

  const performValidation = useCallback(async () => {
    if (!validationRequired) {
      return;
    }

    const currentAccountValue = accountValueRef.current;
    const currentAmount = amountRef.current;
    
    if (!currentAccountValue.trim() || !product) {
      return;
    }

    if (currentAccountValue.trim().length < minAccountLength) {
      return;
    }

    const requestId = generateRequestId();
    currentValidationRequestRef.current = requestId;

    setValidating(true);
    setValidationError(null);

    try {
      const amountValue = parseFloat(currentAmount) || 0;
      const customerDetails = customerDetailsRef.current;

      const validationPayload = {
        RequestId: requestId,
        Amount: amountValue,
        Recipient: buildPaymentRecipient({
          accountValue: currentAccountValue.trim(),
          notifyNumber: notifyNumberRef.current,
          primaryFieldName,
          customerDetails,
          product,
        }),
        CreditPartyIdentifiers: buildCreditPartyIdentifiers({
          product,
          accountValue: currentAccountValue.trim(),
          customerDetails,
          notifyNumber: notifyNumberRef.current,
          primaryFieldName,
        }),
        Currency: currency,
        CustomerDetails: customerDetails,
        POSDetails: {
          CashierId: 'GetBucks',
          StoreId: 'GetBucks',
          TerminalId: 'GetBucks',
        },
        ProductId: product.Id || product.id,
        Quantity: 1,
        PayUsingReferenceNumber: Boolean(payUsingReferenceNumberRef.current),
      };

      const addOns = buildSelectedProductAddOns(selectedAddonRef.current);
      if (addOns) {
        validationPayload.ProductAddOns = addOns;
      }

      console.log('Validating payment with payload:', validationPayload);

      const result = await appleTreeService.validatePayment(validationPayload);

      if (currentValidationRequestRef.current === requestId) {
        if (result.success && result.data?.Status === 'VALIDATED') {
          setValidationData(result.data);
          setValidationError(null);
        } else {
          setValidationError(
            result.data?.ResultMessage || result.error || 'Failed to validate account details.'
          );
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
          const resultMessage =
            error?.responseData?.details?.errors?.['CustomerDetails.EmailAddress']?.[0] ||
            error?.responseData?.ResultMessage ||
            error?.message;
          setValidationError(resultMessage || 'Failed to validate account details.');
        }
        
        setValidationData(null);
        setValidating(false);
      }
    }
  }, [product, currency, minAccountLength, validationRequired, primaryFieldName]);

  // Track if input was focused before validation
  const wasFocusedRef = useRef(false);
  const validatingRef = useRef(validating);
  
  // Keep validating ref in sync
  useEffect(() => {
    validatingRef.current = validating;
  }, [validating]);
  
  // Save focus state and cursor position when typing
  const handleAccountInputFocus = () => {
    wasFocusedRef.current = true;
  };
  
  const handleAccountInputBlur = () => {
    if (!validatingRef.current) {
      wasFocusedRef.current = false;
    }

    const trimmed = accountValueRef.current.trim();
    if (trimmed.length >= minAccountLength) {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      performValidation();
    }
  };

  // Restore focus and cursor position after validation completes
  useEffect(() => {
    // Only restore focus when validation completes (not during validation)
    if (!validating && wasFocusedRef.current && accountInputRef.current && cursorPositionRef.current !== null) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (accountInputRef.current) {
          accountInputRef.current.focus();
          const position = cursorPositionRef.current;
          if (position !== null && position <= accountValue.length) {
            accountInputRef.current.setSelectionRange(position, position);
          }
        }
      });
    }
  }, [validating, accountValue.length]);

  // Debounced validation when account, notify number, or payment amount changes
  useEffect(() => {
    if (!validationRequired) {
      setValidationData(null);
      setValidationError(null);
      setValidating(false);
      return;
    }

    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    const trimmedLength = accountValue.trim().length;

    if (trimmedLength >= minAccountLength) {
      validationTimeoutRef.current = setTimeout(() => {
        performValidation();
      }, 1500);
    } else {
      setValidationData(null);
      setValidationError(null);
      setValidating(false);
      currentValidationRequestRef.current = null;
    }

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [accountValue, notifyNumber, amount, selectedAddonCode, payUsingReferenceNumber, performValidation, minAccountLength, validationRequired]);

  const handleContinue = () => {
    const amountValue = parseFloat(amount);
    const billAmount = resolveDisplayBillAmount(validationData, amount, isFixedAmount);

    if (product && country && service && provider) {
      navigate(ROUTES.PAYMENT, {
        state: {
          country,
          service,
          provider,
          product,
          accountValue,
          primaryFieldName,
          notifyNumber: notifyNumber.trim() || null,
          amount: amountValue,
          selectedAddon: selectedAddon || null,
          payUsingReferenceNumber: Boolean(payUsingReferenceNumber),
          validationData: validationData
            ? { ...validationData, BillAmount: billAmount ?? validationData.BillAmount }
            : null,
        },
      });
    }
  };

  if (!product || !country || !service || !provider) {
    return null;
  }

  const amountValue = parseFloat(amount);
  const hasValidAmount = amount && !isNaN(amountValue) && amountValue > 0;
  const trimmedAccount = accountValue.trim();
  const hasValidAccount = trimmedAccount.length > 0;
  const isAccountCompleteEnough = trimmedAccount.length >= minAccountLength;
  const isValidationSuccessful = validationData && validationData.Status === 'VALIDATED';
  const displayBillAmount = resolveDisplayBillAmount(validationData, amount, isFixedAmount);
  const chargeBreakdown = getChargeBreakdown(validationData);
  const showCharges = shouldDisplayCharges(product, validationData);
  const paymentAmountDisplay =
    showCharges && chargeBreakdown?.totalAmount > 0
      ? String(chargeBreakdown.totalAmount)
      : amount;
  const hasValidationFailed =
    validationRequired &&
    isAccountCompleteEnough &&
    !validating &&
    !isValidationSuccessful &&
    validationError;
  const canContinue = hasValidAccount && hasValidAmount;

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header title={`Enter ${fieldLabel}`} showBackButton={true} />

        {/* Main Content - Scrollable */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-32 overflow-y-auto border-x border-gray-200">
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

          {showReferenceToggle && (
            <Card className="mb-4">
              <p className="text-sm font-medium text-gray-800 mb-3">How are you paying?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="payMode"
                    checked={!payUsingReferenceNumber}
                    onChange={() => setPayUsingReferenceNumber(false)}
                  />
                  Account / membership number
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="payMode"
                    checked={payUsingReferenceNumber}
                    onChange={() => setPayUsingReferenceNumber(true)}
                  />
                  Reference number
                </label>
              </div>
            </Card>
          )}

          {showAddOns && (
            <Card className="mb-4">
              <p className="text-sm font-medium text-gray-800 mb-1">Optional add-on</p>
              <p className="text-xs text-gray-500 mb-3">Choose none or one add-on</p>
              <div className="space-y-2">
                <label className="flex items-center justify-between gap-2 text-sm text-gray-700 p-2 rounded border border-gray-200">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dstvAddon"
                      checked={!selectedAddonCode}
                      onChange={() => setSelectedAddonCode('')}
                    />
                    No add-on
                  </span>
                </label>
                {productAddOns.map((addon) => (
                  <label
                    key={addon.Code}
                    className="flex items-center justify-between gap-2 text-sm text-gray-700 p-2 rounded border border-gray-200"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <input
                        type="radio"
                        name="dstvAddon"
                        checked={selectedAddonCode === addon.Code}
                        onChange={() => setSelectedAddonCode(addon.Code)}
                      />
                      <span className="truncate">{addon.Name}</span>
                    </span>
                    <span className="flex-shrink-0 font-medium">
                      {currency} {Number(addon.Price || 0).toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* Account Input Field */}
          <Card className="mb-4">
            <InputField
              ref={accountInputRef}
              type="text"
              label={fieldLabel}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              value={accountValue}
              onChange={(e) => {
                cursorPositionRef.current = e.target.selectionStart;
                setAccountValue(e.target.value);
              }}
              onFocus={handleAccountInputFocus}
              onBlur={handleAccountInputBlur}
              error={hasValidationFailed ? validationError : null}
              loading={validating}
              required
            />
            
            {validationRequired && validating && (
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Icon name="refresh" size={16} className="text-[#faa819] animate-spin mr-2" />
                Validating account...
              </div>
            )}
          </Card>

          {showNotifyField && (
            <Card className="mb-4">
              <InputField
                type="tel"
                label="Notification number"
                placeholder="Enter mobile number for token delivery"
                value={notifyNumber}
                onChange={(e) => setNotifyNumber(e.target.value)}
              />
            
            </Card>
          )}

          {/* Validation Success Display */}
          {validationRequired && validationData && validationData.DisplayData && validationData.DisplayData.length > 0 && (
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

              {/* Bill Amount — VAS response or payment amount for variable products */}
              {displayBillAmount !== null && (
                <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
                  {showCharges && chargeBreakdown ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Principal:</span>
                        <span className="text-sm text-gray-800">
                          {currency} {chargeBreakdown.principalAmount.toFixed(2)}
                        </span>
                      </div>
                      {chargeBreakdown.billerCharge > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">Biller charge:</span>
                          <span className="text-sm text-gray-800">
                            {currency} {chargeBreakdown.billerCharge.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {chargeBreakdown.taxCharge > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">Tax:</span>
                          <span className="text-sm text-gray-800">
                            {currency} {chargeBreakdown.taxCharge.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Total amount:</span>
                        <span className="text-sm font-semibold text-green-700">
                          {currency} {chargeBreakdown.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Bill Amount:</span>
                      <span className="text-sm font-semibold text-green-700">
                        {currency} {displayBillAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Show charges even when DisplayData is empty but calculations exist */}
          {validationRequired &&
            isValidationSuccessful &&
            showCharges &&
            chargeBreakdown &&
            !(validationData?.DisplayData?.length > 0) && (
              <Card className="mb-4" style={{ backgroundColor: colors.state.successLight, borderColor: colors.state.success }}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Principal:</span>
                    <span className="text-sm text-gray-800">
                      {currency} {chargeBreakdown.principalAmount.toFixed(2)}
                    </span>
                  </div>
                  {chargeBreakdown.billerCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Biller charge:</span>
                      <span className="text-sm text-gray-800">
                        {currency} {chargeBreakdown.billerCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {chargeBreakdown.taxCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Tax:</span>
                      <span className="text-sm text-gray-800">
                        {currency} {chargeBreakdown.taxCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Total amount:</span>
                    <span className="text-sm font-semibold text-green-700">
                      {currency} {chargeBreakdown.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

          {/* Amount Input Field — show TotalAmount when charges apply (what customer pays) */}
          <Card className="mb-4">
            <InputField
              type="number"
              label="Payment Amount"
              placeholder={isFixedAmount ? "Fixed amount" : `Enter amount (${currency})`}
              value={paymentAmountDisplay}
              onChange={(e) => {
                if (!isFixedAmount && !showCharges) {
                  setAmount(e.target.value);
                }
              }}
              disabled={isFixedAmount || showCharges}
              required
            />
            
            {/* Amount limits display */}
            {!showCharges && (minAmount > 0 || maxAmount > 0) && (
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
            
            {showCharges && chargeBreakdown ? (
              <div className="mt-2 text-xs text-gray-500">
                You will be charged the total ({currency} {chargeBreakdown.totalAmount.toFixed(2)}).
                Principal {currency} {chargeBreakdown.principalAmount.toFixed(2)} is sent to the biller.
              </div>
            ) : (
              isFixedAmount && productPrice > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Fixed amount for this product
                </div>
              )
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
          className="fixed bottom-0 left-0 right-0 bg-white pb-6 z-40"
        >
          <div className="max-w-md mx-auto px-4 pt-4">
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

