import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import { MOCK_USERS } from '../../services/authService';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
import {
  BookOpen,
  FileText,
  FolderPlus,
  Upload,
  UserPlus,
  Trash2,
  File,
  Folder,
  UserMinus,
  Eye,
  Download,
} from 'lucide-react';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmDialog 
} from '../../utils/sweetAlert';
import { downloadFile } from '../../services/fileService';

const Courses = () => {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUI();
  const { isDarkMode, handleToggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  
  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Selected states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [tempCourse, setTempCourse] = useState(null);

  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states with localStorage initialization
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('adminCourses');
    console.log('Initial localStorage courses:', savedCourses);
    const allCourses = savedCourses ? JSON.parse(savedCourses) : [];
    console.log('Parsed courses:', allCourses);
    console.log('Current user:', user);
    
    // Filter courses for the current professor
    if (user && user.role === 'professor') {
      const filteredCourses = allCourses.filter(course => {
        console.log(`Comparing course ${course.name}:`, {
          courseAssignedProfessor: course.assignedProfessor,
          userId: user.id,
          match: String(course.assignedProfessor) === String(user.id)
        });
        return String(course.assignedProfessor) === String(user.id);
      });
      console.log('Filtered courses for professor:', filteredCourses);
      return filteredCourses;
    }
    return [];
  });

  // Initialize students from MOCK_USERS
  const [students, setStudents] = useState(() => {
    // Get only users with role 'student' and format them
    const studentUsers = MOCK_USERS
      .filter(user => user.role === 'student')
      .map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        courses: user.courses || []
      }));

    return studentUsers;
  });

  const [materials, setMaterials] = useState(() => {
    const savedMaterials = localStorage.getItem('courseMaterials');
    return savedMaterials ? JSON.parse(savedMaterials) : [];
  });

  const [availableStudents, setAvailableStudents] = useState([]);

  // Update courses when adminCourses in localStorage changes or user changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCourses = localStorage.getItem('adminCourses');
      const allCourses = savedCourses ? JSON.parse(savedCourses) : [];
      
      // Initialize enrolledStudents for each course if it doesn't exist
      const coursesWithEnrolledStudents = allCourses.map(course => ({
        ...course,
        enrolledStudents: course.enrolledStudents || []
      }));
      
      // Filter courses for the current professor
      if (user && user.role === 'professor') {
        const filteredCourses = coursesWithEnrolledStudents.filter(course => 
          String(course.assignedProfessor) === String(user.id)
        );
        setCourses(filteredCourses);
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Debug effect to monitor courses changes
  useEffect(() => {
    console.log('Courses updated:', courses);
  }, [courses]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('courseMaterials', JSON.stringify(materials));
  }, [materials]);

  // Update available students when a course is selected
  useEffect(() => {
    if (tempCourse) {
      const enrolledIds = tempCourse.enrolledStudents?.map(student => student.id) || [];
      setAvailableStudents(students.filter(student => !enrolledIds.includes(student.id)));
    }
  }, [tempCourse, students]);

  // Update handleAddStudent
  const handleAddStudent = (studentId) => {
    if (tempCourse) {
      const studentToAdd = students.find(s => s.id === studentId);
      if (studentToAdd) {
        // Ensure enrolledStudents exists
        const updatedTempCourse = {
          ...tempCourse,
          enrolledStudents: tempCourse.enrolledStudents || []
        };

        // Update the courses state
        setCourses(prevCourses => 
          prevCourses.map(course => {
            if (course.id === tempCourse.id) {
              return {
                ...course,
                enrolledStudents: [...(course.enrolledStudents || []), studentToAdd]
              };
            }
            return course;
          })
        );

        // Update tempCourse
        setTempCourse({
          ...updatedTempCourse,
          enrolledStudents: [...updatedTempCourse.enrolledStudents, studentToAdd]
        });

        // Update localStorage
        const allCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
        const updatedCourses = allCourses.map(course => {
          if (course.id === tempCourse.id) {
            return {
              ...course,
              enrolledStudents: [...(course.enrolledStudents || []), studentToAdd]
            };
          }
          return course;
        });
        localStorage.setItem('adminCourses', JSON.stringify(updatedCourses));

        // Update available students
        setAvailableStudents(prev => prev.filter(s => s.id !== studentId));
        setShowAddStudentModal(false);

        // Show success alert
        showSuccessAlert(
          'Student Added',
          `${studentToAdd.name} has been successfully enrolled in ${tempCourse.name}`
        );
      }
    }
  };

  // Update handleRemoveStudent
  const handleRemoveStudent = async (studentId) => {
    if (tempCourse) {
      const studentToRemove = tempCourse.enrolledStudents.find(s => s.id === studentId);
      
      // Show confirmation dialog
      const result = await showConfirmDialog(
        'Remove Student',
        `Are you sure you want to remove ${studentToRemove.name} from ${tempCourse.name}?`,
        'Yes, Remove',
        'Cancel'
      );

      if (result.isConfirmed) {
        // Ensure enrolledStudents exists
        const updatedTempCourse = {
          ...tempCourse,
          enrolledStudents: tempCourse.enrolledStudents || []
        };

        // Update the courses state
        setCourses(prevCourses => 
          prevCourses.map(course => {
            if (course.id === tempCourse.id) {
              return {
                ...course,
                enrolledStudents: (course.enrolledStudents || []).filter(s => s.id !== studentId)
              };
            }
            return course;
          })
        );

        // Update tempCourse
        const removedStudent = updatedTempCourse.enrolledStudents.find(s => s.id === studentId);
        setTempCourse({
          ...updatedTempCourse,
          enrolledStudents: updatedTempCourse.enrolledStudents.filter(s => s.id !== studentId)
        });

        // Update localStorage
        const allCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
        const updatedCourses = allCourses.map(course => {
          if (course.id === tempCourse.id) {
            return {
              ...course,
              enrolledStudents: (course.enrolledStudents || []).filter(s => s.id !== studentId)
            };
          }
          return course;
        });
        localStorage.setItem('adminCourses', JSON.stringify(updatedCourses));

        // Update available students
        if (removedStudent) {
          setAvailableStudents(prev => [...prev, removedStudent]);
        }

        // Show success alert
        showSuccessAlert(
          'Student Removed',
          `${removedStudent.name} has been removed from ${tempCourse.name}`
        );
      }
    }
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (courseName.trim() && courseCode.trim()) {
      const newCourse = {
        id: Date.now(),
        name: courseName,
        code: courseCode,
        description: courseDescription,
        createdAt: new Date().toISOString(),
        assignedProfessor: null,
        status: 'draft',
      };
      setCourses([...courses, newCourse]);
      setCourseName('');
      setCourseCode('');
      setCourseDescription('');
      setShowCreateModal(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedCourse) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: 'file',
        path: [...currentPath],
        courseId: selectedCourse.id,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      
      setMaterials(prev => [...prev, newFile]);
      setSelectedFile(null);
      setShowAddMaterialModal(false);

      // Show success alert
      showSuccessAlert(
        'File Uploaded',
        `${file.name} has been successfully uploaded to ${selectedCourse.name}`
      );
    }
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim() && selectedCourse) {
      const newFolder = {
        id: Date.now(),
        name: newFolderName,
        type: 'folder',
        path: [...currentPath],
        courseId: selectedCourse.id,
        items: [],
        createdAt: new Date().toISOString(),
      };
      
      setMaterials(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowCreateFolderModal(false);

      // Show success alert
      showSuccessAlert(
        'Folder Created',
        `Folder "${newFolderName}" has been created successfully`
      );
    } else if (!newFolderName.trim()) {
      // Show error alert if folder name is empty
      showErrorAlert(
        'Error',
        'Please enter a folder name'
      );
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file);
      showSuccessAlert(
        'Download Started',
        `${file.name} is being downloaded`
      );
    } catch (error) {
      console.error('Download failed:', error);
      showErrorAlert(
        'Download Failed',
        'There was an error downloading the file. Please try again.'
      );
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentPath(prev => [...prev, folder.name]);
    setSelectedFolder(folder);
  };

  const navigateBack = () => {
    setCurrentPath(prev => prev.slice(0, -1));
    setSelectedFolder(null);
  };

  const getCurrentMaterials = () => {
    return materials.filter(item => 
      item.courseId === selectedCourse?.id &&
      JSON.stringify(item.path) === JSON.stringify(currentPath)
    );
  };

  const handleDelete = async (item) => {
    try {
      const result = await showConfirmDialog(
        `Delete ${item.type === 'folder' ? 'Folder' : 'File'}`,
        `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        'Yes, Delete',
        'Cancel'
      );

      if (result.isConfirmed) {
        // Remove the item from materials
        setMaterials(prev => prev.filter(material => material.id !== item.id));

        // If it's a folder, also remove all items inside that folder
        if (item.type === 'folder') {
          setMaterials(prev => prev.filter(material => 
            !material.path.includes(item.name)
          ));
        }

        showSuccessAlert(
          'Deleted Successfully',
          `${item.type === 'folder' ? 'Folder' : 'File'} "${item.name}" has been deleted`
        );
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showErrorAlert(
        'Delete Failed',
        'There was an error deleting the item. Please try again.'
      );
    }
  };

  const CourseCard = ({ course }) => {
    const handleCardClick = () => {
      setSelectedCourse(course);
    };

    return (
      <div 
        onClick={handleCardClick}
        className="group relative surface-primary rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-primary cursor-pointer"
      >
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <div className="absolute top-3 right-3">
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddStudentModal(true);
                  setTempCourse(course);
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <UserPlus className="w-3 h-3 text-white" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnrolledStudentsModal(true);
                  setTempCourse(course);
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <Eye className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
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
              <span className="text-muted">Students:</span>
              <span className="font-medium text-primary">
                {(course.enrolledStudents || []).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Materials:</span>
              <span className="font-medium text-primary">
                {course.materials?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Created:</span>
              <span className="font-medium text-primary">
                {new Date(course.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MaterialItem = ({ item }) => {
    return (
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
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateToFolder(item)}
                    className="flex-1 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Open Folder
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(item)}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add a helper function to format file sizes
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                    Teacher
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

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-12 h-12 text-muted mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No courses assigned yet
              </h3>
              <p className="text-secondary text-center">
                Courses assigned to you will appear here
              </p>
            </div>
          ) : (
            <>
              {selectedCourse ? (
                <div className="space-y-6">
                  {selectedCourse && (
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
                  )}
                  
                  {/* Course Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-primary">
                        {selectedCourse.name}
                      </h2>
                      <p className="text-sm text-muted">
                        {selectedCourse.code} • {(selectedCourse.enrolledStudents || []).length} students
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="flex items-center px-4 py-2 surface-primary border border-primary rounded-lg text-primary hover-surface transition-colors"
                      >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Folder
                      </button>
                      <button
                        onClick={() => setShowAddMaterialModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </button>
                    </div>
                  </div>

                  {/* Breadcrumb */}
                  {currentPath.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm surface-primary p-3 rounded-lg shadow-sm border border-primary">
                      <button
                        onClick={navigateBack}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Back
                      </button>
                      <span className="text-muted">/</span>
                      {currentPath.map((folder, index) => (
                        <React.Fragment key={index}>
                          <span className="text-secondary">{folder}</span>
                          {index < currentPath.length - 1 && (
                            <span className="text-muted">/</span>
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
                    <div className="text-center py-12 surface-primary rounded-xl shadow-sm border border-primary">
                      <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-primary mb-2">
                        No materials yet
                      </h3>
                      <p className="text-secondary">
                        Upload files or create folders to get started
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Student Modal */}
        {showAddStudentModal && tempCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-md border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Add Students to {tempCourse.name}
                </h3>
                {availableStudents.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleAddStudent(student.id)}
                        className="w-full p-3 text-left bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
                      >
                        <div className="font-medium text-primary">
                          {student.name}
                        </div>
                        <div className="text-sm text-muted">
                          {student.email}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted py-4">
                    No available students to add
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowAddStudentModal(false);
                      setTempCourse(null);
                    }}
                    className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors border border-gray-300 dark:border-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Enrolled Students Modal */}
        {showEnrolledStudentsModal && tempCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-md border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Enrolled Students - {tempCourse.name}
                </h3>
                {(tempCourse.enrolledStudents || []).length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(tempCourse.enrolledStudents || []).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div>
                          <div className="font-medium text-primary">
                            {student.name}
                          </div>
                          <div className="text-sm text-muted">
                            {student.email}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Remove student"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted py-4">
                    No students enrolled in this course
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowEnrolledStudentsModal(false);
                      setTempCourse(null);
                    }}
                    className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors border border-gray-300 dark:border-slate-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && selectedCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-md border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Create New Folder
                </h3>
                <form onSubmit={handleCreateFolder}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg surface-primary text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateFolderModal(false)}
                      className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors border border-gray-300 dark:border-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium"
                    >
                      Create Folder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Material Modal */}
        {showAddMaterialModal && selectedCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-md border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Upload Files
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-slate-500 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      multiple
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-muted mb-2" />
                      <span className="text-secondary font-medium">
                        Click to upload files
                      </span>
                      <span className="text-sm text-muted">
                        or drag and drop them here
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddMaterialModal(false)}
                    className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors border border-gray-300 dark:border-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
