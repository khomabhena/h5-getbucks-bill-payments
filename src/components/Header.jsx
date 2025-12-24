import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../data/colors';
import Icon from './Icon';

/**
 * Reusable Header Component
 * Mobile-first header with back button and title
 */
const Header = ({ 
  title, 
  showBackButton = false, 
  onBack = null,
  rightAction = null,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 ${className}`}
      style={{ backgroundColor: colors.background.secondary }}
    >
      <div className="px-4 py-3 flex items-center justify-between max-w-md mx-auto relative">
        {/* Left: Back Button */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="absolute left-0 p-2 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#faa819] focus:ring-offset-2 z-10"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={24} className="text-gray-700" />
          </button>
        )}

        {/* Title - Centered */}
        <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">
          {title}
        </h1>

        {/* Right: Optional Action */}
        {rightAction && (
          <div className="absolute right-0 flex-shrink-0 z-10">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

