import api from './authService';

// Get current user profile using token
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/users/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

// Update current user profile using token
export const updateUserProfile = async (userData) => {
    try {
        const response = await api.put('/api/users/me', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Get all students (requires authentication token)
export const getAllStudents = async () => {
    try {
        const response = await api.get('/api/users/students');
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

// Get all teachers (requires authentication token)
export const getAllTeachers = async () => {
    try {
        const response = await api.get('/api/users/teachers');
        return response.data;
    } catch (error) {
        console.error('Error fetching teachers:', error);
        throw error;
    }
}; 

// Admin user management services
export const getAllUsers = async () => {
    try {
        const response = await api.get('/api/users');
        return response.data;
    } catch (error) {
        console.error('Get all users failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const response = await api.put(`/api/users/${userId}/role`, { role });
        return response.data;
    } catch (error) {
        console.error('Update user role failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/api/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Delete user failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

// Get users by role (optional utility functions)
export const getStudents = async () => {
    try {
        const response = await api.get('/api/users/students');
        return response.data;
    } catch (error) {
        console.error('Get students failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export const getTeachers = async () => {
    try {
        const response = await api.get('/api/users/teachers');
        return response.data;
    } catch (error) {
        console.error('Get teachers failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};