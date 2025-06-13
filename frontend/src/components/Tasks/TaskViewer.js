import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { UnityContainer, TaskWrapper } from "./TaskViewer.styles";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import { useUI } from '../../context/UIContext';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useUI();
  const taskId = useParams().taskId;
  const navigate = useNavigate();
  console.log("Task ID from URL:", taskId);
  
  const { unityProvider, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: `/webgl-tasks/${taskId}/Build.loader.js`,
    dataUrl: `/webgl-tasks/${taskId}/Build.data`,
    frameworkUrl: `/webgl-tasks/${taskId}/Build.framework.js`,
    codeUrl: `/webgl-tasks/${taskId}/Build.wasm`,
  });

  // Function to handle task completion data from Unity
  const unityTaskCompleted = (data) => {
    console.log('Task completed with data:', data);
    setTaskResult(data);
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    addEventListener("TaskCompleted", unityTaskCompleted);
    window.unityTaskCompleted = unityTaskCompleted;
    
    return () => {
      removeEventListener("TaskCompleted", unityTaskCompleted);
      delete window.unityTaskCompleted;
    };
  }, [addEventListener, removeEventListener]);

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        <Header title="Task Viewer" />
        
        <main className="flex-1 relative overflow-y-auto p-4">
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          <TaskWrapper>
            <UnityContainer>
              <div>
                <Unity 
                  unityProvider={unityProvider}
                  style={{ background: '#1a1a1a' }}
                />
              </div>
            </UnityContainer>

            {taskResult && (
              <div className="task-result">
                <h3>Task Completed!</h3>
                <p>Score: {taskResult}</p>
                <p>Time: {taskResult}</p>
              </div>
            )}
          </TaskWrapper>
        </main>
      </div>
    </div>
  );
}
