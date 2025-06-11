import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const FileViewer = ({ file, onClose }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (file?.blob) {
      const url = URL.createObjectURL(file.blob);
      setFileUrl(url);
      setLoading(false);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const renderFilePreview = () => {
    if (!file?.type) return null;

    // Handle images
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={file.name}
          className="max-w-full h-auto mx-auto"
        />
      );
    }

    // Handle PDFs
    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          type="application/pdf"
          className="w-full h-[calc(90vh-12rem)]"
          title={file.name}
        >
          <div className="text-center p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              PDF preview not available in your browser.
            </p>
            <a
              href={fileUrl}
              download={file.name}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </div>
        </iframe>
      );
    }

    // Handle text files
    if (file.type.startsWith('text/') || file.type.includes('application/json')) {
      return (
        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto">
          {file.textContent || 'Loading text content...'}
        </pre>
      );
    }

    // Handle Office documents using Office Online Viewer
    const officeTypes = {
      'application/msword': true,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
      'application/vnd.ms-excel': true,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
      'application/vnd.ms-powerpoint': true,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': true
    };

    if (officeTypes[file.type]) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          className="w-full h-[calc(90vh-12rem)]"
          frameBorder="0"
          title={file.name}
        >
          <div className="text-center p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Preview not available. Please try using a different browser or download the file.
            </p>
            <a
              href={fileUrl}
              download={file.name}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </a>
          </div>
        </iframe>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
              {file.name.split('.').pop().toUpperCase()}
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {file.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This file type cannot be previewed directly in the browser.
          </p>
        </div>
        <a
          href={fileUrl}
          download={file.name}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] shadow-xl">
          <div className="animate-pulse flex justify-center items-center h-64">
            <div className="text-gray-600 dark:text-gray-300">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-4xl shadow-xl">
          <div className="text-red-600 dark:text-red-400 text-center">
            <p>Error loading file: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {file.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-8rem)]">
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer; 