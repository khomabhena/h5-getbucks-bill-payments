import React from 'react';
import { colors } from '../data/colors';
import Icon from './Icon';

/**
 * Reusable Input Field Component
 * Mobile-first, accessible, with error states and icons
 */
const InputField = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error = null,
  loading = false,
  disabled = false,
  required = false,
  icon = null,
  rightIcon = null,
  className = '',
  inputClassName = '',
  labelClassName = '',
  autoFocus = false,
  maxLength = null,
  onFocus = null,
  ...props
}) => {
  const hasError = error !== null && error !== '';
  const inputId = `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium mb-2 ${hasError ? 'text-red-600' : 'text-gray-700'} ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled || loading}
          required={required}
          autoFocus={autoFocus}
          maxLength={maxLength}
          {...props}
          className={`
            w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            text-sm sm:text-base
            touch-manipulation
            ${icon ? 'pl-9 sm:pl-10' : ''}
            ${rightIcon ? 'pr-9 sm:pr-10' : ''}
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' 
              : 'border-gray-200 focus:border-[#faa819] focus:ring-[#faa819] bg-white'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${inputClassName}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightIcon}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Icon name="refresh" size={20} className="text-[#faa819] animate-spin" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 flex items-center"
          role="alert"
        >
          <Icon name="error" size={16} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;

