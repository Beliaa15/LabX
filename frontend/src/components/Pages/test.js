import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Upload, CheckCircle, FileText, AlertCircle, X, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';

// React-uploady imports
import Uploady, { useItemProgressListener, useItemFinalizeListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadDropZone from "@rpldy/upload-drop-zone";

const TaskUploadProcess = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useUI();
  const navigate = useNavigate();
  const { taskId } = useParams();

  // Upload states
  const [currentStage, setCurrentStage] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({
    wasmFile: null,
    dataFile: null,
    frameworkFile: null,
    loaderFile: null
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [taskData, setTaskData] = useState(null);

  const stages = [
    {
      key: 'wasmFile',
      title: 'WebAssembly File',
      description: 'Upload .wasm file from your build',
      accept: '.wasm',
      required: true,
      endpoint: `/api/tasks/${taskId}/upload/wasm`
    },
    {
      key: 'dataFile',
      title: 'Data File',
      description: 'Upload the .data file from your build',
      accept: '.data',
      required: true,
      endpoint: `/api/tasks/${taskId}/upload/data`
    },
    {
      key: 'frameworkFile',
      title: 'Framework File',
      description: 'Upload the .framework.js file',
      accept: '.js',
      required: true,
      endpoint: `/api/tasks/${taskId}/upload/framework`
    },
    {
      key: 'loaderFile',
      title: 'Loader File',
      description: 'Upload the .loader.js file',
      accept: '.js',
      required: true,
      endpoint: `/api/tasks/${taskId}/upload/loader`
    }
  ];

  useEffect(() => {
    if (!taskId) {
      navigate('/taskmanagement');
      return;
    }
    fetchTaskData();
  }, [taskId]);

  const fetchTaskData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setTaskData(data.task);
    } catch (error) {
      console.error('Error fetching task data:', error);
      showErrorAlert('Error', 'Failed to load task data');
      navigate('/taskmanagement');
    }
  };

  const handleFileSelect = useCallback((stageKey, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [stageKey]: file
    }));
  }, []);

  const isStageComplete = (stageIndex) => {
    const stage = stages[stageIndex];
    return uploadProgress[stage.key] === 100;
  };

  const canAccessStage = (stageIndex) => {
    if (stageIndex === 0) return true;
    return isStageComplete(stageIndex - 1);
  };

  // Upload Event Handlers Component
  const UploadEventHandlers = ({ stageKey, stageIndex }) => {
    useItemProgressListener((item) => {
      if (item.file && uploadedFiles[stageKey]?.name === item.file.name) {
        setUploadProgress(prev => ({ 
          ...prev, 
          [stageKey]: item.completed 
        }));
      }
    });

    useItemFinalizeListener((item) => {
      if (item.file && uploadedFiles[stageKey]?.name === item.file.name) {
        setIsUploading(false);
        
        if (item.state === "finished") {
          setUploadProgress(prev => ({ ...prev, [stageKey]: 100 }));
          showSuccessAlert('Success', `${stages[stageIndex].title} uploaded successfully`);
          
          // Auto advance to next stage if not the last one
          if (stageIndex < stages.length - 1) {
            setTimeout(() => {
              setCurrentStage(stageIndex + 1);
            }, 1000);
          } else {
            // All stages complete
            setTimeout(() => {
              showSuccessAlert('Complete', 'All files uploaded successfully!');
              navigate('/taskmanagement');
            }, 1000);
          }
        } else if (item.state === "error") {
          showErrorAlert('Upload Failed', 'Failed to upload file');
          setUploadProgress(prev => ({ ...prev, [stageKey]: 0 }));
        }
      }
    });

    return null;
  };

  const FileUploadForm = ({ stage, stageIndex, isActive, isComplete }) => {
    const file = uploadedFiles[stage.key];
    const progress = uploadProgress[stage.key] || 0;

    const uploadyProps = {
      destination: {
        url: `http://localhost:3000${stage.endpoint}`,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        filesParamName: "webglFile"
      },
      accept: stage.accept,
      multiple: false,
      autoUpload: false,
      fileFilter: (file) => {
        // Validate file type
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return stage.accept.includes(extension);
      }
    };

    const handleUploadStart = () => {
      setIsUploading(true);
      setUploadProgress(prev => ({ ...prev, [stage.key]: 0 }));
    };

    return (
      <Uploady {...uploadyProps}>
        <UploadEventHandlers stageKey={stage.key} stageIndex={stageIndex} />
        
        <div className="space-y-4">
          <UploadDropZone
            onDragOverClassName="border-indigo-400 bg-indigo-100 dark:bg-indigo-900/30"
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              isActive 
                ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600' 
                : isComplete 
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
            }`}
            onFileInput={(file) => {
              if (file) {
                handleFileSelect(stage.key, file);
              }
            }}
          >
            <div className="text-center">
              {isComplete ? (
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-500" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              
              <div className="mt-4">
                <h3 className="text-lg font-medium text-primary">{stage.title}</h3>
                <p className="text-sm text-secondary mt-1">{stage.description}</p>
                {isActive && !isComplete && (
                  <p className="text-xs text-secondary mt-2">
                    Drag & drop your file here or click to browse
                  </p>
                )}
              </div>

              {file && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-primary truncate max-w-48">{file.name}</span>
                    </div>
                    {!isComplete && (
                      <button
                        type="button"
                        onClick={() => handleFileSelect(stage.key, null)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {progress > 0 && progress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-secondary mt-1">{Math.round(progress)}% uploaded</p>
                    </div>
                  )}
                </div>
              )}

              {isActive && !isComplete && (
                <div className="mt-4 space-y-3">
                  {!file ? (
                    <UploadButton
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      onFileInput={(file) => handleFileSelect(stage.key, file)}
                    >
                      Choose File
                    </UploadButton>
                  ) : (
                    <UploadButton
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={isUploading}
                      autoUpload={true}
                      onUploadStart={handleUploadStart}
                    >
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </UploadButton>
                  )}
                </div>
              )}
            </div>
          </UploadDropZone>
        </div>
      </Uploady>
    );
  };

  const StageIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.key}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              isStageComplete(index)
                ? 'bg-green-600 border-green-600 text-white'
                : index === currentStage
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : canAccessStage(index)
                    ? 'border-gray-300 text-gray-300'
                    : 'border-gray-200 text-gray-200'
            }`}>
              {isStageComplete(index) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className="mt-2 text-xs text-secondary">{stage.title}</span>
          </div>
          {index < stages.length - 1 && (
            <ChevronRight className="w-5 h-5 text-gray-300 mx-4 mt-[-20px]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        <Header title="Upload Task Files" />

        <main className="flex-1 relative overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="animate-fadeIn space-y-6">
              {/* Header */}
              <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/taskmanagement')}
                      className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-primary">
                        Upload Files for Task
                      </h2>
                      {taskData && (
                        <p className="mt-1 text-secondary">
                          {taskData.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Indicator */}
              <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                <StageIndicator />
              </div>

              {/* Upload Stages */}
              <div className="space-y-6">
                {stages.map((stage, index) => (
                  <div
                    key={stage.key}
                    className={`surface-primary shadow-sm rounded-xl p-6 border transition-all duration-200 ${
                      index === currentStage
                        ? 'border-indigo-300 shadow-lg'
                        : isStageComplete(index)
                          ? 'border-green-300'
                          : 'border-primary opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isStageComplete(index)
                          ? 'bg-green-600 text-white'
                          : index === currentStage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-medium text-primary">
                        Stage {index + 1}: {stage.title}
                      </h3>
                      {isStageComplete(index) && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>

                    <FileUploadForm
                      stage={stage}
                      stageIndex={index}
                      isActive={index === currentStage}
                      isComplete={isStageComplete(index)}
                    />

                    {!canAccessStage(index) && index !== currentStage && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">
                            Complete the previous stage to unlock this step
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
                  disabled={currentStage === 0}
                  className="px-4 py-2 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrentStage(Math.min(stages.length - 1, currentStage + 1))}
                  disabled={currentStage === stages.length - 1 || !canAccessStage(currentStage + 1)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskUploadProcess;