import React, { useState, useEffect } from 'react';

const ToggleButton = ({ isChecked, onChange, className = '' }) => {
  const [checked, setChecked] = useState(isChecked);

  useEffect(() => {
    // update the checked state when isChecked prop changes
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [checked]);

  const handleChange = (e) => {
    setChecked(e.target.checked);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={handleChange}
      />
      {/* button background */}
      <div className="w-12 h-6 bg-gray-300 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 dark:bg-gray-700 peer-checked:bg-indigo-600 transition-colors duration-300"></div>
      {/* white point */}
      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-6"></span>
    </label>
  );
};

export default ToggleButton;
