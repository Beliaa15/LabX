import React, { useState, useContext, createContext } from 'react';

// Context to share state between components
const SelectContext = createContext();

export const Select = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue); // Call parent's onChange
    setIsOpen(false); // Close dropdown
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={toggleDropdown}
        className="w-full p-2 border rounded cursor-pointer bg-white"
      >
        {value || placeholder}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute bg-white border rounded mt-1 shadow w-full">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                value === option.value ? "bg-gray-200 font-bold" : ""
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SelectTrigger = ({ children }) => {
  const { toggleDropdown, selectedValue, placeholder } = useContext(SelectContext);

  return (
    <div
      onClick={toggleDropdown}
      className="w-full p-2 border rounded cursor-pointer bg-white"
    >
      {selectedValue || placeholder || 'Select an option'}
      {children}
    </div>
  );
};

export const SelectContent = ({ children }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className="absolute w-full bg-white border rounded mt-1 shadow">
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children }) => {
  const { handleSelect, selectedValue } = useContext(SelectContext);

  return (
    <div
      onClick={() => handleSelect(value)}
      className={`p-2 cursor-pointer hover:bg-gray-100 ${
        value === selectedValue ? 'bg-gray-200 font-bold' : ''
      }`}
    >
      {children}
    </div>
  );
};

export const SelectValue = () => {
  const { selectedValue } = useContext(SelectContext);

  return <>{selectedValue}</>;
};
