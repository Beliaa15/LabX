import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useLocation, useNavigate } from 'react-router-dom';
import { UnityContainer, TaskWrapper } from "./TaskViewer.styles";

// Convert server-side paths to public URLs
const convertToPublicUrl = (serverPath) => {
  if (!serverPath) return '';
  // Extract the file name from the path
  const fileName = serverPath.split('/').pop();
  // Assuming your backend serves these files at /api/webgl/{taskId}/files/{filename}
  const taskId = serverPath.split('/webgl/')[1]?.split('/')[0];
  if (!taskId) return '';
  return `/api/webgl/${taskId}/files/${fileName}`;
};

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task;

  useEffect(() => {
    // Debug log to check received task data
    console.log('Task data received:', task);
    if (task?.webglData) {
      console.log('WebGL data:', {
        loader: task.webglData.loader,
        data: task.webglData.data,
        framework: task.webglData.framework,
        wasm: task.webglData.wasm
      });
    }
  }, [task]);

  // Only create Unity context if we have task data
  const { unityProvider, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: convertToPublicUrl(task?.webglData?.loader) || '',
    dataUrl: convertToPublicUrl(task?.webglData?.data) || '',
    frameworkUrl: convertToPublicUrl(task?.webglData?.framework) || '',
    codeUrl: convertToPublicUrl(task?.webglData?.wasm) || '',
  });

  // Function to handle task completion data from Unity
  const unityTaskCompleted = (data) => {
    console.log("Task completed with data:", data);
    setTaskResult(data);
  };

  useEffect(() => {
    if (!task?.webglData) {
      console.log('No WebGL data available');
      return;
    }

    // Verify all required files are available
    const requiredFiles = ['loader', 'data', 'framework', 'wasm'];
    const missingFiles = requiredFiles.filter(fileType => !task.webglData[fileType]);
    
    if (missingFiles.length > 0) {
      console.error('Missing required WebGL files:', missingFiles);
      return;
    }

    // Add event listener for Unity to call when task is completed
    addEventListener("TaskCompleted", unityTaskCompleted);
    
    // Expose the function to the global scope for Unity to access
    window.unityTaskCompleted = unityTaskCompleted;
    
    // Cleanup function to remove event listener when component unmounts
    return () => {
      removeEventListener("TaskCompleted", unityTaskCompleted);
      // Clean up the global reference when component unmounts
      delete window.unityTaskCompleted;
    };
  }, [addEventListener, removeEventListener, task]);

  // If no task data was passed, show error and back button
  if (!task) {
    return (
      <TaskWrapper>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No task data available</p>
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

  // If no WebGL files are uploaded or missing required files
  if (!task.webglData || !task.webglData.buildFolderPath) {
    return (
      <TaskWrapper>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No files uploaded for this task yet.</p>
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

  // If any required files are missing
  const requiredFiles = ['loader', 'data', 'framework', 'wasm'];
  const missingFiles = requiredFiles.filter(fileType => !task.webglData[fileType]);
  if (missingFiles.length > 0) {
    return (
      <TaskWrapper>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Missing required WebGL files: {missingFiles.join(', ')}
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

  return (
    <TaskWrapper>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
        </div>
        <button
          onClick={() => navigate('/admin/tasks')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Back to Tasks
        </button>
      </div>

      <UnityContainer>
        <div>
          <Unity 
            unityProvider={unityProvider}
            style={{ background: '#1a1a1a' }}
          />
        </div>
      </UnityContainer>
      
      {taskResult && (
        <div className="task-result mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Completed!</h3>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600 dark:text-gray-300">Score: {taskResult.score}</p>
            <p className="text-gray-600 dark:text-gray-300">Time: {taskResult.time}</p>
          </div>
        </div>
      )}
    </TaskWrapper>
  );
} 