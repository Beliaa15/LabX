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

/**
 * Get WebGL file for a task
 * @param {string} taskId - The ID of the task
 * @param {string} fileType - The type of file (loader, framework, data, wasm)
 * @returns {Promise<Blob>} - The WebGL file as a Blob
 */
export const getTaskWebGLFile = async (taskId, fileType) => {
    try {
        console.log(`Fetching ${fileType} file for task:`, taskId);
        const response = await authApi.get(`/api/tasks/${taskId}/webgl-files/${fileType}`, {
            responseType: 'arraybuffer'
        });
        
        // Log response details
        console.log(`${fileType} file response:`, {
            size: response.data.byteLength,
            status: response.status,
            headers: response.headers
        });

        return response.data;
    } catch (error) {
        console.error(`Failed to fetch ${fileType} file:`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: `/api/tasks/${taskId}/webgl-files/${fileType}`
        });
        throw error;
    }
};

/**
 * Assign a task to a course
 * @param {string} taskId - The ID of the task to assign
 * @param {string} courseId - The ID of the course to assign the task to
 * @param {string} dueDate - The due date for the task
 * @returns {Promise} - The assigned task data
 */
export const assignTaskToCourse = async (taskId, courseId, dueDate) => {
    try {
        console.log('Assigning task to course:', { taskId, courseId, dueDate });
        const response = await authApi.post(`/api/tasks/${taskId}/assign`, {
            courseId,
            dueDate
        });
        console.log('Task assigned successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to assign task:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Get all tasks for a course
 * @param {string} courseId - The ID of the course
 * @returns {Promise} - Array of tasks assigned to the course
 */
export const getCourseTasksById = async (courseId) => {
    try {
        console.log('Fetching tasks for course:', courseId);
        const response = await authApi.get(`/api/courses/${courseId}/tasks`);
        console.log('Course tasks fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch course tasks:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Unassign a task from a course
 * @param {string} taskId - The ID of the task to unassign
 * @param {string} courseId - The ID of the course to unassign the task from
 * @returns {Promise} - The response data
 */
export const unassignTaskFromCourse = async (taskId, courseId) => {
    try {
        console.log('Unassigning task from course:', { taskId, courseId });
        const response = await authApi.delete(`/api/tasks/${taskId}/unassign`, {
            data: { courseId }  // For DELETE requests, the body needs to be sent in the 'data' property
        });
        console.log('Task unassigned successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to unassign task:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Submit a task completion in a course
 * @param {string} courseId - The ID of the course
 * @param {string} taskId - The ID of the task
 * @param {number} grade - The grade for the task submission
 * @returns {Promise} - The submission response data
 */
export const submitTaskInCourse = async (courseId, taskId, grade) => {
    try {
        console.log('Submitting task in course:', { courseId, taskId, grade });
        const response = await authApi.post(
            `/api/courses/${courseId}/tasks/${taskId}/submit`,
            { grade }
        );
        console.log('Task submitted successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to submit task:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

/**
 * Get a task by ID
 * @param {string} taskId - The ID of the task to fetch
 * @returns {Promise} - The task data
 */
export const getTaskById = async (taskId) => {
    try {
        console.log('Fetching task:', taskId);
        const response = await authApi.get(`/api/tasks/${taskId}`);
        console.log('Task fetched successfully:', response.data);
        // Return the task data directly if it's in response.data.task, otherwise return response.data
        return response.data.task || response.data;
    } catch (error) {
        console.error('Failed to fetch task:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
}; 