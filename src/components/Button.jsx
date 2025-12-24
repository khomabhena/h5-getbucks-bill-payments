import React from 'react';
import { colors } from '../data/colors';
import Icon from './Icon';

/**
 * Reusable Button Component
 * Mobile-first, accessible, with loading and disabled states
 */
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  const baseStyles = 'font-semibold shadow-lg rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: `text-white ${disabled ? 'bg-gray-400' : 'bg-[#faa819] hover:bg-[#d6890a]'} focus:ring-[#faa819]`,
    secondary: `text-[#2c3e50] ${disabled ? 'bg-gray-200' : 'bg-[#f7f2ec] hover:bg-[#ede5d8]'} focus:ring-[#faa819]`,
    outline: `text-[#faa819] border-2 ${disabled ? 'border-gray-300' : 'border-[#faa819] hover:bg-[#faa819] hover:text-white'} focus:ring-[#faa819]`,
    ghost: `text-[#faa819] ${disabled ? 'text-gray-400' : 'hover:bg-[#f7f2ec]'} focus:ring-[#faa819]`
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <Icon name="refresh" size={16} className="animate-spin -ml-1 mr-2" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

