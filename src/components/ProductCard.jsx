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
        w-full text-left relative overflow-hidden
        rounded-xl transition-all duration-200 active:scale-[0.98]
        ${selected
          ? 'bg-white shadow-lg border-2 border-[#faa819]'
          : 'bg-white shadow-sm border-2 border-gray-200 hover:shadow-md hover:border-gray-300'
        }
        ${className}
      `}
      style={selected ? {
        boxShadow: '0 4px 12px rgba(250, 168, 25, 0.15)'
      } : {}}
    >
      {/* Left Accent Border */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
          selected ? 'bg-[#faa819]' : 'bg-transparent'
        }`}
      />
      
      {/* Content */}
      <div className="p-4 pl-5">
        {/* Product Name with Selection Indicator */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 flex-1 pr-2">
            {name || 'Product'}
          </h3>
          {selected && (
            <div className="flex-shrink-0 ml-2">
              <div 
                className="rounded-full p-1.5"
                style={{ backgroundColor: colors.app.primaryLight }}
              >
                <Icon name="check_circle" size={20} style={{ color: colors.app.primaryDark }} />
              </div>
            </div>
          )}
        </div>
      
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Info Grid */}
        <div className="space-y-2 mb-3">
          {/* Currency & Amount */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: colors.background.tertiary }}>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Currency</div>
              <div className="text-sm font-semibold text-gray-900">{displayCurrency}</div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-xs text-gray-500 mb-1">
                {hasAmountLimits ? (amountsEqual ? 'Amount' : 'Amount Range') : 'Payment Type'}
              </div>
              <div className="text-sm font-bold" style={{ color: colors.app.primaryDark }}>
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
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Identifier Needed */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg border" style={{ 
          borderColor: selected ? colors.app.primaryLight : colors.border.primary,
          backgroundColor: selected ? colors.app.primaryLight + '20' : colors.background.tertiary
        }}>
          <span className="text-xs font-medium text-gray-600">You'll need:</span>
          <span className="text-xs font-semibold text-right max-w-[60%] break-words" style={{ color: colors.app.primaryDark }}>
            {accountIdentifier}
          </span>
        </div>
        
        {/* Additional Info Badges */}
        {(balanceAvailable || reversible) && (
          <div className="flex flex-wrap gap-2 mt-3">
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
      </div>
    </button>
  );
};

export default ProductCard;

