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
    },
  },
  darkMode: 'class', // Enable dark mode based on a class (e.g., 'dark')
  plugins: [],
};
