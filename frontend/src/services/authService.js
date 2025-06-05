import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for logging and auth token
api.interceptors.request.use(
    (config) => {
        // Log the full request details
        console.log('Request Details:', {
            url: config.baseURL + config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error logging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            requestData: error.config?.data,
            status: error.response?.status,
            responseData: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
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
        role: 'teacher',
        bio: 'Mathematics Teacher',
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
        role: 'teacher',
        bio: 'Computer Science Teacher',
        location: 'Seattle, USA',
        courses: ['CS101', 'CS201', 'CS301']
    }
];

// Mock token
const MOCK_TOKEN = 'mock-jwt-token-for-development';

// Auth services with real API implementation
export const login = async (credentials) => {
    try {
        // Format login data
        const loginData = {
            email: credentials.email?.trim(),
            password: credentials.password
        };
        
        console.log('Sending login request with:', loginData);
        
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
        
        console.log('Login response:', response.data);
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Login failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export const signup = async (userData) => {
    try {
        console.log('Attempting signup with:', userData);
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
        console.log('Signup response:', response.data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Signup failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        // Re-throw the error so components can handle it
        throw error;
    }
};

export const logout = async () => {
    try {
        // Call the logout endpoint
        await api.post('/api/auth/logout');
        // Clear local storage after successful logout
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Logout failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        // Still remove the token from localStorage even if the API call fails
        localStorage.removeItem('token');
        // Re-throw the error so components can handle it if needed
        throw error;
    }
};

// export const fetchUserProfile = async () => {
//     const response = await api.get('/api/auth/profile');
//     return response.data;
// };

// export const updateUserProfile = async (userData) => {
//     const response = await api.put('/api/auth/profile', userData);
//     return response.data;
// };

export const resetPassword = async (email) => {
    const response = await api.post('/api/auth/reset-password', { email });
    return response.data;
};

export const verifyEmail = async (token) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
};

// Export the api instance for use in other services
export default api;
