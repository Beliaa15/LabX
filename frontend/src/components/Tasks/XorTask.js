import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { UnityContainer, TaskWrapper } from "./XorTask.styles";

export default function XorTask() {
  const [taskResult, setTaskResult] = useState(null);
  
  const { unityProvider, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "/assets/TaskXor/build/TaskXor.loader.js",
    dataUrl: "/assets/TaskXor/build/webgl.data",
    frameworkUrl: "/assets/TaskXor/build/build.framework.js",
    codeUrl: "/assets/TaskXor/build/build.wasm",
  });

  // Function to handle task completion data from Unity
  const unityTaskCompleted = (data) => {
    console.log("Task completed with data:", data);
    setTaskResult(data);
    
    // You can add additional logic here like:
    // - Sending the result to a backend API
    // - Showing a completion message
    // - Navigating to the next task
  };

  useEffect(() => {
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
  }, [addEventListener, removeEventListener]);

  return (
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
          {/* Add more result details as needed */}
        </div>
      )}
    </TaskWrapper>
  );
}