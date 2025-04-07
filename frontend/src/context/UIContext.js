import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const UIContext = createContext();

// Custom hook to use UI context
export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    // Get the initial sidebar state from localStorage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        localStorage.getItem('sidebarCollapsed') === 'true'
    );

    // Update localStorage when sidebarCollapsed changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    // Toggle sidebar collapsed state
    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    // Context value
    const value = {
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export default UIContext; 