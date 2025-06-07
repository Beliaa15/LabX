import { default as authApi } from './authService';

/**
 * Get all courses for the authenticated user
 * @returns {Promise} - Array of courses for the authenticated user
 */
export const getUserCourses = async () => {
    try {
        console.log('Fetching user courses');
        const response = await authApi.get('/api/courses/me');
        console.log('User courses fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user courses:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Get all courses in the system
 * @returns {Promise} - Array of all courses
 */
export const getAllCourses = async () => {
    try {
        console.log('Fetching all courses');
        const response = await authApi.get('/api/courses');
        console.log('All courses fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all courses:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Create a new course
 * @param {Object} courseData - The course data
 * @param {string} courseData.name - The name of the course
 * @param {string} courseData.description - The description of the course
 * @returns {Promise} - The created course data
 */
export const createCourse = async (courseData) => {
    try {
        console.log('Creating course with data:', courseData);
        const response = await authApi.post('/api/courses', courseData);
        console.log('Course created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create course:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

