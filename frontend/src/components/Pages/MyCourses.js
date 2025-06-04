import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
import { MOCK_USERS } from '../../services/authService';
import {
  BookOpen,
  FileText,
  Download,
  File,
  Folder,
  Search,
  Grid3X3,
  List,
} from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { downloadFile } from '../../services/fileService';

const MyCourses = () => {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Add state to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  
  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  // Data states
  const [courses, setCourses] = useState(() => {
    const allCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
    // Filter courses where the student is enrolled
    return allCourses.filter(course => 
      course.enrolledStudents?.some(student => student.id === user.id)
    );
  });

  const [professors] = useState(() => {
    // Get professors from MOCK_USERS
    return MOCK_USERS.filter(user => user.role === 'professor').map(prof => ({
      id: prof.id,
      name: `${prof.firstName} ${prof.lastName}`,
      email: prof.email
    }));
  });

  const [materials] = useState(() => {
    const savedMaterials = localStorage.getItem('courseMaterials');
    return savedMaterials ? JSON.parse(savedMaterials) : [];
  });

  // Update courses when adminCourses in localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const allCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
      const myCourses = allCourses.filter(course => 
        course.enrolledStudents?.some(student => student.id === user.id)
      );
      setCourses(myCourses);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user.id]);

  const getProfessorName = (professorId) => {
    if (!professorId) return 'Not assigned';
    const professor = professors.find(p => String(p.id) === String(professorId));
    return professor ? professor.name : 'Not assigned';
  };

  const handleToggle = (e) => {
    const checked = e.target.checked;
    setIsDarkMode(checked);
    
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDarkMode(hasDarkClass);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

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
    return materials.filter(item => 
      item.courseId === selectedCourse?.id &&
      JSON.stringify(item.path) === JSON.stringify(currentPath)
    );
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
            <span className="text-muted">Professor:</span>
            <span className="font-medium text-primary">
              {getProfessorName(course.assignedProfessor)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Materials:</span>
            <span className="font-medium text-primary">
              {materials.filter(m => m.courseId === course.id).length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Students:</span>
            <span className="font-medium text-primary">
              {(course.enrolledStudents || []).length}
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
              <span>Professor: {getProfessorName(course.assignedProfessor)}</span>
              <span>{materials.filter(m => m.courseId === course.id).length} materials</span>
              <span>{(course.enrolledStudents || []).length} students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          <div className="flex flex-col w-full space-y-4">
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
    </div>
  );

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
                isChecked={isDarkMode}
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
              {courses.length === 0 ? (
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
      </div>
    </div>
  );
};

export default MyCourses;
