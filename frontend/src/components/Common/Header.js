import React from 'react';
import { useAuth } from "../../context/AuthContext";
import ToggleButton from "../ui/ToggleButton";
import { useDarkMode } from "./useDarkMode";

const Header = ({ title }) => {
  const { user, isAdmin, isTeacher } = useAuth();
  const { isDarkMode, handleToggle } = useDarkMode();

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-primary transition-all duration-300">
      <div className="h-16 px-4 md:px-6 pr-16 md:pr-6 flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200 transition-colors duration-300">
            {title || (user?.role === 'admin' ? 'Course Management' : 'My Courses')}
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 transform hover:scale-105 transition-all duration-200">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-slate-700"></div>
            </div>
            <div className="block">
              <p className="text-sm font-medium text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted">
                {isAdmin() ? 'Administrator' : isTeacher() ? 'Teacher' : 'Student'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

          {/* Dark Mode Toggle */}
          <ToggleButton
            isChecked={isDarkMode}
            onChange={handleToggle}
            className="transform hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;