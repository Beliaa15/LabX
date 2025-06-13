import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useLocation, useNavigate } from 'react-router-dom';
import { UnityContainer, TaskWrapper } from './TaskViewer.styles';
import authApi from '../../services/authService';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [filesVerified, setFilesVerified] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task;
  const verificationStarted = useRef(false);

  // Verify file accessibility before loading Unity - only once
  useEffect(() => {
    // Prevent multiple verification attempts
    if (verificationStarted.current || !task?._id || filesVerified) {
      return;
    }

    verificationStarted.current = true;

    const verifyFiles = async () => {
      try {
        setLoadingStatus('Verifying WebGL files...');
        const baseUrl = `/api/tasks/${task._id}/webgl-files`;
        const fileTypes = ['loader', 'data', 'framework', 'wasm'];

        // Use Promise.all to check files in parallel instead of sequentially
        const fileChecks = fileTypes.map(async (type) => {
          const url = `${baseUrl}/${type}`;
          console.log(`Checking file: ${url}`);

          const response = await authApi.get(url, {
            responseType: 'text',
            validateStatus: null,
          });

          console.log(`Response for ${type}:`, {
            status: response.status,
            contentType: response.headers['content-type'],
            firstChars: response.data.substring(0, 100),
          });

          if (response.status !== 200) {
            throw new Error(
              `Failed to load ${type} file: ${response.status} ${response.statusText}`
            );
          }

          if (
            response.data.trim().startsWith('<!DOCTYPE') ||
            response.data.trim().startsWith('<html')
          ) {
            throw new Error(
              `Server returned HTML instead of ${type} file. This might be an authentication or routing issue.`
            );
          }

          return type;
        });

        // Wait for all files to be verified
        await Promise.all(fileChecks);

        setFilesVerified(true);
        setLoadingStatus('Files verified, initializing Unity...');
      } catch (error) {
        console.error('File verification failed:', error);
        setError(`Failed to load WebGL files: ${error.message}`);
        setLoadingStatus('Error loading files');
        setIsLoading(false);
      }
    };

    verifyFiles();
  }, [task?._id, filesVerified]);

  // Create Unity configuration with direct URLs - only when files are verified
  const unityConfig = useMemo(() => {
    if (!task?._id || !filesVerified) {
      return {
        loaderUrl: '',
        dataUrl: '',
        frameworkUrl: '',
        codeUrl: '',
      };
    }

    const baseUrl = `/api/tasks/${task._id}/webgl-files`;
    return {
      loaderUrl: `${baseUrl}/loader`,
      dataUrl: `${baseUrl}/data`,
      frameworkUrl: `${baseUrl}/framework`,
      codeUrl: `${baseUrl}/wasm`,
      webglContextAttributes: {
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        alpha: false,
        antialias: true,
        depth: true,
        failIfMajorPerformanceCaveat: true,
        desynchronized: false,
      },
    };
  }, [task?._id, filesVerified]);

  // Create Unity context with the configuration - only when files are verified
  const {
    unityProvider,
    addEventListener,
    removeEventListener,
    isLoaded,
    loadingProgression,
    error: unityError,
  } = useUnityContext(
    filesVerified
      ? unityConfig
      : { loaderUrl: '', dataUrl: '', frameworkUrl: '', codeUrl: '' }
  );

  // Log Unity errors
  useEffect(() => {
    if (unityError) {
      console.error('Unity error:', unityError);
      setError(`Unity error: ${unityError.message || 'Unknown error'}`);
    }
  }, [unityError]);

  // Function to handle task completion data from Unity
  const unityTaskCompleted = (data) => {
    console.log('Task completed with data:', data);
    setTaskResult(data);
  };

  // Set up Unity event listeners
  useEffect(() => {
    if (!unityProvider || !addEventListener) {
      return;
    }

    console.log('Setting up Unity event listeners');
    addEventListener('TaskCompleted', unityTaskCompleted);

    // Expose the function to the global scope for Unity to access
    window.unityTaskCompleted = unityTaskCompleted;

    return () => {
      console.log('Cleaning up Unity event listeners');
      if (removeEventListener) {
        removeEventListener('TaskCompleted', unityTaskCompleted);
      }
      delete window.unityTaskCompleted;
    };
  }, [unityProvider, addEventListener, removeEventListener]);

  // Log Unity loading progress
  useEffect(() => {
    if (loadingProgression !== undefined) {
      const progress = Math.round(loadingProgression * 100);
      console.log('Unity loading progress:', progress, '%');
      setLoadingStatus(`Loading Unity... ${progress}%`);
      if (progress === 100) {
        setIsLoading(false);
      }
    }
  }, [loadingProgression]);

  // Log when Unity is loaded
  useEffect(() => {
    if (isLoaded) {
      console.log('Unity application is loaded and ready');
      setLoadingStatus('Ready');
      setIsLoading(false);
    }
  }, [isLoaded]);

  // If no task data was passed, show error and back button
  if (!task) {
    return (
      <TaskWrapper>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No task data available
          </p>
          <button
            onClick={() => navigate('/admin/tasks')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </TaskWrapper>
    );
  }

  // If there's an error
  if (error) {
    return (
      <TaskWrapper>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/tasks')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </TaskWrapper>
    );
  }

  return (
    <TaskWrapper>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {task.description}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/tasks')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Back to Tasks
        </button>
      </div>

      <UnityContainer>
        {(isLoading || !isLoaded) && (
          <div className="loading-overlay">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-white text-lg">{loadingStatus}</p>
            </div>
          </div>
        )}
        {unityProvider && (
          <Unity
            unityProvider={unityProvider}
            style={{
              visibility: isLoaded ? 'visible' : 'hidden',
              width: '100%',
              height: '100%',
              background: '#1a1a1a',
            }}
          />
        )}
      </UnityContainer>

      {taskResult && (
        <div className="task-result mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Task Completed!
          </h3>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Score: {taskResult.score}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Time: {taskResult.time}
            </p>
          </div>
        </div>
      )}
    </TaskWrapper>
  );
}
