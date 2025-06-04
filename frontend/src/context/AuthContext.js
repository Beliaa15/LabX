import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService } from '../services/authService';
import { getCurrentUser, updateUserProfile } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to refresh user data from the server
    const refreshUserData = async () => {
        try {
            const userData = await getCurrentUser();
            setUser({
                ...userData,
                isAuthenticated: true
            });
            return userData;
        } catch (err) {
            console.error('Error refreshing user data:', err);
            throw err;
        }
    };

    // Check if user is authenticated on initial load
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    await refreshUserData();
                } catch (err) {
                    console.error('Authentication error:', err);
                    handleLogout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    const handleLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loginService(credentials);
            localStorage.setItem('token', response.token);
            setToken(response.token);
            
            // Get fresh user data from API
            await refreshUserData();
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logoutService();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            // Use the real API to update profile with token
            const updatedUser = await updateUserProfile(profileData);
            
            // Update local state with the response from the API
            setUser({
                ...updatedUser,
                isAuthenticated: true
            });

            // Refresh user data to ensure all components have the latest data
            await refreshUserData();

            return updatedUser;
        } catch (err) {
            console.error('Profile update error:', err);
            throw err;
        }
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isTeacher = () => {
        return user?.role === 'teacher';
    };

    const isStudent = () => {
        return user?.role === 'student';
    };

    const value = {
        user,
        token,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        updateProfile,
        refreshUserData,
        isAuthenticated,
        isAdmin,
        isTeacher,
        isStudent
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
