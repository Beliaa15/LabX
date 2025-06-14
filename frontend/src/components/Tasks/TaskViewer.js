import React, { useState, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  TaskWrapper,
  TaskHeader,
  GameSection,
  UnityContainer,
  SubmissionSection,
  ResultSection,
} from './TaskViewer.styles';
import authApi from '../../services/authService';

export default function TaskViewer() {
  const [taskResult, setTaskResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [submissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

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
        alert('Task submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save draft function
  const handleSaveDraft = async () => {
    if (!task?._id) return;

    try {
      setIsDraftSaving(true);

      const draftData = {
        taskId: task._id,
        submissionText: submissionText.trim(),
        gameResult: taskResult,
        isDraft: true,
        savedAt: new Date().toISOString(),
      };

      console.log('Saving draft:', draftData);

      const response = await authApi.post(
        `/api/tasks/${task._id}/draft`,
        draftData
      );

      if (response.data.success) {
        alert('Draft saved successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsDraftSaving(false);
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
    // Check if we have a previous location in history
    if (location.key !== "default") {
      navigate(-1);
    } else {
      // Default fallback routes based on user role
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

  // Loading state
  if (isLoading) {
    return (
      <TaskWrapper>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px',
            }}
          ></div>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a202c',
              marginBottom: '12px',
            }}
          >
            Loading Task
          </h3>
          <p style={{ color: '#718096' }}>Fetching task information...</p>
        </div>
      </TaskWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <TaskWrapper>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#e53e3e',
              marginBottom: '12px',
            }}
          >
            Error Loading Task
          </h3>
          <p style={{ color: '#718096', marginBottom: '24px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/tasks')}
              style={{
                background: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </TaskWrapper>
    );
  }

  if (!task) {
    return (
      <TaskWrapper>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
          }}
        >
          <p style={{ color: '#718096', marginBottom: '24px' }}>
            No task data available
          </p>
          <button
            onClick={() => navigate('/admin/tasks')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Back to Tasks
          </button>
        </div>
      </TaskWrapper>
    );
  }

  return (
    <TaskWrapper>
      {/* Task Header */}
      <TaskHeader>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h1 className="task-title">{task.title}</h1>
            <p className="task-description">{task.description}</p>
          </div>
          <button
            className="back-button"
            onClick={handleBack}
          >
            ← Back
          </button>
        </div>

        <div className="task-meta">
          <div className="meta-item">
            <span>🎯</span>
            <span>{task.score || 100} Points</span>
          </div>
          {task.courseTasks && task.courseTasks.length > 0 && (
            <div className="meta-item">
              <span>⏰</span>
              <span>Due: {formatDate(task.courseTasks[0].dueDate)}</span>
            </div>
          )}
          <div className="meta-item">
            <span>📝</span>
            <span>{task.submissions?.length || 0} Submissions</span>
          </div>
        </div>
      </TaskHeader>

      {/* Game Section */}
      <GameSection>
        <div className="game-title">
          <span>🎮</span>
          Interactive Task
        </div>
        <UnityContainer>
          {!isLoaded && (
            <div className="loading-overlay">
              <div className="loading-content">
                <h3>Loading Unity Game...</h3>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math
                        .round
                        // loadingProgression * 100
                        ()}%`,
                    }}
                  />
                </div>
                <div className="progress-text"></div>
              </div>
            </div>
          )}

          <Unity
            unityProvider={unityProvider}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </UnityContainer>
      </GameSection>

      {/* Submission Section */}
      <SubmissionSection>
        <div className="submission-title">
          <span>📋</span>
          Submit Your Work
        </div>

        <div className="submission-form">
          <div className="submission-actions">
            <button
              className="save-draft-button"
              onClick={handleSaveDraft}
              disabled={isDraftSaving || !submissionText.trim()}
            >
              {isDraftSaving ? '💾 Saving...' : '💾 Save Draft'}
            </button>

            <button
              className="submit-button"
              onClick={handleSubmitTask}
              disabled={
                isSubmitting ||
                !submissionText.trim() ||
                submissionStatus === 'submitted'
              }
            >
              {isSubmitting ? '🚀 Submitting...' : '🚀 Submit Task'}
            </button>
          </div>

          {submissionStatus === 'submitted' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              ✅ Task submitted successfully!
            </div>
          )}
        </div>
      </SubmissionSection>

      {/* Task Result */}
      {taskResult && (
        <ResultSection>
          <div className="result-title">
            <span>🎉</span>
            Game Completed!
          </div>
          <div className="result-content">
            {typeof taskResult === 'object' ? (
              Object.entries(taskResult).map(([key, value]) => (
                <div key={key} className="result-item">
                  <span className="result-key">{key}:</span>
                  <span className="result-value">{String(value)}</span>
                </div>
              ))
            ) : (
              <div className="result-item">
                <span className="result-key">Result:</span>
                <span className="result-value">{String(taskResult)}</span>
              </div>
            )}
          </div>
        </ResultSection>
      )}
    </TaskWrapper>
  );
}
