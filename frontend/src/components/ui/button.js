import React from 'react';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const variantClass = variant === 'outline' ? 'border border-gray-500 text-gray-500' : 'bg-blue-600 text-white';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`py-2 px-4 rounded-md ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
