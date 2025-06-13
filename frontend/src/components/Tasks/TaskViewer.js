import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { UnityContainer, TaskWrapper } from "./TaskViewer.styles";
import { useParams } from 'react-router-dom';
import { CheckCircle, Clock, Award, Send, Loader } from 'lucide-react';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const taskId = useParams().taskId;
  
  const { unityProvider, isLoaded, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: `/webgl-tasks/${taskId}/Build.loader.js`,
    dataUrl: `/webgl-tasks/${taskId}/Build.data`,
    frameworkUrl: `/webgl-tasks/${taskId}/Build.framework.js`,
    codeUrl: `/webgl-tasks/${taskId}/Build.wasm`,
  });

  // Function to handle task completion data from Unity
  const unityTaskCompleted = (data) => {
    console.log('Task completed with data:', data);
    
    // Assuming data is an object with score and time properties
    // If it's just a string, you may need to parse it
    const resultData = typeof data === 'string' ? JSON.parse(data) : data;
    setTaskResult(resultData);
  };
  
  const handleSubmitTask = async () => {
    if (!taskResult) return;
    
    setIsSubmitting(true);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          result: taskResult
        }),
      });
      
      if (response.ok) {
        // Handle successful submission
        console.log('Task submitted successfully');
      } else {
        console.error('Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Update loading state when Unity loads
    if (isLoaded) {
      setIsLoading(false);
    }
    
    // Add event listener for Unity to call when task is completed
    addEventListener("TaskCompleted", unityTaskCompleted);
    
    // Expose the function to the global scope for Unity to access
    window.unityTaskCompleted = unityTaskCompleted;
    
    // Cleanup function to remove event listener when component unmounts
    return () => {
      removeEventListener("TaskCompleted", unityTaskCompleted);
      delete window.unityTaskCompleted;
    };
  }, [addEventListener, removeEventListener, isLoaded]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Task #{taskId}</h2>
          <p className="text-indigo-100">Complete the task to earn points</p>
        </div>
        
        <div className="p-4">
          <TaskWrapper className="rounded-lg overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Loader className="w-10 h-10 animate-spin mx-auto mb-2" />
                  <p>Loading task environment...</p>
                </div>
              </div>
            )}
            
            <UnityContainer>
              <Unity 
                unityProvider={unityProvider}
                style={{ 
                  background: '#1a1a1a',
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '0.5rem',
                }}
              />
            </UnityContainer>
          </TaskWrapper>
          
          {taskResult && (
            <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-lg animate-fadeIn">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Completed!</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                    <Award className="w-4 h-4 mr-1" />
                    <span className="text-sm">Score</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {taskResult.score || '100'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">Time</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {taskResult.time || '00:45'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSubmitTask}
                disabled={isSubmitting}
                className="w-full md:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Results
                  </>
                )}
              </button>
            </div>
          )}
          
          {!taskResult && !isLoading && (
            <div className="mt-4 text-center py-3 text-gray-600 dark:text-gray-400 text-sm">
              Complete the task to see your results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
