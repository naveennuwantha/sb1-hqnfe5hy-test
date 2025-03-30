import { lightTheme, darkTheme } from '../theme/theme';
import { createTheme } from '@mui/material/styles';

// Create a proper Material UI theme using createTheme
const createMuiTheme = (baseTheme) => {
  return createTheme({
    palette: {
      mode: baseTheme === darkTheme ? 'dark' : 'light',
      primary: {
        main: baseTheme.primary,
      },
      secondary: {
        main: baseTheme.secondary,
      },
      error: {
        main: baseTheme.error,
      },
      warning: {
        main: baseTheme.warning,
      },
      success: {
        main: baseTheme.success,
      },
      background: {
        default: baseTheme.background,
        paper: baseTheme.surface,
      },
      text: {
        primary: baseTheme.text,
        secondary: baseTheme.textSecondary,
      },
      divider: baseTheme.divider,
    },
    typography: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 8,
    },
    // Add a custom object to carry over the rest of our theme properties
    customTheme: baseTheme,
  });
};

// Default theme is light theme with Material UI compatibility
export const theme = createMuiTheme(lightTheme);

/**
 * Get the appropriate theme based on user preference
 * @param {boolean} isDarkMode - Whether to use dark mode
 * @returns {Object} The theme object
 */
export const getTheme = (isDarkMode) => {
  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  return createMuiTheme(baseTheme);
};

/**
 * Create a responsive font size based on screen width
 * @param {number} size - The base size
 * @returns {string} Responsive font size
 */
export const fontSize = (size) => {
  return `${size}px`;
};

/**
 * Helper function to apply alpha to a hex color
 * @param {string} color - Hex color
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color
 */
export const withAlpha = (color, alpha) => {
  // Convert hex to rgb
  let r = 0, g = 0, b = 0;
  
  if (color.length === 4) {
    // #RGB format
    r = parseInt(color[1] + color[1], 16);
    g = parseInt(color[2] + color[2], 16);
    b = parseInt(color[3] + color[3], 16);
  } else if (color.length === 7) {
    // #RRGGBB format
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}; 