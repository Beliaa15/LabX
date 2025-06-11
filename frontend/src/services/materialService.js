import { default as authApi } from './authService';

/**
 * Upload a new material to a folder in a course
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {FormData} formData - FormData containing file, title, and description
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise} - The uploaded material data
 */
export const uploadMaterial = async (courseId, folderId, formData, onProgress) => {
    try {
        console.log('Uploading material:', { courseId, folderId });
        const response = await authApi.post(
            `/api/courses/${courseId}/folders/${folderId}/materials`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            }
        );
        console.log('Material uploaded successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to upload material:', {
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
 * Get all materials in a folder
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @returns {Promise} - Array of materials in the folder
 */
export const getMaterials = async (courseId, folderId) => {
    try {
        console.log('Fetching materials for folder:', { courseId, folderId });
        const response = await authApi.get(`/api/courses/${courseId}/folders/${folderId}/materials`);
        console.log('Materials fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch materials:', {
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
 * Get a specific material by its ID
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {string} materialId - The MongoDB _id of the material
 * @returns {Promise} - The material data
 */
export const getMaterialById = async (courseId, folderId, materialId) => {
    try {
        console.log('Fetching material by ID:', { courseId, folderId, materialId });
        const response = await authApi.get(`/api/courses/${courseId}/folders/${folderId}/materials/${materialId}`);
        console.log('Material fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch material:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            materialId
        });
        throw error;
    }
};

/**
 * Download a material file
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {string} materialId - The MongoDB _id of the material
 * @param {string} filename - Optional filename for the download
 * @param {boolean} shouldDownload - Whether to trigger the download or just return the blob
 * @returns {Promise} - The file blob
 */
export const downloadMaterial = async (courseId, folderId, materialId, filename, shouldDownload = true) => {
    try {
        console.log('Downloading material:', { courseId, folderId, materialId });
        const response = await authApi.get(
            `/api/courses/${courseId}/folders/${folderId}/materials/${materialId}/download`,
            {
                responseType: 'blob',
            }
        );

        // Create blob URL and trigger download if shouldDownload is true
        const blob = new Blob([response.data]);
        
        if (shouldDownload) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Use provided filename or extract from response headers
            const downloadFilename = filename || 
                response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') ||
                'downloaded-file';
            
            link.setAttribute('download', downloadFilename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        console.log('Material downloaded successfully');
        return response.data;
    } catch (error) {
        console.error('Failed to download material:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            materialId
        });
        throw error;
    }
};

/**
 * Delete a material from a folder
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {string} materialId - The MongoDB _id of the material to delete
 * @returns {Promise} - The response data
 */
export const deleteMaterial = async (courseId, folderId, materialId) => {
    try {
        console.log('Deleting material:', { courseId, folderId, materialId });
        const response = await authApi.delete(`/api/courses/${courseId}/folders/${folderId}/materials/${materialId}`);
        console.log('Material deleted successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete material:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            materialId
        });
        throw error;
    }
};

/**
 * Helper function to create FormData for material upload
 * @param {File} file - The file to upload
 * @param {string} title - The title for the material
 * @param {string} description - Optional description for the material
 * @returns {FormData} - FormData object ready for upload
 */
export const createMaterialFormData = (file, title, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
        formData.append('description', description);
    }
    return formData;
};

/**
 * Upload multiple materials to a folder
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {Array<{file: File, title: string, description?: string}>} materials - Array of material objects
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleMaterials = async (courseId, folderId, materials) => {
    try {
        const uploadPromises = materials.map(async (material) => {
            const formData = createMaterialFormData(material.file, material.title, material.description);
            return await uploadMaterial(courseId, folderId, formData);
        });

        const results = await Promise.allSettled(uploadPromises);
        console.log('Multiple materials upload completed:', results);
        return results;
    } catch (error) {
        console.error('Failed to upload multiple materials:', error);
        throw error;
    }
};

/**
 * Get materials with pagination and filtering
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {Object} options - Query options (page, limit, search, etc.)
 * @returns {Promise} - Paginated materials data
 */
export const getMaterialsWithOptions = async (courseId, folderId, options = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (options.page) queryParams.append('page', options.page);
        if (options.limit) queryParams.append('limit', options.limit);
        if (options.search) queryParams.append('search', options.search);
        if (options.sortBy) queryParams.append('sortBy', options.sortBy);
        if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

        const queryString = queryParams.toString();
        const url = `/api/courses/${courseId}/folders/${folderId}/materials${queryString ? `?${queryString}` : ''}`;

        console.log('Fetching materials with options:', { courseId, folderId, options });
        const response = await authApi.get(url);
        console.log('Materials with options fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch materials with options:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            options
        });
        throw error;
    }
};

/**
 * Get a public URL for viewing a material file
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {string} materialId - The MongoDB _id of the material
 * @returns {Promise<string>} - The public URL for viewing the file
 */
export const getMaterialViewUrl = async (courseId, folderId, materialId) => {
    try {
        const response = await authApi.get(
            `/api/courses/${courseId}/folders/${folderId}/materials/${materialId}/public-url`
        );
        return response.data.url;
    } catch (error) {
        console.error('Failed to get material view URL:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            materialId
        });
        throw error;
    }
};

/**
 * View a material file in the browser
 * @param {string} courseId - The MongoDB _id of the course
 * @param {string} folderId - The MongoDB _id of the folder
 * @param {string} materialId - The MongoDB _id of the material
 * @returns {Promise<{ blob: Blob, publicUrl: string }>} - The file blob and public URL
 */
export const viewMaterial = async (courseId, folderId, materialId) => {
    try {
        console.log('Viewing material:', { courseId, folderId, materialId });
        
        // Get both the file blob and public URL in parallel
        const [response, publicUrl] = await Promise.all([
            authApi.get(
                `/api/courses/${courseId}/folders/${folderId}/materials/${materialId}/view`,
                { responseType: 'blob' }
            ),
            getMaterialViewUrl(courseId, folderId, materialId)
        ]);

        return {
            blob: response.data,
            publicUrl
        };
    } catch (error) {
        console.error('Failed to view material:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            courseId,
            folderId,
            materialId
        });
        throw error;
    }
};