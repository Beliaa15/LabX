import React from 'react';
import { Grid3X3, List } from 'lucide-react';

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
            : 'text-muted hover:text-secondary hover:bg-white/50 dark:hover:bg-slate-600/50'
        }`}
        title="Grid View"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
            : 'text-muted hover:text-secondary hover:bg-white/50 dark:hover:bg-slate-600/50'
        }`}
        title="List View"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ViewModeToggle;