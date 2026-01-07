import React from 'react';
import { colors } from '../data/colors';

/**
 * Page Wrapper Component
 * Provides consistent page layout and background
 */
const PageWrapper = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen pt-8 ${className}`}
      style={{ backgroundColor: colors.background.secondary }}
    >
      {children}
    </div>
  );
};

export default PageWrapper;

