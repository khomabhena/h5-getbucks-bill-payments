// GetBucks Bank Brand Colors
// Primary: #faa819 (Orange/Gold)
// Background: #fafafa (Whitish/Light Gray)

export const colors = {
  // App primary colors - GetBucks Bank Brand
  app: {
    primary: '#faa819',           // GetBucks Orange/Gold (Primary Brand Color)
    primaryLight: '#fdd085',      // Light Orange/Gold
    primaryDark: '#d6890a',       // Dark Orange/Gold
    primaryDarker: '#b8730a',     // Darker Orange/Gold
    secondary: '#2c3e50',         // Dark Blue-Grey (for text/accents)
  },

  // Text colors
  text: {
    primary: '#1a1a1a',          // Near black (main text) - better contrast on white
    secondary: '#4b5563',        // Dark gray (body text)
    tertiary: '#6b7280',         // Medium gray (muted text)
    inverse: '#ffffff',           // White text
    black: '#1a1a1a',            // Near black
    button: '#ffffff',            // White text on orange buttons
  },

  // Background colors
  background: {
    primary: '#ffffff',           // White background
    secondary: '#fafafa',         // Whitish/Light gray background
    tertiary: '#f5f5f5',         // Very light gray
    selected: '#fff7ed',          // Very light orange/amber for selected items
    gray: {
      50: '#fafafa',             // Whitish background
      100: '#f5f5f5',            // Very light gray
      200: '#e5e5e5',            // Light gray
    },
    gradient: {
      orange: 'from-#faa819 to-#d6890a',      // GetBucks orange gradient
      warm: 'from-#fafafa to-#ffffff',       // Whitish to white gradient
    }
  },

  // Border colors
  border: {
    primary: '#e5e7eb',          // Light gray border
    secondary: '#d1d5db',        // Medium gray border
    accent: '#faa819',          // Orange accent border
    focus: '#faa819',           // Orange focus border
    error: '#ef4444',           // Red border
    success: '#10b981',         // Green border
  },

  // State colors
  state: {
    success: '#10b981',          // Green for success
    error: '#ef4444',            // Red for error
    warning: '#f59e0b',          // Amber for warning
    info: '#3b82f6',             // Blue for info
    successLight: '#d1fae5',     // Light green background
    errorLight: '#fee2e2',       // Light red background
    warningLight: '#fef3c7',     // Light amber background
    infoLight: '#dbeafe',        // Light blue background
  },

  // Ring/Focus colors
  ring: {
    primary: '#faa819',          // Orange focus ring
    error: '#ef4444',            // Red focus ring
  }
};

export default colors;

