import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
import {
  BookOpen,
  FileText,
  Download,
  File,
  Folder,
  Search,
  Grid3X3,
  List,
  Plus
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { downloadFile } from '../../services/fileService';
import { getFolders } from '../../services/folderService';
import { getUserCourses, enrollStudentByCode } from '../../services/courseService';
import { Button } from '../ui/button';

const MyCourses = () => {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUI();
  const { isDarkMode, handleToggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  // Enrollment states
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollCode, setEnrollCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Data states
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);

  // Fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const fetchedCourses = await getUserCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        showErrorAlert(
          'Error Loading Courses',
          'Failed to load your courses. Please try again later.'
        );
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Add useEffect to fetch folders when course is selected
  useEffect(() => {
    const loadFolders = async () => {
      if (selectedCourse && selectedCourse._id) {
        try {
          console.log('Fetching folders for course:', selectedCourse._id);
          const response = await getFolders(selectedCourse._id);
          setFolders(response.folders || []);
        } catch (error) {
          console.error('Failed to fetch folders:', error);
          showErrorAlert(
            'Error Loading Folders',
            'Failed to load course folders. Please try again later.'
          );
        }
      } else {
        // Reset folders when no course is selected
        setFolders([]);
      }
    };

    loadFolders();
  }, [selectedCourse]);

  const CourseCard = ({ course }) => (
    <div 
      onClick={() => setSelectedCourse(course)}
      className="group relative surface-primary rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-primary cursor-pointer"
    >
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded">
            {course.code}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-primary text-lg mb-2">
          {course.name}
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Teacher:</span>
            <span className="font-medium text-primary">
              {`${course.teacher?.firstName} ${course.teacher?.lastName}`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Materials:</span>
            <span className="font-medium text-primary">
              {course.materials?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }) => (
    <div 
      onClick={() => setSelectedCourse(course)}
      className="surface-primary rounded-lg border border-primary hover:shadow-md transition-all duration-200 cursor-pointer hover-surface"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-primary">
                {course.name}
              </h3>
              <span className="text-sm text-muted">({course.code})</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-secondary">
              <span>Teacher: {`${course.teacher?.firstName} ${course.teacher?.lastName}`}</span>
              <span>{course.materials?.length || 0} materials</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleDownload = async (file) => {
    try {
      await downloadFile(file);
      showSuccessAlert('Download Started', `${file.name} is being downloaded`);
    } catch (error) {
      console.error('Download failed:', error);
      showErrorAlert('Download Failed', 'There was an error downloading the file. Please try again.');
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentPath(prev => [...prev, folder.name]);
  };

  const navigateBack = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const getCurrentMaterials = () => {
    console.log('Current folders:', folders);
    console.log('Current path:', currentPath);
    
    // For root level (no current path), show all folders
    const currentFolders = Array.isArray(folders) ? 
      folders.map(folder => ({
        ...folder,
        id: folder._id,
        name: folder.title,
        type: 'folder'
      })).filter(folder => currentPath.length === 0) : 
      [];

    const currentFiles = materials.filter(item => 
      item.courseId === selectedCourse?._id &&
      item.type === 'file' &&
      JSON.stringify(item.path) === JSON.stringify(currentPath)
    );

    const result = [...currentFolders, ...currentFiles];
    console.log('Materials to display:', result);
    return result;
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const MaterialItem = ({ item }) => (
    <div className="surface-primary rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-primary group relative">
      <div className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon Container */}
          <div className={`w-16 h-16 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110 duration-300 ${
            item.type === 'folder' 
              ? 'bg-yellow-100 dark:bg-yellow-900/30' 
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {item.type === 'folder' ? (
              <Folder className="w-8 h-8 text-yellow-500" />
            ) : (
              <File className="w-8 h-8 text-blue-500" />
            )}
          </div>

          {/* Name and Info */}
          <div className="space-y-1">
            <h3 className="font-medium text-primary text-lg truncate max-w-[200px]" title={item.name}>
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

          {/* Action Buttons */}
          {item.type === 'folder' ? (
            <button
              onClick={() => navigateToFolder(item)}
              className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center justify-center"
            >
              <Folder className="w-4 h-4 mr-2" />
              Open Folder
            </button>
          ) : (
            <button 
              onClick={() => handleDownload(item)}
              className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-primary transition-all duration-300">
          <div className="h-16 px-4 md:px-6 pr-16 md:pr-6 flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200 transition-colors duration-300">
                {selectedCourse ? selectedCourse.name : 'My Courses'}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 transform hover:scale-105 transition-all duration-200">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-slate-700"></div>
                </div>
                <div className="block">
                  <p className="text-sm font-medium text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted">
                    Student
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

              {/* Dark Mode Toggle */}
              <ToggleButton
                checked={isDarkMode}
                onChange={handleToggle}
                className="transform hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        </header>

        {/* Controls */}
        {!selectedCourse && (
          <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-secondary">
                  {courses.length} course{courses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowEnrollDialog(true)}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-primary rounded-lg surface-primary text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
                        : 'text-muted hover:text-secondary'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
                        : 'text-muted hover:text-secondary'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {selectedCourse ? (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setCurrentPath([]);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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

              {/* Breadcrumb */}
              {currentPath.length > 0 && (
                <div className="flex items-center space-x-2 text-sm bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <button
                    onClick={navigateBack}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Back
                  </button>
                  <span className="text-gray-400">/</span>
                  {currentPath.map((folder, index) => (
                    <React.Fragment key={index}>
                      <span className="text-gray-700 dark:text-gray-300">{folder}</span>
                      {index < currentPath.length - 1 && (
                        <span className="text-gray-400">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Materials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getCurrentMaterials().map((item) => (
                  <MaterialItem key={item.id} item={item} />
                ))}
              </div>

              {getCurrentMaterials().length === 0 && (
                <div className="text-center py-12 surface-primary rounded-xl shadow-sm">
                  <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    No materials yet
                  </h3>
                  <p className="text-secondary">
                    Check back later for course materials
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Loading your courses...
                  </h3>
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-12 h-12 text-muted mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    No courses enrolled
                  </h3>
                  <p className="text-secondary text-center">
                    You are not enrolled in any courses yet
                  </p>
                </div>
              ) : (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCourses.map((course) => (
                      <CourseListItem key={course.id} course={course} />
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>

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
                    >
                      Enroll
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
