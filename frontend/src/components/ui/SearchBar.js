// filepath: src/components/UI/SearchAndFilter/SearchBar.js
import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "w-full sm:w-64 md:w-72" 
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 pr-4 py-2 border border-primary rounded-lg surface-primary text-primary placeholder:text-muted focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all ${className}`}
      />
    </div>
  );
};

export default SearchBar;