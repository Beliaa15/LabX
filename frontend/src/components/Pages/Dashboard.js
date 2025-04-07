import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Sidebar from '../Common/Sidebar';
import StudentDashboard from './StudentDashboard';
import ProfessorDashboard from './ProfessorDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Dashboard page component
 * @returns {React.ReactNode} - The dashboard page component
 */
const Dashboard = () => {
    const { user, isAdmin, isProfessor, isStudent } = useAuth();
    const { sidebarCollapsed } = useUI();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Render the appropriate dashboard based on user role
    const renderDashboard = () => {
        if (isAdmin()) {
            return <AdminDashboard />;
        } else if (isProfessor()) {
            return <ProfessorDashboard />;
        } else if (isStudent()) {
            return <StudentDashboard />;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar component handles both mobile and desktop sidebars */}
            <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

            {/* Main content */}
            <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
                <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white shadow-sm px-4 md:px-6">
                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex">
                            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                            <div className="flex items-center">
                                <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                                    <span className="text-sm font-medium leading-none text-white">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                </span>
                                <span className="ml-3 text-gray-700 text-sm font-medium lg:block">
                                    <span className="sr-only">Welcome,</span>
                                    {user?.firstName} {user?.lastName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {renderDashboard()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard; 