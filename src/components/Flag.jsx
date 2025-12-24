import React from 'react';

/**
 * Flag component that displays country flags using images
 * Falls back to emoji if image fails to load
 */
const Flag = ({ countryCode, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Convert country code to lowercase for flag CDN
  const flagCode = countryCode?.toLowerCase() || '';

  // Flag CDN URL (using flagcdn.com - free, no API key needed)
  const flagImageUrl = `https://flagcdn.com/w40/${flagCode}.png`;
  
  // Fallback emoji (will be used if image fails)
  const getEmojiFlag = (code) => {
    // Map country codes to flag emojis
    const flagEmojis = {
      'ZW': '🇿🇼', 'KE': '🇰🇪', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'GH': '🇬🇭',
      'GB': '🇬🇧', 'US': '🇺🇸', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪',
      'FR': '🇫🇷', 'IN': '🇮🇳', 'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷',
      'BR': '🇧🇷', 'MX': '🇲🇽', 'EG': '🇪🇬', 'MA': '🇲🇦', 'TN': '🇹🇳',
      'SN': '🇸🇳', 'CI': '🇨🇮', 'CM': '🇨🇲', 'SG': '🇸🇬', 'TH': '🇹🇭',
      'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'MY': '🇲🇾', 'TW': '🇹🇼',
      'BW': '🇧🇼', 'MT': '🇲🇹', 'ZM': '🇿🇲', 'RW': '🇷🇼', 'HK': '🇭🇰',
    };
    return flagEmojis[code] || '🏳️';
  };

  const [imageError, setImageError] = React.useState(false);

  if (!countryCode) {
    return null;
  }

  // If image failed to load, show emoji fallback
  if (imageError) {
    return (
      <span className={`emoji-flag ${textSizes[size]} ${className}`}>
        {getEmojiFlag(countryCode)}
      </span>
    );
  }

  return (
    <img
      src={flagImageUrl}
      alt={`${countryCode} flag`}
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default Flag;
