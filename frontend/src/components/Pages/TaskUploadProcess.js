import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  Play,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "../../context/UIContext";
import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";
import { showSuccessAlert, showErrorAlert } from "../../utils/sweetAlert";

// Uppy imports
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import XHRUpload from '@uppy/xhr-upload';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

const TaskUploadProcess = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useUI();
  const navigate = useNavigate();
  const { taskId } = useParams();

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [uploadStats, setUploadStats] = useState({ total: 0, successful: 0, failed: 0 });

  const uppyRef = useRef(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    if (!taskId) {
      navigate("/taskmanagement");
      return;
    }
    fetchTaskData();
  }, [taskId, navigate]);

  useEffect(() => {
    // Prevent any form submissions in the component
    const handleFormSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Add event listener to prevent form submissions
    document.addEventListener('submit', handleFormSubmit, true);

    // Initialize Uppy
    const uppy = new Uppy({
      debug: true,
      autoProceed: false,
      restrictions: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedFileTypes: ['.wasm', '.js', '.html', '.data', '.css', '.json', '.txt'],
        maxNumberOfFiles: 10, // Fixed: was 4, but instructions say 10
      },
      meta: {
        taskId: taskId,
      },
    });

    // Add XHR upload plugin
    uppy.use(XHRUpload, {
      endpoint: `http://localhost:3000/api/tasks/${taskId}/upload`,
      fieldName: 'webglFiles',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      bundle: true, // Send all files in one request
      method: 'POST',
      formData: true,
      // Prevent any form-related issues
      getResponseData: (responseText, response) => {
        try {
          return JSON.parse(responseText);
        } catch (err) {
          return responseText;
        }
      },
    });

    // Add Dashboard plugin
    uppy.use(Dashboard, {
      target: dashboardRef.current,
      inline: true,
      width: '100%',
      height: 400,
      theme: 'light',
      proudlyDisplayPoweredByUppy: false,
      showProgressDetails: true,
      hideUploadButton: true, // We'll use our custom button
      hideCancelButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      note: 'Upload files and related assets (max 100MB per file, up to 10 files)',
      // Prevent form submission
      onBeforeFileAdded: (currentFile, files) => {
        // Optional: Add custom validation here
        return true;
      },
    });

    // Event listeners
    uppy.on('upload', () => {
      console.log('Upload started');
      setUploading(true);
      setUploadComplete(false);
    });

    uppy.on('complete', (result) => {
      console.log('Upload completed:', result);
      setUploading(false);
      setUploadStats({
        total: result.successful.length + result.failed.length,
        successful: result.successful.length,
        failed: result.failed.length,
      });

      if (result.failed.length === 0) {
        setUploadComplete(true);
        showSuccessAlert("Success", "All files uploaded successfully!");
        
        // Return to task management after 3 seconds
        setTimeout(() => {
          navigate("/taskmanagement");
        }, 3000);
      } else {
        showErrorAlert("Upload Issues", `${result.failed.length} file(s) failed to upload`);
      }
    });

    uppy.on('error', (error) => {
      console.error('Uppy error:', error);
      setUploading(false);
      showErrorAlert("Upload Error", error.message);
    });

    uppy.on('restriction-failed', (file, error) => {
      console.log('Restriction failed:', file, error);
      showErrorAlert("File Restriction", error.message);
    });

    uppy.on('upload-error', (file, error, response) => {
      console.error('Upload error for file:', file.name, error, response);
      showErrorAlert("Upload Error", `Failed to upload ${file.name}: ${error.message}`);
    });

    // Additional event to prevent page refresh
    uppy.on('upload-success', (file, response) => {
      console.log('File uploaded successfully:', file.name, response);
    });

    uppyRef.current = uppy;

    // Cleanup
    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
      if (uppyRef.current) {
        uppyRef.current.destroy();
      }
    };
  }, [taskId, navigate]);

  const fetchTaskData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setTaskData(data.task);
    } catch (error) {
      console.error("Error fetching task data:", error);
      showErrorAlert("Error", "Failed to load task data");
      navigate("/taskmanagement");
    }
  };

  const handleStartUpload = (e) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (uppyRef.current && uppyRef.current.getFiles().length > 0) {
      console.log('Starting upload for files:', uppyRef.current.getFiles().map(f => f.name));
      uppyRef.current.upload();
    } else {
      showErrorAlert("No Files", "Please select files to upload first");
    }
  };

  const handleClearFiles = (e) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (uppyRef.current) {
      uppyRef.current.reset();
    }
  };

  const handleBackClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!uploading) {
      navigate("/taskmanagement");
    }
  };

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div
        className={`${
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
      >
        <Header title="Upload Task Files" />

        <main className="flex-1 relative overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="animate-fadeIn space-y-6">
              {/* Header */}
              <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleBackClick}
                      className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={uploading}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-primary">
                        Upload Files for Task
                      </h2>
                      {taskData && (
                        <p className="mt-1 text-secondary">{taskData.title}</p>
                      )}
                    </div>
                  </div>
                  {uploadComplete && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-medium">Upload Complete</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Instructions */}
              <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Upload Instructions
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-secondary">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Supported files: .wasm, .js, .html, .css, .json, .txt
                    </p>
                    <p className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-accent" />
                      Maximum file size: 100MB per file
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-accent" />
                      Maximum files: 10 files per upload
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      Drag and drop or click to select files
                    </p>
                  </div>
                </div>
              </div>

              {/* Uppy Dashboard */}
              {!uploadComplete && (
                <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    File Upload
                  </h3>
                  <div 
                    ref={dashboardRef}
                    className="uppy-dashboard-container"
                    style={{
                      '--uppy-c-primary': 'var(--color-accent)',
                      '--uppy-c-primary-dark': 'var(--color-accent-dark)',
                    }}
                  />
                </div>
              )}

              {/* Upload Controls */}
              {!uploadComplete && (
                <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary font-medium">
                        Upload Controls
                      </p>
                      <p className="text-sm text-secondary">
                        Start the upload process or clear selected files
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleClearFiles}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        Clear Files
                      </button>
                      <button
                        type="button"
                        onClick={handleStartUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Start Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Complete */}
              {uploadComplete && (
                <div className="surface-primary shadow-sm rounded-xl p-6 border border-green-200 bg-green-50 dark:bg-green-900/20">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                      Upload Successful!
                    </h3>
                    <p className="text-green-600 dark:text-green-300 mb-4">
                      {uploadStats.successful} file(s) uploaded successfully.
                      {uploadStats.failed > 0 && ` ${uploadStats.failed} file(s) failed.`}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300 mb-4">
                      Redirecting to task management in a few seconds...
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/taskmanagement")}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Return to Tasks
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Statistics */}
              {uploadStats.total > 0 && (
                <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Upload Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{uploadStats.total}</p>
                      <p className="text-sm text-blue-600">Total Files</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{uploadStats.successful}</p>
                      <p className="text-sm text-green-600">Successful</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{uploadStats.failed}</p>
                      <p className="text-sm text-red-600">Failed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskUploadProcess;