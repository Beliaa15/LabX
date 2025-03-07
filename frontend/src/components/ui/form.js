import React from 'react';

export const Form = ({ children, onSubmit, className = '' }) => (
  <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
    {children}
  </form>
);

export const FormField = ({ name, label, control }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="text-sm font-medium">{label}</label>
    {control}
  </div>
);
