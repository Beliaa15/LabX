import { default as authApi } from './authService';

/**
 * Create a new folder in a course
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} title - The title of the folder
 * @returns {Promise} - The created folder data
 */
export const createFolder = async (courseId, title) => {
    try {
        console.log('Creating folder with data:', { courseId, title });
        const response = await authApi.post(`/api/courses/${courseId}/folders`, { title });
        console.log('Folder created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create folder:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            title
        });
        throw error;
    }
};

/**
 * Get all folders for a course
 * @param {string} courseId - The MongoDB _id of the course
 * @returns {Promise} - Array of folders for the course
 */
export const getFolders = async (courseId) => {
    try {
        console.log('Fetching folders for course:', courseId);
        const response = await authApi.get(`/api/courses/${courseId}/folders`);
        console.log('Folders fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch folders:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId
        });
        throw error;
    }
}; 