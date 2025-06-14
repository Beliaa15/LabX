import React, { useState, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Trophy, Clock, Star, Users, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../services/authService';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [submissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { isStudent } = useAuth();

  const taskFromState = location.state?.task;
  const taskId = params.id || taskFromState?._id;

  // Load task data
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setIsLoading(true);

        if (taskFromState && taskFromState._id) {
          console.log('Using task from navigation state:', taskFromState);
          setTask(taskFromState);
          return;
        }

        if (taskId) {
          console.log('Fetching task data for ID:', taskId);
          const response = await authApi.get(`/api/tasks/${taskId}`);
          if (response.data.success) {
            console.log('Fetched task data:', response.data.task);
            setTask(response.data.task);
          } else {
            throw new Error('Task not found');
          }
        } else {
          throw new Error('No task ID provided');
        }
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Failed to load task data');
        showErrorAlert('Error', 'Failed to load task data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskData();
  }, [taskId, taskFromState]);

  const { unityProvider, isLoaded, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: `/webgl-tasks/${taskId}/Build.loader.js`,
      dataUrl: `/webgl-tasks/${taskId}/Build.data`,
      frameworkUrl: `/webgl-tasks/${taskId}/Build.framework.js`,
      codeUrl: `/webgl-tasks/${taskId}/Build.wasm`,
    });

  // Unity event handlers
  useEffect(() => {
    if (!unityProvider) return;

    const handleTaskCompleted = (data) => {
      console.log('Task completed with data:', data);
      setTaskResult(data);
      showSuccessAlert('Congratulations! 🎉', 'You have successfully completed the task!');
    };

    addEventListener('TaskCompleted', handleTaskCompleted);
    window.unityTaskCompleted = handleTaskCompleted;

    return () => {
      removeEventListener('TaskCompleted', handleTaskCompleted);
      delete window.unityTaskCompleted;
    };
  }, [addEventListener, removeEventListener, unityProvider]);

  // Submit task function
  const handleSubmitTask = async () => {
    if (!task?._id) return;

    try {
      setIsSubmitting(true);

      const submissionData = {
        taskId: task._id,
        submissionText: submissionText.trim(),
        gameResult: taskResult,
        submittedAt: new Date().toISOString(),
      };

      console.log('Submitting task:', submissionData);

      const response = await authApi.post(
        `/api/tasks/${task._id}/submit`,
        submissionData
      );

      if (response.data.success) {
        setSubmissionStatus('submitted');
        showSuccessAlert('Task Submitted! 🎯', 'Your task has been submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      showErrorAlert('Submission Failed', 'Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        navigate('/taskmanagement');
      } else if (user?.role === 'teacher') {
        navigate('/courses');
      } else {
        navigate('/my-courses');
      }
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
            <Button variant="outline" onClick={() => navigate('/admin/tasks')}>
              Back to Tasks
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
            <Button onClick={() => navigate('/admin/tasks')}>
            Back to Tasks
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
              <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {task.submissions?.length || 0} Submissions
              </div>
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
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden bg-gray-900">
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
                className="w-full h-full"
                style={{ background: '#1a1a1a' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submission Section */}
        {isStudent() && (
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
                      !submissionText.trim() ||
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

        {/* Task Result */}
        {taskResult && (
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700">
            <CardHeader>
              <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                🎉 Game Completed!
              </h2>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                {typeof taskResult === 'object' ? (
                  Object.entries(taskResult).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center border-b border-white/20 pb-3 sm:pb-4 last:border-0 last:pb-0"
                    >
                      <span className="text-white/80 font-medium text-sm sm:text-base">{key}:</span>
                      <span className="text-white font-semibold text-sm sm:text-base">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 font-medium text-sm sm:text-base">Result:</span>
                    <span className="text-white font-semibold text-sm sm:text-base">{String(taskResult)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
