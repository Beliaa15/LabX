import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on initial load
    useEffect(() => {
        const initAuth = async () => {
            if (authToken) {
                try {
                    const storedUser = {
                        isAuthenticated: true,
                        id: localStorage.getItem('userId') || '',
                        role: localStorage.getItem('userRole') || 'student',
                        firstName: localStorage.getItem('userFirstName') || '',
                        lastName: localStorage.getItem('userLastName') || '',
                        email: localStorage.getItem('userEmail') || '',
                        bio: localStorage.getItem('userBio') || '',
                        location: localStorage.getItem('userLocation') || '',
                        phone: localStorage.getItem('userPhone') || '',
                        courses: JSON.parse(localStorage.getItem('userCourses') || '[]')
                    };
                    setUser(storedUser);
                } catch (err) {
                    console.error('Authentication error:', err);
                    handleLogout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [authToken]);

    const saveUserData = (userData) => {
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userFirstName', userData.firstName);
        localStorage.setItem('userLastName', userData.lastName);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userBio', userData.bio || '');
        localStorage.setItem('userLocation', userData.location || '');
        localStorage.setItem('userPhone', userData.phone || '');
        localStorage.setItem('userCourses', JSON.stringify(userData.courses || []));
    };

    const saveToken = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    const handleLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loginService(credentials);
            saveToken(response.token);
            saveUserData(response.user);
            setUser({
                ...response.user,
                isAuthenticated: true
            });
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
            setAuthToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userFirstName');
            localStorage.removeItem('userLastName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userBio');
            localStorage.removeItem('userLocation');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userCourses');
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            // In a real app, you would make an API call to update the profile
            // For now, we'll just update the local state and localStorage

            // Create updated user object
            const updatedUser = {
                ...user,
                ...profileData
            };

            // Update local state
            setUser(updatedUser);

            // Save to localStorage
            saveUserData(updatedUser);

            return updatedUser;
        } catch (err) {
            console.error('Profile update error:', err);
            throw new Error('Failed to update profile');
        }
    };

    const isAuthenticated = () => {
        return !!authToken && !!user;
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isProfessor = () => {
        return user?.role === 'professor';
    };

    const isStudent = () => {
        return user?.role === 'student';
    };

    const value = {
        user,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        updateProfile,
        isAuthenticated,
        isAdmin,
        isProfessor,
        isStudent
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
