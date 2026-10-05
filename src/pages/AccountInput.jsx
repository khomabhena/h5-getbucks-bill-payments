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
import { formatValidationMessage, productRequiresValidation } from '../utils/productValidation';
import {
  cleanExtraValues,
  getExtraFieldErrors,
  getExtraIdentifierFields,
  getExtraValuesFromValidation,
  getPaymentCodeConfig,
} from '../utils/billIdentifierFields';
import { getServiceIconName } from '../utils/serviceIcons';
import {
  buildSelectedProductAddOns,
  getChargeBreakdown,
  getProductAddOns,
  resolveDebitAmount,
  resolveServiceCharge,
  resolveValidateAmount,
  resolveValidationAmount,
  shouldDisplayCharges,
  supportsDstvAddOns,
  supportsPayUsingReferenceNumber,
} from '../utils/billExtras';
import { getBillerDetailRows } from '../utils/billerDetails';

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

function getValidationErrorMessage(error, accountValue) {
  if (error?.userMessage) return error.userMessage;

  const isNetworkError =
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('NetworkError') ||
    error?.name === 'TypeError';

  if (isNetworkError) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  const resultMessage =
    error?.responseData?.details?.errors?.['CustomerDetails.EmailAddress']?.[0] ||
    error?.responseData?.ResultMessage ||
    error?.message;
  return formatValidationMessage(resultMessage, accountValue);
}

const AccountInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, service, provider, product: initialProduct, packageOptions } =
    location.state || {};
  // DSTV: smartcard is validated first, then the customer picks a package (each package is a product).
  const isPackageFlow = Array.isArray(packageOptions) && packageOptions.length > 1;
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const product =
    (isPackageFlow && packageOptions.find((option) => option.Id === selectedPackageId)) ||
    initialProduct;

  const [accountValue, setAccountValue] = useState('');
  const [notifyNumber, setNotifyNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAddonCode, setSelectedAddonCode] = useState('');
  const [payUsingReferenceNumber, setPayUsingReferenceNumber] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [extraValues, setExtraValues] = useState({});
  const [paymentCode, setPaymentCode] = useState('');
  // Product / amount / add-on the current validationData was quoted for (charges depend on them).
  const [validatedQuote, setValidatedQuote] = useState(null);
  const [confirmingAmount, setConfirmingAmount] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const currentValidationRequestRef = useRef(null);
  const autoFilledValuesRef = useRef({});
  const customerDetailsRef = useRef(resolveCustomerDetailsForVas());

  const showNotifyField = productRequiresNotifyNumber(product);
  const validationRequired = productRequiresValidation(product);
  const showAddOns = supportsDstvAddOns(product);
  const productAddOns = getProductAddOns(product);
  const showReferenceToggle = supportsPayUsingReferenceNumber(product);
  const extraFields = getExtraIdentifierFields(product);
  const paymentCodeConfig = getPaymentCodeConfig(product);
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

  // Reset add-on / reference mode / student details when product changes
  useEffect(() => {
    setSelectedAddonCode('');
    setPayUsingReferenceNumber(false);
    setExtraValues({});
    autoFilledValuesRef.current = {};
    setPaymentCode('');
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
  const paymentCodeRef = useRef(paymentCode);

  useEffect(() => {
    paymentCodeRef.current = paymentCode;
  }, [paymentCode]);
  
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

  /**
   * Fill student details the biller returned on validation. Values the customer typed are kept;
   * values we filled from an earlier validation are replaced.
   */
  const applyValidationPrefill = useCallback(
    (validationResponse) => {
      const prefill = getExtraValuesFromValidation(product, validationResponse);
      const previous = autoFilledValuesRef.current;
      autoFilledValuesRef.current = prefill;

      setExtraValues((prev) => {
        const next = { ...prev };
        for (const [name, value] of Object.entries(previous)) {
          if (next[name] === value && !(name in prefill)) delete next[name];
        }
        for (const [name, value] of Object.entries(prefill)) {
          const current = String(next[name] ?? '').trim();
          if (!current || current === previous[name]) next[name] = value;
        }
        return next;
      });
    },
    [product]
  );

  /**
   * ValidatePayment for the current product / account at the given amount.
   * Resolves to the VAS response; rejects with a user-facing message on failure.
   */
  const requestValidation = useCallback(
    async (amountValue) => {
      const accountTrimmed = accountValueRef.current.trim();
      const customerDetails = customerDetailsRef.current;

      const validationPayload = {
        RequestId: generateRequestId(),
        Amount: amountValue,
        Recipient: buildPaymentRecipient({
          accountValue: accountTrimmed,
          notifyNumber: notifyNumberRef.current,
          primaryFieldName,
          customerDetails,
          product,
        }),
        CreditPartyIdentifiers: buildCreditPartyIdentifiers({
          product,
          accountValue: accountTrimmed,
          customerDetails,
          notifyNumber: notifyNumberRef.current,
          primaryFieldName,
          stage: 'validate',
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

      if (paymentCodeRef.current) {
        validationPayload.PaymentCode = paymentCodeRef.current;
      }

      console.log('Validating payment with payload:', validationPayload);
      const result = await appleTreeService.validatePayment(validationPayload);

      if (result.success && result.data?.Status === 'VALIDATED') {
        return result.data;
      }

      const upstreamMessage =
        result.data?.ResultMessage ||
        result.data?.details?.ResultMessage ||
        result.data?.error ||
        result.error;
      throw Object.assign(new Error(upstreamMessage || 'Validation failed'), {
        userMessage: formatValidationMessage(upstreamMessage, accountTrimmed),
      });
    },
    [product, currency, primaryFieldName]
  );

  const performValidation = useCallback(async () => {
    if (!validationRequired) {
      return;
    }

    const currentAccountValue = accountValueRef.current;
    if (!currentAccountValue.trim() || !product) {
      return;
    }

    if (currentAccountValue.trim().length < minAccountLength) {
      return;
    }

    // The customer may not have entered an amount yet; VAS rejects 0.
    const amountValue = resolveValidationAmount(
      product,
      amountRef.current,
      selectedAddonRef.current
    );
    const attemptId = generateRequestId();
    currentValidationRequestRef.current = attemptId;

    setValidating(true);
    setValidationError(null);
    setQuoteError(null);

    try {
      const data = await requestValidation(amountValue);
      if (currentValidationRequestRef.current !== attemptId) return;

      setValidationData(data);
      setValidatedQuote({
        productId: product.Id || product.id,
        amount: amountValue,
        addonCode: selectedAddonRef.current?.Code || '',
      });

      applyValidationPrefill(data);
    } catch (error) {
      console.error('Validation error:', error);
      if (currentValidationRequestRef.current !== attemptId) return;

      setValidationError(getValidationErrorMessage(error, currentAccountValue));
      setValidationData(null);
      setValidatedQuote(null);
    } finally {
      if (currentValidationRequestRef.current === attemptId) {
        setValidating(false);
      }
    }
  }, [product, minAccountLength, validationRequired, requestValidation, applyValidationPrefill]);

  // A different account invalidates the previous result; the user re-validates via the button.
  // Amount / package / add-on changes keep the account validation and are re-quoted on Continue.
  useEffect(() => {
    currentValidationRequestRef.current = null;
    setValidationData(null);
    setValidatedQuote(null);
    setValidationError(null);
    setQuoteError(null);
    setValidating(false);
  }, [accountValue, notifyNumber, payUsingReferenceNumber, paymentCode]);

  useEffect(() => {
    setQuoteError(null);
  }, [amount, selectedAddonCode, selectedPackageId]);

  const handleExtraValueChange = (fieldName, value) => {
    setExtraValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleContinue = async () => {
    if (!product || !country || !service || !provider) return;

    const amountValue = parseFloat(amount);
    let finalValidation = validationData;

    // Charges and the RequestId used by PostPayment must match the amount actually being paid.
    if (validationRequired && isValidationSuccessful && !isQuoteCurrent) {
      setConfirmingAmount(true);
      setQuoteError(null);
      try {
        finalValidation = await requestValidation(amountValue);
        setValidationData(finalValidation);
        setValidatedQuote({
          productId: product.Id || product.id,
          amount: amountValue,
          addonCode: selectedAddonCode || '',
        });
      } catch (error) {
        console.error('Amount confirmation error:', error);
        setQuoteError(getValidationErrorMessage(error, accountValue));
        return;
      } finally {
        setConfirmingAmount(false);
      }
    }

    const billAmount = resolveDisplayBillAmount(finalValidation, amount, isFixedAmount);

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
        extraIdentifierValues: cleanExtraValues(extraFields, extraValues),
        paymentCode: paymentCode || null,
        validationData: finalValidation
          ? { ...finalValidation, BillAmount: billAmount ?? finalValidation.BillAmount }
          : null,
      },
    });
  };

  if (!product || !country || !service || !provider) {
    return null;
  }

  const amountValue = parseFloat(amount);
  const isAmountBelowMin = minAmount > 0 && amountValue < minAmount;
  const isAmountAboveMax = maxAmount > 0 && amountValue > maxAmount;
  const hasValidAmount =
    amount && !isNaN(amountValue) && amountValue > 0 && !isAmountBelowMin && !isAmountAboveMax;
  const trimmedAccount = accountValue.trim();
  const hasValidAccount = trimmedAccount.length > 0;
  const isAccountCompleteEnough = trimmedAccount.length >= minAccountLength;
  const isValidationSuccessful = validationData && validationData.Status === 'VALIDATED';
  // validationData was quoted for this exact product / amount / add-on (otherwise re-quoted on Continue)
  const isQuoteCurrent =
    Boolean(validatedQuote) &&
    validatedQuote.productId === (product.Id || product.id) &&
    validatedQuote.addonCode === (selectedAddonCode || '') &&
    Math.abs(validatedQuote.amount - amountValue) < 0.005;
  const displayBillAmount = isQuoteCurrent
    ? resolveDisplayBillAmount(validationData, amount, isFixedAmount)
    : null;
  const chargeBreakdown = isQuoteCurrent ? getChargeBreakdown(validationData) : null;
  const showCharges = isQuoteCurrent && shouldDisplayCharges(product, validationData);
  const quotedAmount = displayBillAmount ?? amount;
  const serviceCharge = isQuoteCurrent ? resolveServiceCharge(validationData, quotedAmount, currency) : 0;
  const customerTotal = isQuoteCurrent ? resolveDebitAmount(validationData, quotedAmount, currency) : 0;
  const billerDetailRows = getBillerDetailRows(validationData);
  const showPackagePicker = isPackageFlow && isValidationSuccessful;
  const awaitingPackage = isPackageFlow && !selectedPackageId;
  const hasValidationFailed =
    validationRequired &&
    isAccountCompleteEnough &&
    !validating &&
    !isValidationSuccessful &&
    validationError;
  // Validation must have been attempted (success or failure) before continuing; a failure can still proceed.
  const hasAttemptedValidation = isValidationSuccessful || Boolean(hasValidationFailed);
  const extraFieldErrors = getExtraFieldErrors(extraFields, extraValues);
  const hasExtraFieldErrors = Object.keys(extraFieldErrors).length > 0;
  const paymentCodeMissing = Boolean(paymentCodeConfig?.required) && !paymentCode;
  const canContinue =
    hasValidAccount &&
    hasValidAmount &&
    !validating &&
    !confirmingAmount &&
    !awaitingPackage &&
    !paymentCodeMissing &&
    !hasExtraFieldErrors &&
    (!validationRequired || hasAttemptedValidation);

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

          {paymentCodeConfig && (
            <Card className="mb-4">
              <label htmlFor="paymentCode" className="block text-sm font-medium mb-2 text-gray-700">
                Payment type
                {paymentCodeConfig.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                id="paymentCode"
                value={paymentCode}
                onChange={(e) => setPaymentCode(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-[#faa819] focus:ring-[#faa819]"
              >
                <option value="">Select payment type</option>
                {paymentCodeConfig.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Card>
          )}

          {/* Account Input Field */}
          <Card className="mb-4">
            <InputField
              type="text"
              label={fieldLabel}
              placeholder={`Enter ${fieldLabel.toLowerCase()}`}
              value={accountValue}
              onChange={(e) => setAccountValue(e.target.value)}
              loading={validating}
              required
            />

            {validationRequired && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={performValidation}
                  disabled={
                    !isAccountCompleteEnough || paymentCodeMissing || validating || isValidationSuccessful
                  }
                >
                  {validating ? (
                    <span className="flex items-center justify-center">
                      <Icon name="refresh" size={16} className="animate-spin mr-2" />
                      Validating...
                    </span>
                  ) : isValidationSuccessful ? (
                    'Validated'
                  ) : (
                    `Validate ${fieldLabel.toLowerCase()}`
                  )}
                </Button>
                {!isValidationSuccessful && !hasValidationFailed && !validating && (
                  <p className="mt-1 text-xs text-gray-500">
                    {paymentCodeMissing
                      ? 'Select a payment type, then validate your details.'
                      : 'Validate your details to see the account name and amount due.'}
                  </p>
                )}
              </div>
            )}

            {hasValidationFailed && (
              <div className="mt-3 rounded-lg p-3 bg-red-50 border border-red-200">
                <div className="flex items-start space-x-2">
                  <Icon name="error" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-800">
                      We couldn't verify this {fieldLabel.toLowerCase()}
                    </p>
                    <p className="mt-0.5 text-sm text-red-700 break-words">{validationError}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {extraFields.length > 0 && (
            <Card className="mb-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">Student details</p>
              <div className="space-y-4">
                {extraFields.map((field) => {
                  const value = extraValues[field.name] ?? '';
                  const fieldError = String(value).trim() ? extraFieldErrors[field.name] : null;

                  if (field.type === 'select') {
                    return (
                      <div key={field.name}>
                        <label
                          htmlFor={`extra-${field.name}`}
                          className="block text-sm font-medium mb-2 text-gray-700"
                        >
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <select
                          id={`extra-${field.name}`}
                          value={value}
                          onChange={(e) => handleExtraValueChange(field.name, e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-[#faa819] focus:ring-[#faa819]"
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.name}>
                      <InputField
                        type="text"
                        label={field.required ? field.label : `${field.label} (optional)`}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        value={value}
                        onChange={(e) => handleExtraValueChange(field.name, e.target.value)}
                        maxLength={field.maxLength || null}
                        autoComplete={field.autoComplete}
                        error={fieldError}
                        required={field.required}
                      />
                      {field.showCounter && field.maxLength && (
                        <p className="mt-1 text-xs text-gray-500 text-right">
                          {String(value).length}/{field.maxLength}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

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
          {validationRequired && isValidationSuccessful && billerDetailRows.length > 0 && (
            <Card className="mb-4" style={{ backgroundColor: colors.state.successLight, borderColor: colors.state.success }}>
              <div className="flex items-center mb-3">
                <Icon name="check_circle" size={24} className="text-green-600 mr-2" />
                <h3 className="text-sm font-semibold text-green-800">Account Verified</h3>
              </div>
              
              <div className="space-y-2">
                {billerDetailRows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-600 mb-1">{row.label}</span>
                    <span className="text-sm text-gray-800 whitespace-pre-line">{row.value}</span>
                  </div>
                ))}
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
                      {serviceCharge > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">Service charge:</span>
                          <span className="text-sm text-gray-800">
                            {currency} {serviceCharge.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Total amount:</span>
                        <span className="text-sm font-semibold text-green-700">
                          {currency} {customerTotal.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Bill Amount:</span>
                        <span className="text-sm font-semibold text-green-700">
                          {currency} {displayBillAmount.toFixed(2)}
                        </span>
                      </div>
                      {serviceCharge > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Service charge:</span>
                            <span className="text-sm text-gray-800">
                              {currency} {serviceCharge.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Total amount:</span>
                            <span className="text-sm font-semibold text-green-700">
                              {currency} {customerTotal.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </>
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
            billerDetailRows.length === 0 && (
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
                  {serviceCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Service charge:</span>
                      <span className="text-sm text-gray-800">
                        {currency} {serviceCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Total amount:</span>
                    <span className="text-sm font-semibold text-green-700">
                      {currency} {customerTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

          {isPackageFlow && !isValidationSuccessful && (
            <p className="mb-4 text-xs text-gray-500">
              Validate your {fieldLabel.toLowerCase()} to see the available packages.
            </p>
          )}

          {showPackagePicker && (
            <Card className="mb-4">
              <p className="text-sm font-medium text-gray-800 mb-1">Choose a package</p>
              <p className="text-xs text-gray-500 mb-3">The package sets the amount to pay.</p>
              <div className="space-y-2">
                {packageOptions.map((option) => {
                  const price = Number(option.Price) || 0;
                  return (
                    <label
                      key={option.Id}
                      className="flex items-center justify-between gap-2 text-sm text-gray-700 p-2 rounded border border-gray-200"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="radio"
                          name="dstvPackage"
                          checked={selectedPackageId === option.Id}
                          onChange={() => setSelectedPackageId(option.Id)}
                        />
                        <span className="break-words">{option.Name}</span>
                      </span>
                      <span className="flex-shrink-0 font-medium">
                        {price > 0
                          ? `${option.Currency || currency} ${price.toFixed(2)}`
                          : 'Enter amount'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Card>
          )}

          {showAddOns && (!isPackageFlow || selectedPackageId) && (
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

          {/* Amount Input Field — what is sent to the biller; charges are added on top */}
          {!awaitingPackage && (
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
              {!isFixedAmount && (minAmount > 0 || maxAmount > 0) && (
                <div
                  className={`mt-2 text-xs ${
                    amount && (isAmountBelowMin || isAmountAboveMax) ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  {minAmount > 0 && maxAmount > 0 && (
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
                  You will be charged the total ({currency} {customerTotal.toFixed(2)}).
                  Principal {currency} {chargeBreakdown.principalAmount.toFixed(2)} is sent to the biller.
                </div>
              ) : isValidationSuccessful && hasValidAmount && !isQuoteCurrent ? (
                <div className="mt-2 text-xs text-gray-500">
                  Service charges and the total payable are confirmed when you continue.
                </div>
              ) : (
                isFixedAmount && productPrice > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Fixed amount for this product
                  </div>
                )
              )}

              {quoteError && (
                <div className="mt-3 rounded-lg p-3 bg-red-50 border border-red-200">
                  <p className="text-sm font-semibold text-red-800">We couldn't confirm this amount</p>
                  <p className="mt-0.5 text-sm text-red-700 break-words">{quoteError}</p>
                </div>
              )}
            </Card>
          )}

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
            {hasExtraFieldErrors || paymentCodeMissing
              ? 'Complete the student details to continue.'
              : showPackagePicker && awaitingPackage
                ? 'Choose a package to continue.'
                : 'Enter your account details to continue'}
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
              {confirmingAmount ? 'Confirming amount...' : 'Continue to Payment'}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AccountInput;

