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

/**
 * Upload files for a specific task
 * @param {string} taskId - The ID of the task
 * @param {FileList|File[]} files - The files to upload (maximum 4 files)
 * @param {function} onProgress - Optional callback for upload progress
 * @returns {Promise} - The upload response data
 * @throws {Error} If more than 4 files are provided
 */
export const uploadTaskFiles = async (taskId, files, onProgress) => {
    try {
        const fileArray = Array.from(files);
        
        if (fileArray.length > 4) {
            throw new Error('Maximum of 4 files allowed');
        }

        // Validate required files
        const requiredFiles = ['loader.js', '.data', 'framework.js', '.wasm'];
        const hasAllRequiredTypes = requiredFiles.every(type =>
            fileArray.some(file => 
                file.name.toLowerCase().endsWith(type) ||
                (type === '.data' && file.name.toLowerCase().endsWith('.data'))
            )
        );

        if (!hasAllRequiredTypes) {
            throw new Error('Missing required files. Please upload loader.js, .data, framework.js, and .wasm files.');
        }

        const formData = new FormData();
        const fileProgress = {};
        let totalSize = 0;
        let uploadedSize = 0;

        // Initialize progress tracking for each file
        fileArray.forEach(file => {
            totalSize += file.size;
            fileProgress[file.name] = 0;
        });

        // Add all files with the same key name 'webglFiles'
        fileArray.forEach((file) => {
            formData.append('webglFiles', file);
        });

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const currentProgress = progressEvent.loaded;
                    const progressDiff = currentProgress - uploadedSize;

                    // Update progress for each file proportionally
                    fileArray.forEach(file => {
                        const filePercentage = (file.size / totalSize) * progressDiff;
                        fileProgress[file.name] = Math.min(
                            100,
                            Math.round(fileProgress[file.name] + (filePercentage / file.size * 100))
                        );
                    });

                    // Update total progress
                    const totalProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    
                    // Send both individual file progress and total progress
                    onProgress({
                        files: fileProgress,
                        total: totalProgress
                    });

                    uploadedSize = currentProgress;
                }
            }
        };

        console.log(`Uploading ${fileArray.length} files to task:`, taskId);
        const response = await authApi.post(`/api/tasks/${taskId}/upload`, formData, config);
        console.log('Files uploaded successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to upload files:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
}; 