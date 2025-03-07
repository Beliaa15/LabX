import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;

export const CardTitle = ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>;

export const CardDescription = ({ children }) => <p className="text-gray-600">{children}</p>;

export const CardContent = ({ children }) => <div>{children}</div>;
