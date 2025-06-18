import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Request deduplication cache
const pendingRequests = new Map();

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Create a unique key for each request
const getRequestKey = (config) => {
    return `${config.method}_${config.url}_${JSON.stringify(config.data || {})}_${JSON.stringify(config.params || {})}`;
};

// SINGLE request interceptor that handles everything
api.interceptors.request.use(
    (config) => {
        // Add auth token first
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Request deduplication for specific methods/patterns
        const requestKey = getRequestKey(config);
        
        // Only deduplicate safe methods or specific patterns
        if (config.method === 'get' || config.url.includes('/dashboard') || config.url.includes('/courses')) {
            if (pendingRequests.has(requestKey)) {
                // Cancel this request and return the existing promise
                const existingPromise = pendingRequests.get(requestKey);
                const cancelError = new Error('Request deduplicated');
                cancelError.isCancel = true;
                cancelError.promise = existingPromise;
                return Promise.reject(cancelError);
            } else {
                // Store this request as pending
                const requestPromise = api.request({
                    ...config,
                    // Remove the interceptor temporarily to avoid infinite loop
                    _isRetry: true
                });
                pendingRequests.set(requestKey, requestPromise);
                
                // Clean up after completion
                requestPromise.finally(() => {
                    pendingRequests.delete(requestKey);
                });
            }
        }

        // Log the request (optional - remove in production)
        console.log('Request Details:', {
            url: config.baseURL + config.url,
            method: config.method.toUpperCase(),
            hasAuth: !!config.headers.Authorization,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// SINGLE response interceptor
api.interceptors.response.use(
    (response) => {
        // Clean up pending requests cache
        const requestKey = getRequestKey(response.config);
        pendingRequests.delete(requestKey);
        
        console.log('Response received:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        
        return response;
    },
    (error) => {
        // Handle deduplicated requests
        if (error.isCancel && error.promise) {
            return error.promise;
        }

        // Clean up pending requests cache
        if (error.config) {
            const requestKey = getRequestKey(error.config);
            pendingRequests.delete(requestKey);
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
            console.warn('Authentication failed - removing token');
            localStorage.removeItem('token');
        }

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


// Auth services with real API implementation
export const login = async (credentials) => {
    try {
        // Format login data
        const loginData = {
            email: credentials.email?.trim(),
            password: credentials.password
        };
        
        console.log('Sending login request with:', { email: loginData.email });
        
        // Use the base axios instance for login (no auth token needed)
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
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
        console.log('Attempting signup with:', { email: userData.email });
        
        // Use the base axios instance for signup (no auth token needed)
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
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
        throw error;
    }
};

export const logout = async () => {
    try {
        // Call the logout endpoint with the configured api instance
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
        throw error;
    }
};

export const resetPassword = async (email) => {
    try {
        const response = await api.post('/api/auth/reset-password', { email });
        return response.data;
    } catch (error) {
        console.error('Reset password failed:', error);
        throw error;
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await api.post('/api/auth/verify-email', { token });
        return response.data;
    } catch (error) {
        console.error('Email verification failed:', error);
        throw error;
    }
};

// Export the api instance for use in other services
export default api;
