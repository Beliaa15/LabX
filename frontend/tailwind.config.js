// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include all component files in the src directory
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#121212', 
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
      },
    },
  },
  darkMode: 'class', // Enable dark mode based on a class (e.g., 'dark')
  plugins: [],
};
