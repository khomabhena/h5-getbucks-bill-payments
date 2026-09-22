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
      <div className={`flex w-full min-w-0 ${icon ? 'flex-col items-center space-y-2' : iconName ? 'flex-col items-center space-y-2' : 'flex-row items-center'}`}>
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
        <span className={`font-semibold w-full min-w-0 text-center whitespace-normal break-words leading-snug ${selected ? 'text-[#faa819]' : 'text-gray-700'}`}>
          {children}
        </span>
      </div>
    </button>
  );
};

export default SelectionButton;

