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
export const MOCK_USERS = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'student',
        bio: 'Computer Science student',
        location: 'New York, USA',
        courses: ['CS101', 'MATH201', 'PHYS101']
    },
    {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@example.com',
        role: 'professor',
        bio: 'Mathematics Professor',
        location: 'Boston, USA',
        courses: ['MATH201', 'MATH301', 'MATH401']
    },
    {
        id: '3',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@example.com',
        role: 'admin',
        bio: 'System Administrator',
        location: 'San Francisco, USA',
        courses: []
    },
    {
        id: '4',
        firstName: 'Emily',
        lastName: 'Williams',
        email: 'emily.williams@example.com',
        role: 'student',
        bio: 'Physics student',
        location: 'Chicago, USA',
        courses: ['PHYS101', 'PHYS201', 'MATH201']
    },
    {
        id: '5',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        role: 'professor',
        bio: 'Computer Science Professor',
        location: 'Seattle, USA',
        courses: ['CS101', 'CS201', 'CS301']
    }
];

// Mock token
const MOCK_TOKEN = 'mock-jwt-token-for-development';

// Auth services with mock implementations
export const login = async (credentials) => {
    // For development without backend
    if (!process.env.REACT_APP_USE_REAL_API) {
        console.log('Using mock login with credentials:', credentials);

        // Find user by email
        const user = MOCK_USERS.find(u => u.email === credentials.email);

        // Simple validation
        if (user && credentials.password === 'password') {
            return {
                user: {
                    ...user,
                    isAuthenticated: true
                },
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
                ...MOCK_USERS[0],
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
        return MOCK_USERS[0];
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
            ...MOCK_USERS[0],
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
