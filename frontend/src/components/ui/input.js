import React from 'react';

export const Input = ({ type = 'text', value, onChange, placeholder = '', className = '' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 border rounded ${className}`}
  />
);
