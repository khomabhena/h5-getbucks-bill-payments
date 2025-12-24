/**
 * Mode Detection Utility
 * Detects the current operating mode: iframe, native, or standalone
 */

/**
 * Get the current mode from URL parameters
 * @returns {string} 'iframe' | 'native' | 'standalone'
 */
export const getMode = () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  
  if (mode === 'iframe' || mode === 'native') {
    return mode;
  }
  
  // Auto-detect iframe mode
  if (window.self !== window.top) {
    return 'iframe';
  }
  
  // Check for native SuperApp bridge
  if (window.payment && typeof window.payment === 'object') {
    return 'native';
  }
  
  // Default to standalone
  return 'standalone';
};

/**
 * Get URL parameters
 * @returns {Object} Parsed URL parameters
 */
export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    token: params.get('token'),
    mode: params.get('mode'),
    returnUrl: params.get('returnUrl'),
    // Add any other parameters you need
  };
};

/**
 * Check if running in iframe
 * @returns {boolean}
 */
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top, we're likely in an iframe
    return true;
  }
};

/**
 * Get parent origin (if in iframe)
 * @returns {string|null}
 */
export const getParentOrigin = () => {
  try {
    if (isInIframe() && document.referrer) {
      const url = new URL(document.referrer);
      return url.origin;
    }
  } catch (e) {
    console.warn('Could not determine parent origin:', e);
  }
  return null;
};

export default {
  getMode,
  getUrlParams,
  isInIframe,
  getParentOrigin
};

