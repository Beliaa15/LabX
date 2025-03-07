import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Mock user data for development without backend
const MOCK_USER = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Frontend developer with a passion for React',
    location: 'New York, USA',
};

// Mock token
const MOCK_TOKEN = 'mock-jwt-token-for-development';

// Auth services with mock implementations
export const login = async (credentials) => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock login with credentials:', credentials);

        // Simple validation
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
            return {
                user: MOCK_USER,
                token: MOCK_TOKEN,
            };
        }

        // Simulate error for invalid credentials
        const error = new Error('Invalid credentials');
        error.response = { data: { message: 'Invalid email or password' } };
        throw error;
    }

    // Real API call
    const response = await api.post(`${AUTH_BASE_URL}/login`, credentials);
    return response.data;
};

export const signup = async (userData) => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock signup with data:', userData);

        // Simulate successful signup
        return {
            user: {
                ...MOCK_USER,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
            },
            token: MOCK_TOKEN,
        };
    }

    // Real API call
    const response = await api.post(`${AUTH_BASE_URL}/signup`, userData);
    return response.data;
};

export const logout = async () => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock logout');
        return;
    }

    // Real API call
    await api.post(`${AUTH_BASE_URL}/logout`);
};

export const fetchUserProfile = async () => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock profile data');
        return MOCK_USER;
    }

    // Real API call
    const response = await api.get(`${AUTH_BASE_URL}/profile`);
    return response.data;
};

export const updateUserProfile = async (userData) => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock profile update with data:', userData);

        // Return updated user data
        return {
            ...MOCK_USER,
            ...userData,
        };
    }

    // Real API call
    const response = await api.put(`${AUTH_BASE_URL}/profile`, userData);
    return response.data;
};

export const resetPassword = async (email) => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock password reset for email:', email);
        return { message: 'Password reset email sent' };
    }

    // Real API call
    const response = await api.post(`${AUTH_BASE_URL}/reset-password`, { email });
    return response.data;
};

export const verifyEmail = async (token) => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock email verification for token:', token);
        return { message: 'Email verified successfully' };
    }

    // Real API call
    const response = await api.post(`${AUTH_BASE_URL}/verify-email`, { token });
    return response.data;
};

// Export the api instance for use in other services
export default api;
