import { default as authApi } from './authService';

/**
 * Create a new task
 * @param {Object} taskData - The task data
 * @param {string} taskData.title - The title of the task
 * @param {string} taskData.description - The description of the task
 * @returns {Promise} - The created task data
 */
export const createTask = async (taskData) => {
    try {
        console.log('Creating task with data:', taskData);
        const response = await authApi.post('/api/tasks', taskData);
        console.log('Task created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create task:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Get all tasks
 * @returns {Promise} - Array of all tasks
 */
export const getAllTasks = async () => {
    try {
        console.log('Fetching all tasks');
        const response = await authApi.get('/api/tasks');
        console.log('Tasks fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch tasks:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Delete a task by ID
 * @param {string} taskId - The ID of the task to delete
 * @returns {Promise} - The deleted task data
 */
export const deleteTask = async (taskId) => {
    try {
        console.log('Deleting task:', taskId);
        const response = await authApi.delete(`/api/tasks/${taskId}`);
        console.log('Task deleted successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete task:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
}; 