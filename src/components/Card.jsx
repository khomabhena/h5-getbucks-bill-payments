import React from 'react';

/**
 * Card Component - Consistent card styling
 * Follows the app's design system
 */
const Card = ({ 
  children, 
  className = '', 
  padding = 'p-4 sm:p-6',
  margin = 'mb-6',
  onClick = null
}) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-200';
  const interactiveStyles = onClick ? 'cursor-pointer transition-all touch-manipulation' : '';
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={`${baseStyles} ${padding} ${margin} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Card;

