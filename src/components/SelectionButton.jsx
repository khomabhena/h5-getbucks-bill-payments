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
        rounded-lg border-2 transition-all duration-200 text-left
        ${selected
          ? 'border-[#faa819] bg-[#f7f2ec]'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className="flex flex-col items-center space-y-2">
        {icon && (
          <div className={selected ? 'text-[#faa819]' : 'text-gray-600'}>
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
        <span className={`font-semibold text-center ${selected ? 'text-[#faa819]' : 'text-gray-700'}`}>
          {children}
        </span>
      </div>
    </button>
  );
};

export default SelectionButton;

