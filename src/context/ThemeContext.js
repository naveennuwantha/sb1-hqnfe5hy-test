import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a mock AsyncStorage for browser environments
const AsyncStorage = {
  getItem: async (key) => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize with light mode as default
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // If no theme is saved, set and save light theme as default
        await AsyncStorage.setItem('theme', 'light');
        setIsDarkMode(false);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to light theme if there's an error
      setIsDarkMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Return a loading state or skeleton if still loading the theme
  if (isLoading) {
    return <>{children}</>; // Just render children with default theme until loaded
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 