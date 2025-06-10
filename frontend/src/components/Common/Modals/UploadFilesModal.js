import React from 'react';
import Modal from '../../ui/Modal';
import { Upload } from 'lucide-react';

const UploadFilesModal = ({
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Files"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
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
            id="file-upload"
            multiple
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-muted mb-2" />
            <span className="text-secondary font-medium">
              Click to upload files or drag and drop
            </span>
            <span className="text-sm text-muted mt-1">
              Supported formats: PDF, Office documents, images, videos, and audio files
            </span>
          </label>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="text-sm">
                <div className="flex justify-between text-secondary mb-1">
                  <span>{filename}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UploadFilesModal;