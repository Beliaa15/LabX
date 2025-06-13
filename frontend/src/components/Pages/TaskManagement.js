import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpDown, Calendar, Users, ArrowUpToLine, Trash2, FileText, CheckCircle2, XCircle, PlayCircle, ArrowLeft } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import TaskCreationModal from '../Common/Modals/TaskCreationModal';
import TaskUploadModal from '../Common/Modals/TaskUploadModal';
import { Unity, useUnityContext } from "react-unity-webgl";
import { UnityContainer, TaskWrapper } from "../Tasks/TaskViewer.styles";
import { getAllTasks, deleteTask, uploadTaskFiles } from '../../services/taskService';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';

const TaskManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useUI();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle URL parameters and location changes
  useEffect(() => {
    if (location.pathname === '/taskmanagement') {
      setSelectedTaskId(null);
    } else if (taskId) {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        setSelectedTaskId(taskId);
      } else {
        navigate('/taskmanagement');
      }
    }
  }, [location.pathname, taskId, tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      console.log('Tasks response:', response);
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showErrorAlert(
        'Error Loading Tasks',
        error.response?.data?.message || 'Failed to load tasks. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchTasks(); // Refresh tasks after modal closes
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleUpload = (taskId) => {
    console.log('Attempting upload for task with ID:', taskId);
    setSelectedTaskId(taskId);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedTaskId(null);
    setUploadProgress({});
  };

  const handleFileUpload = async (files) => {
    if (!selectedTaskId || !files.length) return;

    try {
      console.log('Starting file upload for task:', selectedTaskId);
      console.log('Files to upload:', files);

      if (files.length > 4) {
        showErrorAlert('Upload Error', 'Maximum 4 files allowed');
        return;
      }

      // Initialize progress state for all files
      const initialProgress = {};
      Array.from(files).forEach(file => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(initialProgress);

      await uploadTaskFiles(
        selectedTaskId,
        files,
        (progressData) => {
          if (progressData.files) {
            // Update both individual file progress and total progress
            setUploadProgress(prev => ({
              ...prev,
              ...progressData.files,
              total: progressData.total
            }));
          }
        }
      );

      showSuccessAlert('Success', 'Files uploaded successfully');
      handleCloseUploadModal();
      fetchTasks(); // Refresh tasks to update submissions count
    } catch (error) {
      console.error('Failed to upload files:', error);
      console.error('Full error details:', {
        taskId: selectedTaskId,
        endpoint: `/api/tasks/${selectedTaskId}/upload`,
        status: error.response?.status,
        data: error.response?.data
      });
      showErrorAlert(
        'Upload Failed',
        error.message || 'Failed to upload files. Please try again.'
      );
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDelete = async (taskId) => {
    const taskToDelete = tasks.find(t => t._id === taskId);
    
    const result = await showConfirmDialog(
      'Delete Task',
      `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`,
      'Yes, Delete',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        await deleteTask(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
        showSuccessAlert('Task Deleted', `Task "${taskToDelete.title}" has been deleted successfully`);
      } catch (error) {
        console.error('Failed to delete task:', error);
        showErrorAlert(
          'Error Deleting Task',
          error.response?.data?.message || 'Failed to delete task. Please try again.'
        );
      }
    }
  };

  const handleOpenTask = (task) => {
    console.log('Opening task:', task);
    navigate(`/taskmanagement/tasks/${task._id}`);
  };

  const handleBackToTasks = () => {
    navigate('/taskmanagement');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortConfig.key === 'submissions') {
      return sortConfig.direction === 'asc'
        ? a.submissions.length - b.submissions.length
        : b.submissions.length - a.submissions.length;
    }
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mobile card view for tasks
  const TaskCard = ({ task }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-primary mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-primary">{task.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            {task.webglData && task.webglData.buildFolderPath ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-500 text-xs">
                <CheckCircle2 className="w-3 h-3" />
                Files Uploaded
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                <XCircle className="w-3 h-3" />
                No Files
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenTask(task)}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 p-1"
            title="Open Task"
            disabled={!task.webglData || !task.webglData.buildFolderPath}
          >
            <PlayCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpload(task._id)}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 p-1"
            title="Upload Files"
          >
            <ArrowUpToLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(task._id)}
            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 p-1"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-secondary text-sm mb-3 line-clamp-2">{task.description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-secondary">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {task.submissions.length} submissions
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(task.createdAt)}
        </div>
      </div>
    </div>
  );

  const TaskViewerComponent = ({ task }) => {
    const { unityProvider, addEventListener, removeEventListener } = useUnityContext({
      loaderUrl: `/webgl-tasks/${task._id}/Build.loader.js`,
      dataUrl: `/webgl-tasks/${task._id}/Build.data`,
      frameworkUrl: `/webgl-tasks/${task._id}/Build.framework.js`,
      codeUrl: `/webgl-tasks/${task._id}/Build.wasm`,
    });

    const [taskResult, setTaskResult] = useState(null);

    // Function to handle task completion data from Unity
    const unityTaskCompleted = (data) => {
      console.log('Task completed with data:', data);
      setTaskResult(data);
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
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={handleBackToTasks}
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
      </div>
    );
  };

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        <Header title="Task Management" />

        <main className="flex-1 relative overflow-y-auto">
          {taskId ? (
            <TaskViewerComponent task={tasks.find(t => t._id === taskId)} />
          ) : (
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="animate-fadeIn space-y-6">
                {/* Welcome Section */}
                <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">
                        Task Management
                      </h2>
                      <p className="mt-2 text-secondary">
                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} available for students
                      </p>
                    </div>
                    <button
                      onClick={handleOpenModal}
                      className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="hidden md:inline">Create Task</span>
                    </button>
                  </div>
                </div>

                {/* Task List Section */}
                <div className="surface-primary shadow-sm rounded-xl border border-primary overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-primary">
                    <h3 className="text-lg leading-6 font-medium text-primary">
                      Available Tasks
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
                      <FileText className="w-12 h-12 text-muted mb-4" />
                      <h3 className="text-lg font-medium text-primary mb-2">
                        No tasks available
                      </h3>
                      <p className="text-secondary text-center mb-8">
                        Create your first task to get started
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile View */}
                      <div className="md:hidden p-4 space-y-4">
                        {sortedTasks.map((task) => (
                          <TaskCard key={task._id} task={task} />
                        ))}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-primary">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('title')}
                              >
                                <div className="flex items-center gap-2">
                                  Title
                                  <ArrowUpDown className="w-4 h-4" />
                                </div>
                              </th>
                              <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('description')}
                              >
                                <div className="flex items-center gap-2">
                                  Description
                                  <ArrowUpDown className="w-4 h-4" />
                                </div>
                              </th>
                              <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Files Status
                                </div>
                              </th>
                              <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('submissions')}
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Submissions
                                  <ArrowUpDown className="w-4 h-4" />
                                </div>
                              </th>
                              <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('createdAt')}
                              >
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Created
                                  <ArrowUpDown className="w-4 h-4" />
                                </div>
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-primary">
                            {sortedTasks.map((task) => (
                              <tr 
                                key={task._id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                  {task.title}
                                </td>
                                <td className="px-6 py-4 text-sm text-secondary max-w-xs truncate">
                                  {task.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {task.webglData && task.webglData.buildFolderPath ? (
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Files Uploaded
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                      <XCircle className="w-4 h-4" />
                                      No Files
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                  {task.submissions.length} submissions
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                  {formatDate(task.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenTask(task)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        task.webglData && task.webglData.buildFolderPath
                                          ? 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                          : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                      }`}
                                      title="Open Task"
                                      disabled={!task.webglData || !task.webglData.buildFolderPath}
                                    >
                                      <PlayCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleUpload(task._id)}
                                      className="p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                      title="Upload Files"
                                    >
                                      <ArrowUpToLine className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(task._id)}
                                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <TaskUploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onFileUpload={handleFileUpload}
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default TaskManagement; 