import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import Sidebar from '../Common/Sidebar';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import ToggleButton from '../ui/ToggleButton';

/**
 * Dashboard page component
 * @returns {React.ReactNode} - The dashboard page component
 */
const Dashboard = () => {
    const { user, isAdmin, isTeacher, isStudent } = useAuth();
    const { sidebarCollapsed } = useUI();
    const { isDarkMode, handleToggle } = useDarkMode();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Render the appropriate dashboard based on user role
    const renderDashboard = () => {
        if (isAdmin()) {
            return <AdminDashboard />;
        } else if (isTeacher()) {
            return <TeacherDashboard />;
        } else if (isStudent()) {
            return <StudentDashboard />;
        }
        return null;
    };

    return (
        <div className="min-h-screen surface-secondary">
            {/* Sidebar component handles both mobile and desktop sidebars */}
            <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

            {/* Main content */}
            <div
                className={`${
                    sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
                } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
            >
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-primary transition-all duration-300">
                    <div className="h-16 px-4 md:px-6 pr-16 md:pr-6 flex items-center justify-between">
                        <div className="flex-1 flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200 transition-colors duration-300">
                                Dashboard
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

                {/* Main Content Area */}
                <main className="flex-1 relative overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <div className="animate-fadeIn">
                            {renderDashboard()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;