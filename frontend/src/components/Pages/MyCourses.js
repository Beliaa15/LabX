import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import {
  BookOpen,
  Plus
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { getFolders } from '../../services/folderService';
import { getUserCourses, enrollStudentByCode } from '../../services/courseService';
import { getMaterials, downloadMaterial } from '../../services/materialService';
import { getCourseTasksById } from '../../services/taskService';
import { Button } from '../ui/button';
import CourseListView from '../Common/courseListView';
import CourseDetailView from '../Common/courseDetailView';
import SearchBar from '../ui/SearchBar';
import ViewModeToggle from '../ui/ViewModeToggle';
import FileViewer from '../Common/FileViewer';

const MyCourses = () => {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUI();
  const { isDarkMode, handleToggle } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, folderId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [courseTasks, setCourseTasks] = useState([]);
  
  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);

  // Enrollment states
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollCode, setEnrollCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Data states
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);

  // Add new state for materials search
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [materialsViewMode, setMaterialsViewMode] = useState('grid');

  // Add state for selected folder
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Handle location changes
  useEffect(() => {
    // If we're at the root my-courses page, reset all view states
    if (location.pathname === '/my-courses') {
      setSelectedCourse(null);
      setSelectedFolder(null);
      setCurrentPath([]);
      setMaterials([]);
      setFolders([]);
    }
  }, [location.pathname]);

  // Load courses and handle URL parameters on mount
  useEffect(() => {
    const initializeFromUrl = async () => {
      try {
        setIsLoading(true);
        const fetchedCourses = await getUserCourses();
        setCourses(fetchedCourses);

        // If we have a courseId in the URL, load that course
        if (courseId) {
          const course = fetchedCourses.find(c => c._id === courseId);
          if (course) {
            setSelectedCourse(course);

            // If we have a folderId, load folders and select the right one
            if (folderId) {
              try {
                setIsLoadingFolders(true);
                const response = await getFolders(course._id);
                const folders = response.folders || [];
                setFolders(folders);
                
                const folder = folders.find(f => f._id === folderId);
                if (folder) {
                  setSelectedFolder(folder);
                  setCurrentPath([folder.title]);

                  // Load materials for the folder
                  setIsLoadingFiles(true);
                  const materialsResponse = await getMaterials(course._id, folder._id);
                  const transformedMaterials = materialsResponse.materials.map(material => ({
                    _id: material._id,
                    id: material._id,
                    name: material.title,
                    title: material.title,
                    type: 'file',
                    size: material.fileSize || 0,
                    uploadedAt: material.createdAt,
                    courseId: course._id,
                    folderId: folder._id,
                    path: [folder.title],
                    filePath: material.filePath
                  }));
                  setMaterials(transformedMaterials);
                }
              } catch (error) {
                console.error('Failed to load folders/materials:', error);
                showErrorAlert(
                  'Error Loading Data',
                  'Failed to load folders or materials. Please try again later.'
                );
              } finally {
                setIsLoadingFolders(false);
                setIsLoadingFiles(false);
              }
            } else {
              // Just load folders for the course
              try {
                setIsLoadingFolders(true);
                const response = await getFolders(course._id);
                setFolders(response.folders || []);
              } catch (error) {
                console.error('Failed to load folders:', error);
                showErrorAlert(
                  'Error Loading Folders',
                  'Failed to load folders. Please try again later.'
                );
              } finally {
                setIsLoadingFolders(false);
              }
            }
          } else {
            // If course not found, redirect to my-courses list
            navigate('/my-courses');
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        showErrorAlert(
          'Error Loading Courses',
          'Failed to load your courses. Please try again later.'
        );
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFromUrl();
  }, [courseId, folderId]); // Include courseId and folderId in dependencies

  const handleCourseClick = (course) => {
    navigate(`/my-courses/${course._id}`);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedFolder(null);
    setCurrentPath([]);
    setMaterials([]);
    navigate('/my-courses');
  };

  const handleDownload = async (material) => {
    try {
      if (material.type === 'file' && selectedCourse && selectedFolder) {
        await downloadMaterial(
          selectedCourse._id, 
          selectedFolder._id, 
          material._id, 
          material.name
        );
        showSuccessAlert(
          'Download Started', 
          `${material.name} is being downloaded`
        );
      }
    } catch (error) {
      console.error('Download failed:', error);
      showErrorAlert(
        'Download Failed', 
        error.response?.data?.message || 'There was an error downloading the file. Please try again.'
      );
    }
  };

  const navigateToFolder = (folder) => {
    setSelectedFolder(folder);
    setCurrentPath(prev => [...prev, folder.title]);
    navigate(`/my-courses/${selectedCourse._id}/folders/${folder._id}`);
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      if (currentPath.length === 1) {
        setSelectedFolder(null);
        navigate(`/my-courses/${selectedCourse._id}`);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const handleView = async (material, setViewingFile) => {
    try {
      if (material.type === 'file') {
        // Show loading state
        setViewingFile({ 
          ...material,
          name: material.name,
          type: getFileType(material.name)
        });

        const response = await downloadMaterial(
          selectedCourse._id,
          material.folderId || '',
          material._id,
          material.name,
          false // Don't trigger download when viewing
        );
        
        // Create a blob with the correct type and content
        const blob = new Blob([response], { type: getFileType(material.name) });
        
        // For text files, read the content
        if (getFileType(material.name).includes('text/') || 
            getFileType(material.name).includes('application/json')) {
          const reader = new FileReader();
          reader.onload = () => {
            setViewingFile({
              ...material,
              name: material.name,
              type: getFileType(material.name),
              blob,
              textContent: reader.result
            });
          };
          reader.readAsText(blob);
        } else {
          setViewingFile({
            ...material,
            name: material.name,
            type: getFileType(material.name),
            blob
          });
        }
      }
    } catch (error) {
      console.error('View failed:', error);
      showErrorAlert(
        'View Failed',
        'There was an error viewing the file. Please try again.'
      );
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setIsEnrolling(true);
    
    try {
      await enrollStudentByCode(enrollCode);
      showSuccessAlert('Success', 'Successfully enrolled in the course!');
      setEnrollCode('');
      setShowEnrollDialog(false);
      // Refresh courses list
      const fetchedCourses = await getUserCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      showErrorAlert(
        'Enrollment Failed',
        error.response?.data?.message || 'Failed to enroll in the course. Please check the code and try again.'
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  // Dummy handlers for CourseListView props that don't apply to students
  const handleAddStudent = () => {};
  const handleViewStudents = () => {};
  const handleUpdateCourse = () => {};
  const handleDeleteCourse = () => {};

  const handleOpenTask = (task) => {
    console.log('Opening task:', task);
    navigate(`/tasks/${task._id}`, { state: { task } });
  };

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <Header
          title="My Courses"
          user={user}
          isAdmin={false}
          isTeacher={false}
          isDarkMode={isDarkMode}
          handleToggle={handleToggle}
        />

        {/* Main Content - Switch between views */}
        {selectedCourse ? (
          <CourseDetailView
            selectedCourse={selectedCourse}
            currentPath={currentPath}
            materialsSearchQuery={materialsSearchQuery}
            setMaterialsSearchQuery={setMaterialsSearchQuery}
            materialsViewMode={materialsViewMode}
            setMaterialsViewMode={setMaterialsViewMode}
            selectedFolder={selectedFolder}
            materials={materials}
            folders={folders}
            onBackToCourses={handleBackToCourses}
            onNavigateBack={navigateBack}
            onShowCreateFolderModal={() => {}} // Students can't create folders
            onShowAddMaterialModal={() => {}} // Students can't upload materials
            onNavigateToFolder={navigateToFolder}
            onDownload={handleDownload}
            onView={handleView}
            onDelete={() => {}} // Students can't delete
            onUpdateFolder={() => {}} // Students can't update folders
            formatFileSize={formatFileSize}
            isStudent={true}
            isLoadingFolders={isLoadingFolders}
            isLoadingFiles={isLoadingFiles}
            handleOpenTask={handleOpenTask}
            courseTasks={courseTasks}
            loadingTasks={loadingTasks}
          />
        ) : (
          <>
            {/* Student-specific controls with Enroll button */}
            <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                {/* Enroll Button */}
                <div className="flex items-center">
                  <Button
                    onClick={() => setShowEnrollDialog(true)}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm font-medium"
                  >
                    <Plus className="w-4 h-4 md:mr-0" />
                    <span className="hidden md:inline">Enroll in Course</span>
                  </Button>
                </div>

                {/* Search and View Controls */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end max-w-xs md:max-w-none">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search your courses..."
                    className="flex-1 min-w-0 max-w-[200px] sm:max-w-[240px] md:max-w-none md:w-64 lg:w-72"
                  />
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Course List */}
            <div className="flex-1 p-4 md:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-12 h-12 text-muted mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    {searchQuery ? 'No courses found' : 'No courses enrolled'}
                  </h3>
                  <p className="text-secondary text-center mb-8">
                    {searchQuery 
                      ? 'Try adjusting your search terms' 
                      : 'Enroll in a course to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setShowEnrollDialog(true)}
                      className="flex items-center gap-2"
                      variant="default"
                    >
                      <Plus className="w-5 h-5" />
                      Enroll in Course
                    </Button>
                  )}
                </div>
              ) : (
                <CourseListView
                  courses={courses}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  user={user}
                  showMobileMenu={null}
                  setShowMobileMenu={() => {}}
                  onShowCreateModal={() => {}} // Students can't create courses
                  onCourseClick={handleCourseClick}
                  onAddStudent={handleAddStudent}
                  onViewStudents={handleViewStudents}
                  onUpdateCourse={handleUpdateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  isStudent={true} // Add this prop to hide teacher-only features
                  hideControls={true} // Hide the CourseListView's built-in controls since we're providing our own
                />
              )}
            </div>
          </>
        )}

        {/* Enroll Course Dialog */}
        {showEnrollDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-md border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Enroll in Course
                </h3>
                <form onSubmit={handleEnrollSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={enrollCode}
                      onChange={(e) => setEnrollCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      placeholder="Enter course code"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEnrollDialog(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={isEnrolling}
                      loading={isEnrolling}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Enroll
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* File Viewer */}
        {viewingFile && (
          <FileViewer
            file={viewingFile}
            onClose={() => setViewingFile(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyCourses;