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