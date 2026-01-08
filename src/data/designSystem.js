/**
 * Design System
 * Centralized design tokens for GetBucks Bill Payments app
 */

export const designSystem = {
  colors: {
    primary: '#faa819',
    background: '#f7f2ec',
    text: {
      default: '#1f2937', // gray-900
      secondary: '#4b5563', // gray-600
      light: '#6b7280', // gray-500
      inverse: '#ffffff',
      success: '#10b981', // green-500
      error: '#ef4444', // red-500
    },
    border: {
      default: '#e5e7eb', // gray-200
      focus: '#faa819',
      error: '#fca5a5', // red-300
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: 'sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: '700' }, // text-4xl font-bold
    h2: { fontSize: '1.5rem', fontWeight: '700' }, // text-2xl font-bold
    body: { fontSize: '1rem', lineHeight: '1.5' }, // text-base
    small: { fontSize: '0.875rem' }, // text-sm
    xsmall: { fontSize: '0.75rem' }, // text-xs
  },
  componentStyles: {
    card: 'bg-white rounded-xl shadow-sm border border-gray-200',
    button: {
      primary: 'bg-[#faa819] text-white hover:bg-[#d6890a]',
      secondary: 'bg-[#f7f2ec] text-[#2c3e50] hover:bg-[#ede5d8]',
    },
    input: {
      base: 'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50',
    },
  },
};

