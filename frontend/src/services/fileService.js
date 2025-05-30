// For development without backend
const MOCK_FILE_CONTENT = 'This is a mock file content for testing purposes.';

export const downloadFile = async (file) => {
    try {
        // In a real application, this would be an API call to get the file
        // For now, we'll create a mock file content
        const content = MOCK_FILE_CONTENT;
        
        // Create a blob with the file content
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return {
            success: true,
            message: 'File downloaded successfully'
        };
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error('Failed to download file');
    }
};

export const getFileContent = async (fileId) => {
    // In a real application, this would make an API call to get the file content
    return {
        content: MOCK_FILE_CONTENT,
        type: 'text/plain'
    };
};

export const uploadFile = async (file) => {
    // In a real application, this would make an API call to upload the file
    return {
        success: true,
        message: 'File uploaded successfully',
        fileId: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
    };
}; 