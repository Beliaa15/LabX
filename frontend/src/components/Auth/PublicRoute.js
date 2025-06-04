import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicRoute component that redirects authenticated users to dashboard
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @returns {React.ReactNode} - The public route component
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    // Render children if not authenticated
    return children;
};

export default PublicRoute;
