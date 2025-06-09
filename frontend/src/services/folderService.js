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

/**
 * Get a specific folder by its ID
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @returns {Promise} - The folder data
 */

/**
 * Delete a folder by its ID
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder to delete
 * @returns {Promise} - The response data
 */
export const deleteFolder = async (courseId, folderId) => {
    try {
        console.log('Deleting folder:', { courseId, folderId });
        const response = await authApi.delete(`/api/courses/${courseId}/folders/${folderId}`);
        console.log('Folder deleted successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete folder:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId
        });
        throw error;
    }
};

/**
 * Update a folder's title
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {string} title - The new title for the folder
 * @returns {Promise} - The updated folder data
 */
export const updateFolder = async (courseId, folderId, title) => {
    try {
        console.log('Updating folder:', { courseId, folderId, title });
        const response = await authApi.put(`/api/courses/${courseId}/folders/${folderId}`, { title });
        console.log('Folder updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update folder:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            title
        });
        throw error;
    }
}; 