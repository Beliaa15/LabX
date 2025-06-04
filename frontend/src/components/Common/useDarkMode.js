import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode state
 * Handles localStorage persistence and DOM class manipulation
 * @returns {[boolean, function]} - [isDarkMode, toggleDarkMode]
 */
export const useDarkMode = () => {
  // Initialize dark mode state from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      // Apply theme immediately during initialization
      const isDark = savedTheme === 'true';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return isDark;
    }
    
    // If no saved preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    return prefersDark;
  });

  // Effect to sync dark mode with document class and localStorage
  useEffect(() => {
    // Apply theme changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }

    // Force a repaint to ensure styles are applied
    const root = document.documentElement;
    const display = root.style.display;
    root.style.display = 'none';
    // Use void operator to properly handle the expression
    void root.offsetHeight;
    root.style.display = display;
  }, [isDarkMode]);

  // Toggle dark mode function
  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  // Handle toggle function for checkbox inputs
  const handleToggle = (e) => {
    const checked = e.target.checked;
    toggleDarkMode(checked);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if there's no saved preference
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
    handleToggle
  };
};

export default useDarkMode;
