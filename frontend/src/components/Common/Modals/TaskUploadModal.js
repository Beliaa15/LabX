import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

const TaskUploadModal = ({ 
  isOpen, 
  onClose, 
  onFileUpload, 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  uploadProgress 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    event.preventDefault();
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUploadClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (selectedFiles.length === 0) {
      alert('Please select files first');
      return;
    }
    
    onFileUpload(selectedFiles, event);
  };

  const handleBrowseClick = (event) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  const resetModal = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload WebGL Files
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Upload the required WebGL build files (max 4 files):
            <ul className="mt-2 list-disc list-inside text-xs">
              <li>Build.loader.js (required)</li>
              <li>Build.data (required)</li>
              <li>Build.framework.js (optional)</li>
              <li>Build.wasm (optional)</li>
            </ul>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop files here or
            </p>
            <button
              type="button"
              onClick={handleBrowseClick}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 text-sm underline"
            >
              browse files
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".js,.data,.wasm"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Selected Files */}
          {selectedFiles.length > 0 && Object.keys(uploadProgress).length === 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Selected Files:
              </h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                  <span className="text-gray-500 text-xs">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Upload Progress:
              </h4>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                fileName !== 'total' && (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{fileName}</span>
                      <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Error Alert */}
          {selectedFiles.length > 4 && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              Maximum 4 files allowed
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadClick}
            disabled={selectedFiles.length === 0 || selectedFiles.length > 4}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskUploadModal;