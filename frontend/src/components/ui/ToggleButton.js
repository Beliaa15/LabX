import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

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
      className={`relative inline-flex items-center cursor-pointer group ${className}`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={handleChange}
      />
      
      {/* Simple icon button */}
      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200">
        {!checked ? (
          <Moon className="w-5 h-5 text-gray-700" />
        ) : (
          <Sun className="w-5 h-5 dark:text-yellow-300" />
        )}
      </div>
    </label>
  );
};

export default ToggleButton;
