import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode state
 * Handles localStorage persistence and DOM class manipulation
 * @returns {[boolean, function]} - [isDarkMode, toggleDarkMode]
 */
export const useDarkMode = () => {
  // Initialize dark mode state from DOM class
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  // Toggle dark mode function
  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
    
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Handle toggle function for checkbox inputs
  const handleToggle = (e) => {
    const checked = e.target.checked;
    toggleDarkMode(checked);
  };

  // Listen for dark mode changes from other components
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDarkMode(hasDarkClass);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
    handleToggle
  };
};

export default useDarkMode;
