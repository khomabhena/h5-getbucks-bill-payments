// Getbucks Bank Brand Colors
// Primary: #faa819 (Orange/Gold)
// Background: #f7f2ec (Warm Beige/Cream)

export const colors = {
  // App primary colors - Getbucks Bank Brand
  app: {
    primary: '#faa819',           // Getbucks Orange/Gold (Primary Brand Color)
    primaryLight: '#fdd085',      // Light Orange/Gold
    primaryDark: '#d6890a',       // Dark Orange/Gold
    primaryDarker: '#b8730a',     // Darker Orange/Gold
    secondary: '#2c3e50',         // Dark Blue-Grey (for text/accents)
  },

  // Text colors
  text: {
    primary: '#2c3e50',          // Dark Blue-Grey (main text)
    secondary: '#5a6c7d',        // Medium Grey
    tertiary: '#8b9aab',         // Light Grey
    inverse: '#ffffff',           // White text
    black: '#1a1a1a',            // Near black
    button: '#ffffff',            // White text on orange buttons
  },

  // Background colors
  background: {
    primary: '#ffffff',           // White background
    secondary: '#f7f2ec',         // Warm Beige/Cream (Brand Background)
    tertiary: '#faf8f5',         // Very light beige
    gray: {
      50: '#f7f2ec',             // Warm Beige (Brand Background)
      100: '#ede5d8',            // Light beige
      200: '#d4c9b8',            // Medium beige
    },
    gradient: {
      orange: 'from-#faa819 to-#d6890a',      // Getbucks orange gradient
      warm: 'from-#f7f2ec to-#ffffff',       // Warm to white gradient
    }
  },

  // Border colors
  border: {
    primary: '#e5ddd0',          // Light beige border
    secondary: '#d4c9b8',        // Medium beige border
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

