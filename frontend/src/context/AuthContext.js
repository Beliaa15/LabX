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
                    // You can add a function to validate the token or get user data here
                    // For example: const userData = await fetchUserData(authToken);
                    // setUser(userData);
                    setUser({ isAuthenticated: true }); // Placeholder
                } catch (err) {
                    console.error('Authentication error:', err);
                    handleLogout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [authToken]);

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
            setUser(response.user || { isAuthenticated: true });
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
            setLoading(false);
        }
    };

    const isAuthenticated = () => {
        return !!authToken && !!user;
    };

    const value = {
        user,
        authToken,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
