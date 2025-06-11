import React from 'react';
import Modal from '../../ui/Modal';
import { Upload, X } from 'lucide-react';

const TaskUploadModal = ({
  isOpen,
  onClose,
  onFileUpload,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  uploadProgress = {}
}) => {
  const handleClose = () => {
    onClose();
  };

  // Filter out the total progress from individual file progress
  const fileProgress = Object.entries(uploadProgress).filter(([key]) => key !== 'total');
  const hasFiles = fileProgress.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Files"
      maxWidth="max-w-xl"
    >
      {!hasFiles ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            type="file"
            onChange={(e) => onFileUpload(e.target.files)}
            className="hidden"
            id="task-file-upload"
            multiple
            accept=".js,.data,.wasm"
          />
          <label
            htmlFor="task-file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-muted mb-2" />
            <span className="text-secondary font-medium">
              Click to upload files or drag and drop
            </span>
            <span className="text-sm text-muted mt-1">
              Required files: loader.js, .data, framework.js, and .wasm
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {fileProgress.map(([filename, progress]) => (
            <div key={filename} className="w-full">
              <div className="flex justify-between items-center text-sm text-secondary mb-1">
                <span className="truncate flex-1">{filename}</span>
                <span className="ml-2">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default TaskUploadModal; 