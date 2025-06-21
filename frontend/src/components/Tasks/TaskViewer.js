import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Trophy, Clock, Star, Users, XCircle, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../services/authService';
import { submitTaskInCourse, getTaskById, getTaskSubmissionsForCourse } from '../../services/taskService';
import TaskCompletedModal from '../Common/Modals/TaskCompletedModal';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [taskSubmission, setTaskSubmission] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, taskId } = useParams();
  const { isStudent } = useAuth();

  // Get task from location state if available
  const taskFromState = location.state?.task;
  const isTaskManagement = location.pathname.startsWith('/taskmanagement');

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('TaskViewer Debug Info:', {
      currentPath: location.pathname,
      isTaskManagement,
      taskId,
      courseId,
      isStudent: isStudent(),
      taskFromState
    });
  }, [location.pathname, isTaskManagement, taskId, courseId, isStudent, taskFromState]);

  // Check if user is on the correct route based on their role
  useEffect(() => {
    const currentPath = location.pathname;
    const isStudentPath = currentPath.startsWith('/my-courses');
    const isTeacherPath = currentPath.startsWith('/courses');

    // Only redirect if NOT in task management and role doesn't match path
    if (!isTaskManagement) {
      if (isStudent() && !isStudentPath) {
        console.log('Redirecting student to correct path');
        navigate(currentPath.replace('/courses', '/my-courses'));
        return;
      } else if (!isStudent() && !isTeacherPath) {
        console.log('Redirecting teacher to correct path');
        navigate(currentPath.replace('/my-courses', '/courses'));
        return;
      }
    }
  }, [location.pathname, isStudent, navigate, isTaskManagement]);

  // Load task data
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading task data:', { courseId, taskId, taskFromState, isTaskManagement });

        // If we have the task in state, use it
        if (taskFromState) {
          console.log('Using task from state:', taskFromState);
          setTask(taskFromState);
          return;
        }

        // If we don't have task in state, fetch it
        if (taskId) {
          console.log('Fetching task data:', { taskId });
          const response = await getTaskById(taskId);
          console.log('Fetched task data:', response);
          setTask(response);
          return;
        }

        throw new Error('No task data available');
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Failed to load task data. Please try again later.');
        showErrorAlert('Error', 'Failed to load task data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskData();
  }, [taskId, courseId, taskFromState, isTaskManagement]);

  // Unity event handlers for iframe communication
  useEffect(() => {
    const handleTaskCompleted = (data) => {
      try {
        console.log('Task completed with data:', data);
        const result = {
          grade: 100,
          result: data
        };
        setTaskResult(result);
        setIsCompletedModalOpen(true);
      } catch (error) {
        console.error('Error handling task completion:', error);
        showErrorAlert('Error', 'Failed to process task completion');
      }
    };

    // Listen for messages from the iframe
    const handleMessage = (event) => {
      console.log('Received message from iframe:', event);
      
      // Allow any origin for iframe communication since we're using srcDoc
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'TaskCompleted') {
          handleTaskCompleted(event.data.data);
        } else if (event.data.type === 'GameLoaded') {
          setGameLoaded(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Global function for Unity to call (fallback)
    window.unityTaskCompleted = handleTaskCompleted;

    return () => {
      window.removeEventListener('message', handleMessage);
      delete window.unityTaskCompleted;
    };
  }, []);


  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const submissions = await getTaskSubmissionsForCourse(courseId, taskId);
        setTaskSubmission(submissions);
      } catch (error) {
        console.error('Error loading task submissions:', error);
      }
    };

    loadSubmissions();
  }, [courseId, taskId]);

  const getPageTitle = () => {
    if (task) {
      return `${task.title} - LabX`;
    }
    return 'Task Viewer - LabX';
  };

  const getPageDescription = () => {
    if (task) {
      return `Complete the interactive task "${task.title}" using our 3D virtual laboratory platform. ${task.description || ''}`;
    }
    return 'Complete interactive tasks using LabX virtual laboratory platform.';
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Controls content component
  const ControlsContent = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          🔌 Electronics Lab Controls
        </h3>
        <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700 dark:text-gray-300">
          <li>Drag components from the menu onto the breadboard to build your circuit.</li>
          <li>Press <strong className="text-gray-900 dark:text-gray-100">W</strong> to enter <strong className="text-gray-900 dark:text-gray-100">Wire Mode</strong>.</li>
          <li>In Wire Mode, click two pins to create a wire between them.</li>
          <li>Press <strong className="text-gray-900 dark:text-gray-100">W</strong> again to return to Component Mode.</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Right-click</strong> on any component or wire to delete it.</li>
        </ul>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          🧠 Logic Gates Lab Controls
        </h3>
        <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700 dark:text-gray-300">
          <li>Click and drag any logic gate from the menu to place it anywhere on the canvas.</li>
          <li>Click on an <strong className="text-gray-900 dark:text-gray-100">output node</strong> to start a wire, then click an <strong className="text-gray-900 dark:text-gray-100">input node</strong> to connect it.</li>
          <li>Press <strong className="text-gray-900 dark:text-gray-100">Ctrl + Left Click</strong> on an input node to toggle it between HIGH (1) and LOW (0).</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Right-click</strong> on a component or wire to delete it.</li>
        </ul>
      </div>
    </div>
  );

  // Modified back handler with safe cleanup


  // Modified submit handler with safe cleanup
  const handleSubmitTask = async () => {
    try {
      setIsSubmitting(true);

      if (!courseId || !taskId) {
        showErrorAlert('Error', 'Missing course or task information');
        return;
      }

      console.log('Submitting task:', {
        courseId,
        taskId,
        grade: 100
      });

      await submitTaskInCourse(courseId, taskId, 100);
      
      setSubmissionStatus('submitted');
      showSuccessAlert('Success! 🎯', 'Your task has been submitted successfully!');
      
      
      // Navigate back to the course page
      const basePath = isStudent() ? '/my-courses' : '/courses';
      navigate(`${basePath}/${courseId}`);
      
    } catch (error) {
      console.error('Error submitting task:', error);
      if (error.response?.data?.error === "You have already submitted this task") {
        showErrorAlert('Already Submitted', 'You have already submitted this task.');
        const basePath = isStudent() ? '/my-courses' : '/courses';
        navigate(`${basePath}/${courseId}`);
      } else {
        showErrorAlert('Submission Failed', 'Failed to submit task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isTaskManagement) {
      navigate('/taskmanagement');
    } else {
      const basePath = isStudent() ? '/my-courses' : '/courses';
      navigate(`${basePath}/${courseId}`);
    }
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    // Don't set gameLoaded here, wait for the actual Unity game to load
  };

  const handleIframeError = () => {
    console.error('Iframe failed to load');
    setError('Failed to load the interactive task. Please check if the game files exist.');
  };

  // Create Unity HTML content with relative paths to avoid CORS issues
  const createUnityHTML = (taskTitle) => {
    const cleanTitle = taskTitle
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^\w\-]/g, '') // Remove special characters except hyphens and alphanumeric
      .toLowerCase(); // Convert to lowercase for consistency
    
    return `
<!DOCTYPE html>
<html lang="en-us">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity Web Player | ${taskTitle}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #1a1a1a;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        
        #unity-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        #unity-canvas {
            background: #231F20;
            width: 95% !important;
            height: 90% !important;
            max-width: none;
            max-height: none;
            min-width: 800px;
            min-height: 600px;
        }
        
        #unity-loading-bar {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
            position: absolute;
            z-index: 10;
        }
        
        #unity-progress-bar-empty {
            width: 200px;
            height: 18px;
            margin: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 9px;
        }
        
        #unity-progress-bar-full {
            width: 0%;
            height: 18px;
            background: linear-gradient(90deg, #ff6b35, #f7931e);
            border-radius: 9px;
            transition: width 0.3s ease;
        }
        
        #unity-warning {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        #unity-footer {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 100;
        }
        
        #unity-fullscreen-button {
            width: 38px;
            height: 38px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            user-select: none;
        }
        
        #unity-fullscreen-button:hover {
            background: rgba(255, 255, 255, 1);
        }
        
        #unity-build-title {
            color: white;
            font-size: 16px;
            font-weight: bold;
        }
        
        .loading-text {
            color: white;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .error-message {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            padding: 15px;
            border-radius: 5px;
            margin: 20px;
            text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
            #unity-canvas {
                width: 90% !important;
                height: 85% !important;
                min-width: 600px;
                min-height: 450px;
            }
        }

        @media (max-width: 768px) {
            #unity-canvas {
                width: 98% !important;
                height: 80% !important;
                min-width: 320px;
                min-height: 240px;
            }
            
            #unity-footer {
                bottom: 5px;
                right: 5px;
            }
        }
</style>
</head>
<body>
    <div id="unity-container">
        <canvas id="unity-canvas" width="960" height="600" tabindex="-1"></canvas>
        <div id="unity-loading-bar">
            <div id="unity-logo"></div>
            <div id="unity-progress-bar-empty">
                <div id="unity-progress-bar-full"></div>
            </div>
            <div class="loading-text">Loading ${taskTitle}...</div>
        </div>
        <div id="unity-warning"></div>
        <div id="unity-footer">
            <div id="unity-fullscreen-button">⛶</div>
        </div>
    </div>
    
    <script>
        var canvas = document.querySelector("#unity-canvas");
        
        // Communication with parent window
        function notifyParent(type, data) {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: type, data: data }, '*');
                    console.log('Sent message to parent:', type, data);
                }
            } catch (e) {
                console.warn('Failed to send message to parent:', e);
            }
        }
        
        // Task completion handler
        window.unityTaskCompleted = function(data) {
            console.log('Task completed:', data);
            notifyParent('TaskCompleted', data);
        };

        function unityShowBanner(msg, type) {
            var warningBanner = document.querySelector("#unity-warning");
            function updateBannerVisibility() {
                warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
            }
            var div = document.createElement('div');
            div.innerHTML = msg;
            warningBanner.appendChild(div);
            if (type == 'error') div.style = 'background: red; padding: 10px; color: white;';
            else {
                if (type == 'warning') div.style = 'background: yellow; padding: 10px; color: black;';
                setTimeout(function() {
                    warningBanner.removeChild(div);
                    updateBannerVisibility();
                }, 5000);
            }
            updateBannerVisibility();
        }

        // Use the current window location protocol and host
        var baseUrl = "http://localhost:3000/webgl/${taskId}";
        var buildUrl = baseUrl + "/Build";
        var loaderUrl = buildUrl + "/build.loader.js";
        
        console.log('Loading Unity from:', baseUrl);
        console.log('Loader URL:', loaderUrl);
        
        var config = {
            arguments: [],
            dataUrl: buildUrl + "/build.data",
            frameworkUrl: buildUrl + "/build.framework.js",
            codeUrl: buildUrl + "/build.wasm",
            streamingAssetsUrl: baseUrl + "/StreamingAssets",
            companyName: "DefaultCompany",
            productName: "${taskTitle}",
            productVersion: "1.0",
            showBanner: unityShowBanner,
        };

        // Responsive canvas sizing
        function resizeCanvas() {
            try {
                var container = document.querySelector("#unity-container");
                var containerRect = container.getBoundingClientRect();
                var aspectRatio = 1920 / 1080; // Original aspect ratio
                
                var maxWidth = containerRect.width * 0.9;
                var maxHeight = containerRect.height * 0.8;
                
                var width, height;
                
                if (maxWidth / aspectRatio <= maxHeight) {
                    width = maxWidth;
                    height = maxWidth / aspectRatio;
                } else {
                    height = maxHeight;
                    width = maxHeight * aspectRatio;
                }
                
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
            } catch (e) {
                console.warn('Error resizing canvas:', e);
            }
        }

        // Mobile detection
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
            document.getElementsByTagName('head')[0].appendChild(meta);
            
            // Mobile specific styling
            document.querySelector("#unity-container").style.padding = "10px";
            canvas.style.maxWidth = "100%";
            canvas.style.maxHeight = "70vh";
        } else {
            // Desktop sizing
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        document.querySelector("#unity-loading-bar").style.display = "block";

        // Load Unity with error handling
        function loadUnity() {
            var script = document.createElement("script");
            script.src = loaderUrl;
            script.crossOrigin = "anonymous"; // Add crossOrigin attribute
            
            script.onload = function() {
                console.log('Unity loader script loaded successfully');
                
                if (typeof createUnityInstance === 'undefined') {
                    console.error('createUnityInstance is not defined');
                    unityShowBanner('Unity loader did not define createUnityInstance function', 'error');
                    return;
                }
                
                createUnityInstance(canvas, config, function(progress) {
                    document.querySelector("#unity-progress-bar-full").style.width = 100 * progress + "%";
                }).then(function(unityInstance) {
                    document.querySelector("#unity-loading-bar").style.display = "none";
                    
                    // Fullscreen button
                    document.querySelector("#unity-fullscreen-button").onclick = function() {
                        unityInstance.SetFullscreen(1);
                    };
                    
                    // Notify parent that game has loaded
                    notifyParent('GameLoaded', true);
                    
                    console.log('Unity instance created successfully');
                    
                }).catch(function(message) {
                    console.error('Unity loading error:', message);
                    unityShowBanner('Failed to load Unity: ' + message, 'error');
                    document.querySelector("#unity-loading-bar").style.display = "none";
                });
            };
            
            script.onerror = function() {
                console.error('Failed to load Unity loader script from:', loaderUrl);
                unityShowBanner('Failed to load Unity loader script. The game files may not exist at the expected location.', 'error');
                document.querySelector("#unity-loading-bar").style.display = "none";
            };

            document.body.appendChild(script);
        }
        
        // Start loading Unity
        loadUnity();
        
        // Test communication with parent
        setTimeout(function() {
            notifyParent('IframeReady', { title: '${cleanTitle}' });
        }, 1000);
    </script>
</body>
</html>`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Task</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">No task data available</p>
            <Button onClick={handleBack}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <title>{getPageTitle()}</title>
      <meta name="description" content={getPageDescription()} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="keywords" content="virtual laboratory, interactive task, 3D simulation, LabX" />
    </Helmet>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        {/* Task Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {task.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              </div>
              <div className="flex gap-2">
                {/* Help Icon - Only show on desktop */}
                {!isMobile && (
                  <div className="relative">
                    <div
                      className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-help transition-colors"
                      onMouseEnter={() => setShowHelp(true)}
                      onMouseLeave={() => setShowHelp(false)}
                    >
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    
                    {/* Help Tooltip */}
                    {showHelp && (
                      <div className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                        <ControlsContent />
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4">
              <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {task.score || 100} Points
              </div>
              {task.courseTasks && task.courseTasks.length > 0 && (
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Due: {formatDate(task.courseTasks[0].dueDate)}
                </div>
              )}
              {!isStudent() && (
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {taskSubmission?.submissionsCount || 0} Submissions
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Mobile Controls - Show controls directly on mobile */}
        {isMobile && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                🎮 Game Controls
              </h2>
            </CardHeader>
            <CardContent>
              <ControlsContent />
            </CardContent>
          </Card>
        )}

        {/* Game Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              🎮 Interactive Task
            </h2>
          </CardHeader>
          <CardContent>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {!gameLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 backdrop-blur-sm z-10">
                  <div className="text-center px-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Loading Unity Game...
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {task.title}
                    </p>
                  </div>
                </div>
              )}

              <iframe
                srcDoc={createUnityHTML(task.title)}
                className="absolute top-0 left-0 w-full h-full border-0"
                title={`Task ${taskId} - ${task.title}`}
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ background: '#1a1a1a' }}
                allow="fullscreen"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submission Section */}
        {isStudent() && !isTaskManagement && (
          <Card>
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                📋 Submit Your Work
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitTask}
                    disabled={
                      isSubmitting ||
                      !taskResult ||
                      submissionStatus === 'submitted'
                    }
                    className="w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Task'}
                  </Button>
                </div>

                {submissionStatus === 'submitted' && (
                  <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">Task submitted successfully!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Completed Modal */}
        <TaskCompletedModal
          isOpen={isCompletedModalOpen}
          onClose={() => setIsCompletedModalOpen(false)}
          grade={taskResult?.grade || 100}
          result={taskResult?.result}
        />
      </div>
    </div>
    </>
  );
}
