import React, { useState, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Trophy, Clock, Star, Users, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../services/authService';
import { submitTaskInCourse, getTaskById } from '../../services/taskService';
import TaskCompletedModal from '../Common/Modals/TaskCompletedModal';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, taskId } = useParams();
  const { isStudent } = useAuth();

  // Get task from location state if available
  const taskFromState = location.state?.task;
  const isTaskManagement = location.pathname.startsWith('/taskmanagement');

  // Unity context setup with unload method
  const { unityProvider, isLoaded, addEventListener, removeEventListener, unload } = useUnityContext({
    loaderUrl: `/webgl-tasks/${taskId}/Build.loader.js`,
    dataUrl: `/webgl-tasks/${taskId}/Build.data`,
    frameworkUrl: `/webgl-tasks/${taskId}/Build.framework.js`,
    codeUrl: `/webgl-tasks/${taskId}/Build.wasm`,
  });

  // Check if user is on the correct route based on their role
  useEffect(() => {
    const currentPath = location.pathname;
    const isStudentPath = currentPath.startsWith('/my-courses');
    const isTeacherPath = currentPath.startsWith('/courses');

    if (isStudent() && !isStudentPath) {
      navigate(currentPath.replace('/courses', '/my-courses'));
    } else if (!isStudent() && !isTeacherPath) {
      navigate(currentPath.replace('/my-courses', '/courses'));
    }
  }, [location.pathname, isStudent, navigate]);

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

  // Safe cleanup function
  const safeUnload = async () => {
    try {
      if (unload) {
        console.log('Cleaning up Unity instance...');
        await Promise.resolve(unload()); // Ensure we handle the promise properly
        console.log('Unity cleanup completed');
      }
    } catch (error) {
      console.error('Error during Unity cleanup:', error);
      // Continue with navigation even if cleanup fails
    }
  };

  // Cleanup Unity instance on unmount or navigation
  useEffect(() => {
    return () => {
      safeUnload().catch(error => {
        console.error('Error in cleanup effect:', error);
      });
    };
  }, [unload]);

  // Unity event handlers with error handling
  useEffect(() => {
    if (!unityProvider) return;

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

    try {
      addEventListener('TaskCompleted', handleTaskCompleted);
      window.unityTaskCompleted = handleTaskCompleted;
    } catch (error) {
      console.error('Error setting up Unity event listeners:', error);
    }

    return () => {
      try {
        removeEventListener('TaskCompleted', handleTaskCompleted);
        delete window.unityTaskCompleted;
      } catch (error) {
        console.error('Error removing Unity event listeners:', error);
      }
    };
  }, [addEventListener, removeEventListener, unityProvider]);

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

  // Modified back handler with safe cleanup
  const handleBack = async () => {
    await safeUnload();
    if (isTaskManagement) {
      navigate('/taskmanagement');
    } else {
      const basePath = isStudent() ? '/my-courses' : '/courses';
      navigate(`${basePath}/${courseId}`);
    }
  };

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
      
      // Cleanup Unity instance before navigation
      await safeUnload();
      
      // Navigate back to the course page
      const basePath = isStudent() ? '/my-courses' : '/courses';
      navigate(`${basePath}/${courseId}`);
      
    } catch (error) {
      console.error('Error submitting task:', error);
      if (error.response?.data?.error === "You have already submitted this task") {
        showErrorAlert('Already Submitted', 'You have already submitted this task.');
        await safeUnload();
        const basePath = isStudent() ? '/my-courses' : '/courses';
        navigate(`${basePath}/${courseId}`);
      } else {
        showErrorAlert('Submission Failed', 'Failed to submit task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
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
                  {task.submissions?.length || 0} Submissions
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Game Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              🎮 Interactive Task
            </h2>
          </CardHeader>
          <CardContent>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>  {/* 56.25% represents 9/16 ratio */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 backdrop-blur-sm z-10">
                  <div className="text-center px-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Loading Unity Game...
                    </h3>
                  </div>
                </div>
              )}

              <Unity
                unityProvider={unityProvider}
                className="absolute top-0 left-0 w-full h-full"
                style={{ background: '#1a1a1a' }}
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
  );
}
