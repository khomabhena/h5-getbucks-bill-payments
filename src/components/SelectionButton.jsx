import React from 'react';
import { colors } from '../data/colors';
import { Icon } from './index';

/**
 * Selection Button Component
 * For selecting countries, services, providers, etc.
 */
const SelectionButton = ({ 
  children, 
  onClick, 
  selected, 
  iconName,
  icon,
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'p-2 text-xs',
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-5 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`
        rounded-lg border transition-all duration-200 text-left
        ${selected
          ? 'border-[#faa819] bg-gray-100'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className={`flex ${icon ? 'flex-row items-center' : iconName ? 'flex-col items-center' : 'flex-row items-center'} ${icon ? 'space-x-2' : iconName ? 'space-y-2' : ''}`}>
        {icon && (
          <div className={`flex-shrink-0 ${selected ? 'text-[#faa819]' : 'text-gray-600'}`}>
            {icon}
          </div>
        )}
        {iconName && (
          <Icon 
            name={iconName} 
            size={size === 'xs' ? 20 : size === 'sm' ? 24 : 28}
            className={selected ? 'text-[#faa819]' : 'text-gray-600'}
          />
        )}
        <span className={`font-semibold ${icon ? 'text-left' : 'text-center'} ${selected ? 'text-[#faa819]' : 'text-gray-700'} ${icon ? 'flex-1' : ''}`}>
          {children}
        </span>
      </div>
    </button>
  );
};

export default SelectionButton;

