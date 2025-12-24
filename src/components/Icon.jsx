import React from 'react';

/**
 * Icon Component - Uses Google Material Icons
 * Wrapper for Material Icons font icons
 */
const Icon = ({ 
  name, 
  className = '', 
  size = 24,
  ...props 
}) => {
  return (
    <span 
      className={`material-icons ${className}`}
      style={{ fontSize: size, ...props.style }}
      {...props}
    >
      {name}
    </span>
  );
};

export default Icon;

