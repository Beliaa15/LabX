import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Upload, 
  FileText, 
  File, 
  Folder, 
  Download, 
  Edit2, 
  Trash2,
  Eye,
  Plus,
  Calendar,
  CheckCircle,
  PlayCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../ui/SearchBar';
import ViewModeToggle from '../ui/ViewModeToggle';
import FileViewer from './FileViewer';
import SelectTaskModal from './Modals/SelectTaskModal';
import { getCourseTasksById, unassignTaskFromCourse } from '../../services/taskService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../utils/sweetAlert';

const CourseDetailView = ({
  selectedCourse,
  currentPath,
  materialsSearchQuery,
  setMaterialsSearchQuery,
  materialsViewMode,
  setMaterialsViewMode,
  selectedFolder,
  materials,
  folders,
  onBackToCourses,
  onNavigateBack,
  onShowCreateFolderModal,
  onShowAddMaterialModal,
  onNavigateToFolder,
  onDownload,
  onView,
  onDelete,
  onUpdateFolder,
  formatFileSize,
  isStudent = false,
  isLoadingFolders = false,
  isLoadingFiles = false
}) => {
  const [viewingFile, setViewingFile] = useState(null);
  const [showSelectTaskModal, setShowSelectTaskModal] = useState(false);
  const [courseTasks, setCourseTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Africa/Cairo' // Egypt timezone
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'Not set';
    }
  };

  const isTaskExpired = (dueDate) => {
    if (!dueDate) return false;
    
    try {
      const now = new Date();
      const taskDueDate = new Date(dueDate);
      
      // For debugging
      console.log('Task expiration check:', {
        currentTime: now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }),
        dueDate: taskDueDate.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }),
        deviceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isExpired: now.getTime() > taskDueDate.getTime()
      });

      return now.getTime() > taskDueDate.getTime();
    } catch (error) {
      console.error('Error checking task expiration:', error);
      return false;
    }
  };

  // Load course tasks when course changes
  useEffect(() => {
    if (selectedCourse?._id) {
      setLoadingTasks(true);
      getCourseTasksById(selectedCourse._id)
        .then(response => {
          // Extract tasks array from the response
          const tasks = response.tasks || [];
          
          // Debug task dates
          tasks.forEach(task => {
            const courseTaskData = task.courseTasks.find(ct => ct.course === selectedCourse._id);
            if (courseTaskData) {
              console.log('Task:', task.title);
              console.log('Due date:', courseTaskData.dueDate);
              console.log('Is expired:', isTaskExpired(courseTaskData.dueDate));
            }
          });

          setCourseTasks(tasks);
          setLoadingTasks(false);
        })
        .catch(err => {
          console.error('Failed to load course tasks:', err);
          setLoadingTasks(false);
        });
    }
  }, [selectedCourse?._id]);

  // Get current materials (folders + files)
  const getCurrentMaterials = () => {
    const currentFolders = Array.isArray(folders) ? 
      folders.map(folder => ({
        ...folder,
        id: folder._id,
        name: folder.title,
        type: 'folder'
      })).filter(folder => !selectedFolder) : 
      [];

    const currentFiles = selectedFolder ? materials : [];
    return [...currentFolders, ...currentFiles];
  };

  // Filter materials based on search query
  const getFilteredMaterials = () => {
    const currentMaterials = getCurrentMaterials();
    if (!materialsSearchQuery) return currentMaterials;
    
    return currentMaterials.filter(item => 
      item.name.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
      (item.type === 'folder' && item.title.toLowerCase().includes(materialsSearchQuery.toLowerCase()))
    );
  };

  // Material Item Component for Grid View
  const MaterialItem = ({ item }) => {
    const handleFileClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.type === 'folder') {
        onNavigateToFolder(item);
      } else {
        onView(item, setViewingFile);
      }
    };

    return (
      <div 
        className="surface-primary rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/20 overflow-hidden group backdrop-blur-sm"
        onClick={handleFileClick}
      >
        <div className="relative">
          {/* Top Gradient Banner */}
          <div className={`h-24 w-full ${
            item.type === 'folder' 
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20' 
              : 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20'
          }`} />

          {/* Main Content */}
          <div className="px-6 pb-6 -mt-12">
            {/* Icon Container with hover effect */}
            <div 
              className={`mx-auto w-20 h-20 flex items-center justify-center rounded-2xl cursor-pointer transform group-hover:scale-105 transition-all duration-300 shadow-lg ${
                item.type === 'folder' 
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800 dark:to-amber-900 group-hover:from-amber-100 group-hover:to-amber-200 dark:group-hover:from-amber-700 dark:group-hover:to-amber-800' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-700 dark:group-hover:to-blue-800'
              }`}
            >
              {item.type === 'folder' ? (
                <Folder className="w-10 h-10 text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors" />
              ) : (
                <File className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
              )}
            </div>

            {/* Name and Info */}
            <div className="mt-4 text-center space-y-1">
              <h3 className="font-medium text-primary text-lg truncate max-w-[200px] mx-auto" title={item.name}>
                {item.name}
              </h3>
              {item.type === 'file' && (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted">
                  <span>{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span>{new Date(item.uploadedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action Icons - Hide edit/delete actions for students */}
            {!isStudent && (
              <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {item.type === 'folder' ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToFolder(item);
                      }}
                      className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Open Folder"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateFolder(item);
                      }}
                      className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit Folder Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(item);
                    }}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                  className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                  title={`Delete ${item.type === 'folder' ? 'Folder' : 'File'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Download button for students - only show for files */}
            {isStudent && item.type === 'file' && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(item);
                  }}
                  className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Type Label */}
            <div className="absolute top-3 left-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                item.type === 'folder'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {item.type === 'folder' ? 'Folder' : 'File'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Material List Item Component for List View
  const MaterialListItem = ({ item }) => {
    const handleFileClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.type === 'folder') {
        onNavigateToFolder(item);
      } else {
        onView(item, setViewingFile);
      }
    };

    return (
      <div 
        className="group surface-primary rounded-lg border border-primary hover:shadow-md transition-all duration-200 hover-surface cursor-pointer"
        onClick={handleFileClick}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              item.type === 'folder' 
                ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800 dark:to-amber-900' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900'
            }`}>
              {item.type === 'folder' ? (
                <Folder className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-primary mb-1">
                {item.title || item.name}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-secondary">
                <span className="capitalize">{item.type}</span>
                {item.type === 'file' && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(item.size)}</span>
                    <span>•</span>
                    <span>{new Date(item.uploadedAt || Date.now()).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons - Hide edit/delete for students */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isStudent ? (
              <>
                {item.type === 'folder' ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToFolder(item);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                      title="Open Folder"
                    >
                      <FolderPlus className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateFolder(item);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                      title="Edit Folder Name"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(item);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Download File"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  title={`Delete ${item.type === 'folder' ? 'Folder' : 'File'}`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            ) : (
              item.type === 'file' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(item);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  title="Download File"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handler for adding a task
  const handleAddTaskClick = () => {
    setShowSelectTaskModal(true);
  };

  const handleSelectTask = async (task) => {
    setShowSelectTaskModal(false);
    // Refresh tasks list after assignment
    if (selectedCourse?._id) {
      setLoadingTasks(true);
      try {
        const response = await getCourseTasksById(selectedCourse._id);
        // Extract tasks array from the response
        setCourseTasks(response.tasks || []);
      } catch (err) {
        console.error('Failed to refresh tasks:', err);
      } finally {
        setLoadingTasks(false);
      }
    }
  };

  const handleOpenTask = (task) => {
    console.log('Opening task:', task);
    const basePath = isStudent ? '/my-courses' : '/courses';
    navigate(`${basePath}/${selectedCourse._id}/task/${task._id}`, { state: { task } });
  };

  const handleUnassignTask = async (task) => {
    const result = await showConfirmDialog(
      'Unassign Task',
      `Are you sure you want to unassign "${task.title}" from this course?`,
      'Yes, Unassign',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        await unassignTaskFromCourse(task._id, selectedCourse._id);
        showSuccessAlert('Success', 'Task unassigned successfully');
        // Refresh the tasks list
        setLoadingTasks(true);
        const response = await getCourseTasksById(selectedCourse._id);
        setCourseTasks(response.tasks || []);
      } catch (error) {
        console.error('Failed to unassign task:', error);
        showErrorAlert(
          'Error',
          error.response?.data?.message || 'Failed to unassign task'
        );
      } finally {
        setLoadingTasks(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls - Hide create/upload buttons for students */}
      <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Materials controls - Only show for teachers/admins */}
          {!isStudent && (
            <div className="flex items-center gap-2 md:gap-3">
              {/* Add Task button only at course root (no folder selected) */}
              {!selectedFolder && (
                <>
                  <button
                    onClick={handleAddTaskClick}
                    className="flex items-center px-2 py-2 md:px-3 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2 text-sm">Add Task</span>
                  </button>
                  <button
                    onClick={onShowCreateFolderModal}
                    className="flex items-center px-2 py-2 md:px-3 md:py-2 surface-primary border border-primary rounded-lg text-primary hover-surface transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2 text-sm">New Folder</span>
                  </button>
                </>
              )}
              {selectedFolder && (
                <button
                  onClick={onShowAddMaterialModal}
                  className="flex items-center px-2 py-2 md:px-3 md:py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden lg:inline ml-2 text-sm">Upload Files</span>
                </button>
              )}
            </div>
          )}
          {isStudent && <div></div>}
          {/* Search and View Controls */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end max-w-xs md:max-w-none">
            <SearchBar
              value={materialsSearchQuery}
              onChange={setMaterialsSearchQuery}
              placeholder="Search materials..."
              className="max-w-xs"
            />
            <ViewModeToggle
              viewMode={materialsViewMode}
              onViewModeChange={setMaterialsViewMode}
            />
          </div>
        </div>
      </div>

      {/* Back to Courses Button and Course Header */}
      <div className="px-4 md:px-6 py-4">
        {/* Back to Courses Button */}
        <button
          onClick={onBackToCourses}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedCourse.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCourse.code}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getCurrentMaterials().length} item{getCurrentMaterials().length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Breadcrumb for Folder Navigation */}
        {currentPath.length > 0 && (
          <div className="flex items-center space-x-2 text-sm bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={onNavigateBack}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Back
            </button>
            <span className="text-gray-500 dark:text-gray-400">/</span>
            {currentPath.map((folder, index) => (
              <React.Fragment key={index}>
                <span className="text-gray-700 dark:text-gray-300">{folder}</span>
                {index < currentPath.length - 1 && (
                  <span className="text-gray-500 dark:text-gray-400">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Course Tasks Section */}
      {!selectedFolder && courseTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-4 mx-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Course Tasks ({courseTasks.length})
          </h2>
          
          {loadingTasks ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="lg" className="text-indigo-500" />
            </div>
          ) : (
            <div className="grid gap-4">
              {courseTasks.map(task => {
                // Find the course task data for the current course
                const courseTaskData = task.courseTasks.find(ct => ct.course === selectedCourse._id);
                const expired = isTaskExpired(courseTaskData?.dueDate);
                
                return (
                  <div
                    key={task._id}
                    className={`border ${
                      expired 
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } rounded-lg p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                          {task.title}
                          {expired && (
                            <span className="ml-2 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Expired
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Score: {task.score}
                          </p>
                          <p className={`text-sm flex items-center ${
                            expired 
                              ? 'text-red-500 dark:text-red-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {formatDateTime(courseTaskData?.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenTask(task)}
                          className={`p-2 rounded-lg transition-colors ${
                            task.webglData && task.webglData.buildFolderPath && !expired
                              ? 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          }`}
                          title={
                            expired 
                              ? 'Task has expired' 
                              : (task.webglData && task.webglData.buildFolderPath ? 'Open Task' : 'Task files not uploaded')
                          }
                          disabled={!task.webglData || !task.webglData.buildFolderPath || expired}
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                        {!isStudent && (
                          <button
                            onClick={() => handleUnassignTask(task)}
                            className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Unassign Task"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Materials Section */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {/* Materials Grid/List */}
          {(isLoadingFolders && !selectedFolder) || (isLoadingFiles && selectedFolder) ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="lg" className="text-indigo-500" />
            </div>
          ) : getFilteredMaterials().length === 0 && !materialsSearchQuery ? (
            <div className="text-center py-12 mx-4 md:mx-6 mt-4 surface-primary rounded-xl shadow-sm border border-primary">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {selectedFolder ? "This folder is empty" : "No materials yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {isStudent
                  ? "No materials have been uploaded to this course yet"
                  : selectedFolder
                  ? "Upload files to get started"
                  : "Create folders or upload files to get started"}
              </p>
            </div>
          ) : getFilteredMaterials().length === 0 && materialsSearchQuery ? (
            <div className="text-center py-12 mx-4 md:mx-6 mt-4 surface-primary rounded-xl shadow-sm border border-primary">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No matching items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className={`p-4 md:p-6 ${materialsViewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}`}>
              {getFilteredMaterials().map(item => (
                materialsViewMode === 'grid' ? (
                  <MaterialItem key={item.id || item._id} item={item} />
                ) : (
                  <MaterialListItem key={item.id || item._id} item={item} />
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SelectTaskModal
        isOpen={showSelectTaskModal}
        onClose={() => setShowSelectTaskModal(false)}
        courseId={selectedCourse?._id}
        onSelectTask={handleSelectTask}
      />

      {viewingFile && (
        <FileViewer
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
};

export default CourseDetailView;