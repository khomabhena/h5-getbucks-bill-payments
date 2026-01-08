import React from 'react';
import { colors } from '../data/colors';
import { Icon } from './index';
import { getDisplayIdentifierLabel } from '../utils/identifierLabel';

/**
 * Product Card Component
 * Displays a single product option with detailed information and selection state
 */
const ProductCard = ({ 
  product, 
  selected = false, 
  onClick,
  service,
  provider,
  className = ''
}) => {
  const {
    Name: name,
    Price: price,
    Currency: currency = 'USD',
    Description: description,
    Amount: amount,
    MinimumAmount: minAmount = 0,
    MaximumAmount: maxAmount = 0,
    CreditPartyIdentifiers: creditPartyIdentifiers,
    BalanceAvailable: balanceAvailable,
    Reversible: reversible
  } = product;

  const displayCurrency = (currency || 'USD').toUpperCase();
  const hasAmountLimits = minAmount > 0 || maxAmount > 0;
  const amountsEqual = minAmount > 0 && maxAmount > 0 && Math.abs(minAmount - maxAmount) < 0.01;
  
  // Get account identifier needed
  const accountIdentifier = getDisplayIdentifierLabel(
    creditPartyIdentifiers?.[0]?.Title || creditPartyIdentifiers?.[0]?.Name,
    {
      serviceName: service?.Name,
      providerName: provider?.Name || provider?.name,
      productName: name
    }
  );

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left transition-all duration-200
        bg-white border rounded-lg
        ${selected ? 'border-[#faa819]' : 'border-gray-200'}
        ${className}
      `}
    >
      {/* Product Name */}
      <div className=" flex items-center justify-between p-4 pb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2">
          {name || 'Product'}
        </h3>
        <span className="font-bold text-gray-900">{displayCurrency}</span>
      </div>
    
      {/* Description */}
      {description && (
        <p className="text-xs text-gray-600 px-4 mb-3 line-clamp-2">
          {description}
        </p>
      )}
      
      {/* Currency */}
      <div className="flex items-center justify-between text-sm px-4">
        
      </div>
      
      {/* Payment Type */}
      <div className="flex items-center justify-between text-sm px-4 pb-4">
        <span className="text-gray-500">
          {hasAmountLimits ? (amountsEqual ? 'Amount' : 'Amount Range') : 'Payment Type'}
        </span>
        <span className="" style={{ color: colors.app.primaryDark }}>
          {hasAmountLimits ? (
            amountsEqual ? (
              `${displayCurrency} ${minAmount.toFixed(2)}`
            ) : (
              minAmount > 0 && maxAmount > 0
                ? `${displayCurrency} ${minAmount.toFixed(2)} - ${displayCurrency} ${maxAmount.toFixed(2)}`
                : minAmount > 0
                ? `Min: ${displayCurrency} ${minAmount.toFixed(2)}`
                : `Max: ${displayCurrency} ${maxAmount.toFixed(2)}`
            )
          ) : (
            'Variable Amount'
          )}
        </span>
      </div>
      
      {/* You'll need */}
      <div className="flex hidden items-center justify-between text-sm px-4 pt-2 mt-2 border-t border-gray-200">
        <span className="text-gray-500">You'll need:</span>
        <span className="font-semibold text-right max-w-[60%] break-words" style={{ color: colors.app.primaryDark }}>
          {accountIdentifier}
        </span>
      </div>
      
      {/* Additional Info Badges */}
      {(balanceAvailable || reversible) && (
        <div className="flex flex-wrap gap-2 px-4 mt-3 pb-4">
          {balanceAvailable && (
            <span className="inline-flex items-center text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              <Icon name="account_balance" size={14} className="mr-1" />
              Balance Check
            </span>
          )}
          {reversible && (
            <span className="inline-flex items-center text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              <Icon name="undo" size={14} className="mr-1" />
              Reversible
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default ProductCard;

