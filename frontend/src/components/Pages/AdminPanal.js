import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { downloadFile } from '../../services/fileService';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmDialog 
} from '../../utils/sweetAlert';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  BookOpen,
  Users,
  Calendar,
  UserPlus,
  Settings,
  Edit2,
  Trash2,
  File,
  Folder,
  UserMinus,
  Eye,
  Download,
  Upload,
  FolderPlus,
  FileText,
} from 'lucide-react';
import { createCourse, getUserCourses, getAllCourses, deleteCourse, enrollStudent, unenrollStudent, updateCourse } from '../../services/courseService';

const AdminCourseManagement = () => {
  const { user, token } = useAuth();
  const { sidebarCollapsed } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [updateCourseName, setUpdateCourseName] = useState('');
  const [updateCourseDescription, setUpdateCourseDescription] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  
  // Selected states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [tempCourse, setTempCourse] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  
  // Data states
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState(() => {
    const savedMaterials = localStorage.getItem('courseMaterials');
    return savedMaterials ? JSON.parse(savedMaterials) : [];
  });

  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Add state to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  // Load courses when component mounts or when user/token changes
  useEffect(() => {
    if (user && token) {
      fetchCourses();
    } else {
      // Clear courses if no user or token
      setCourses([]);
      setIsLoading(false);
    }
  }, [user, token]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      let fetchedCourses;
      
      if (user.role === 'admin') {
        // Admin sees all courses
        fetchedCourses = await getAllCourses();
      } else {
        // Teachers see only their courses
        fetchedCourses = await getUserCourses();
      }
      
      // Ensure we always set an array, even if empty
      setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Only show error alert if it's not the "no courses" case
      if (!(error.response?.status === 500)) {
        showErrorAlert(
          'Error Loading Courses',
          'Failed to load courses. Please try again later.'
        );
      }
      // Set empty array for courses on error
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selected course when courses change
  useEffect(() => {
    setSelectedCourse(null);
    setCurrentPath([]);
  }, [courses]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (courseName.trim()) {
      try {
        const courseData = {
          name: courseName,
          description: courseDescription,
        };
        
        const newCourse = await createCourse(courseData);
        setCourses(prevCourses => [...prevCourses, newCourse]);
        setCourseName('');
        setCourseDescription('');
        setShowCreateModal(false);
        
        showSuccessAlert('Course Created', `Course "${courseName}" has been created successfully. Course Code: ${newCourse.code}`);
      } catch (error) {
        console.error('Failed to create course:', error);
        showErrorAlert(
          'Error Creating Course',
          error.response?.data?.message || 'Failed to create course. Please try again.'
        );
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const courseToDelete = courses.find(c => c._id === courseId);
    
    // Show confirmation dialog before deleting
    const result = await showConfirmDialog(
      'Delete Course',
      `Are you sure you want to delete "${courseToDelete.name}"? This action cannot be undone.`,
      'Yes, Delete',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter(course => course._id !== courseId));
        showSuccessAlert('Course Deleted', `Course "${courseToDelete.name}" has been deleted successfully`);
      } catch (error) {
        console.error('Failed to delete course:', error);
        showErrorAlert(
          'Error Deleting Course',
          error.response?.data?.message || 'Failed to delete course. Please try again.'
        );
      }
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CourseCard = ({ course }) => {
    const handleCardClick = () => {
      setSelectedCourse(course);
      setTempCourse(course);
      setCurrentPath([]);
    };

    const handleAddStudentsClick = (e) => {
      e.stopPropagation();
      setTempCourse(course);
      setShowAddStudentModal(true);
    };

    const handleUpdateCourse = (course) => {
      setTempCourse(course);
      setUpdateCourseName(course.name);
      setUpdateCourseDescription(course.description || '');
      setShowUpdateModal(true);
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
                onClick={handleAddStudentsClick}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Add Student"
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
                title="View Enrolled Students"
              >
                <Eye className="w-3 h-3 text-white" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateCourse(course);
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Update Course"
              >
                <Edit2 className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course._id);
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Delete Course"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <span className="text-xs px-2 py-1 rounded bg-white/20 text-white backdrop-blur-sm">
              Code: {course.code}
            </span>
            {user?.role === 'admin' && (
              <span className="text-xs px-2 py-1 rounded bg-white/20 text-white backdrop-blur-sm truncate ml-2">
                By: {course.teacher.firstName} {course.teacher.lastName}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-primary text-lg mb-2 line-clamp-1">
            {course.name}
          </h3>
          {course.description && (
            <p className="text-sm text-muted mb-3 line-clamp-2">
              {course.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Students:</span>
              <span className="font-medium text-primary">
                {Array.isArray(course.students) ? course.students.length : 0}
              </span>
            </div>
            {user?.role === 'admin' && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Teacher:</span>
                <span className="font-medium text-primary truncate ml-2">
                  {course.teacher.email}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted">Created:</span>
              <span className="font-medium text-primary">
                {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CourseListItem = ({ course }) => (
    <div className="group surface-primary rounded-lg border border-primary hover:shadow-md transition-all duration-200 hover-surface">
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
              <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                Code: {course.code}
              </span>
              {user?.role === 'admin' && (
                <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  Teacher: {course.teacher.firstName} {course.teacher.lastName}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-secondary">
              <span>{Array.isArray(course.students) ? course.students.length : 0} students</span>
              <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
              {user?.role === 'admin' && (
                <span className="text-muted">{course.teacher.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (tempCourse && studentEmail.trim()) {
      try {
        console.log('Attempting to add student:', {
          studentEmail,
          courseId: tempCourse._id,
          courseName: tempCourse.name
        });

        // Call the API to enroll the student
        await enrollStudent(tempCourse._id, studentEmail);

        // Clear the input
        setStudentEmail('');
        setShowAddStudentModal(false);

        showSuccessAlert(
          'Student Added',
          `Student with email ${studentEmail} has been successfully enrolled in ${tempCourse.name}`
        );

        // Refresh the course data to get the updated enrolled students
        const updatedCourses = await (user.role === 'admin' ? getAllCourses() : getUserCourses());
        setCourses(updatedCourses);

      } catch (error) {
        console.error('Failed to add student. Error details:', {
          error,
          response: error.response,
          data: error.response?.data,
          status: error.response?.status
        });

        let errorMessage = 'Failed to add student to the course. ';
        
        if (error.response?.status === 500) {
          errorMessage += 'Server error occurred. The student might already be enrolled in this course.';
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += 'Please try again later.';
        }

        showErrorAlert(
          'Error Adding Student',
          errorMessage
        );
      }
    } else {
      showErrorAlert(
        'Error Adding Student',
        'Please enter a valid email address.'
      );
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (tempCourse) {
      const studentToRemove = tempCourse.students.find(s => s.id === studentId);
      
      const result = await showConfirmDialog(
        'Remove Student',
        `Are you sure you want to remove ${studentToRemove.name} from ${tempCourse.name}?`,
        'Yes, Remove',
        'Cancel'
      );

      if (result.isConfirmed) {
        // Update the courses state
        setCourses(prevCourses => 
          prevCourses.map(course => {
            if (course.id === tempCourse.id) {
              return {
                ...course,
                students: (course.students || []).filter(s => s.id !== studentId)
              };
            }
            return course;
          })
        );

        // Update tempCourse
        setTempCourse({
          ...tempCourse,
          students: tempCourse.students.filter(s => s.id !== studentId)
        });

        // Update localStorage
        const allCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
        const updatedCourses = allCourses.map(course => {
          if (course.id === tempCourse.id) {
            return {
              ...course,
              students: (course.students || []).filter(s => s.id !== studentId)
            };
          }
          return course;
        });
        localStorage.setItem('adminCourses', JSON.stringify(updatedCourses));

        // Update available students
        if (studentToRemove) {
          setAvailableStudents(prev => [...prev, studentToRemove]);
        }

        showSuccessAlert(
          'Student Removed',
          `${studentToRemove.name} has been removed from ${tempCourse.name}`
        );
      }
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

      showSuccessAlert(
        'Folder Created',
        `Folder "${newFolderName}" has been created successfully`
      );
    } else if (!newFolderName.trim()) {
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

  const handleDelete = async (item) => {
    try {
      const result = await showConfirmDialog(
        `Delete ${item.type === 'folder' ? 'Folder' : 'File'}`,
        `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        'Yes, Delete',
        'Cancel'
      );

      if (result.isConfirmed) {
        setMaterials(prev => prev.filter(material => material.id !== item.id));

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

  // Helper function to format file sizes
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Helper function to get role-specific title
  const getRoleTitle = () => {
    if (user?.role === 'admin') {
      return 'Course Management';
    }
    return 'My Courses';
  };

  // Helper function to get role display text
  const getRoleDisplay = () => {
    return user?.role === 'admin' ? 'Administrator' : 'Teacher';
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!tempCourse) return;

    try {
      const updateData = {
        name: updateCourseName.trim(),
        description: updateCourseDescription.trim()
      };

      await updateCourse(tempCourse._id, updateData);
      
      // Update the courses list with the new data
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === tempCourse._id 
            ? { ...course, ...updateData }
            : course
        )
      );

      setShowUpdateModal(false);
      showSuccessAlert('Course Updated', `Course "${updateCourseName}" has been updated successfully`);
    } catch (error) {
      console.error('Failed to update course:', error);
      showErrorAlert(
        'Error Updating Course',
        error.response?.data?.message || 'Failed to update course. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-primary transition-all duration-300">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200 transition-colors duration-300">
                {getRoleTitle()}
              </h1>
            </div>
            <div className="flex items-center space-x-6">
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
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    {getRoleDisplay()}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

              {/* Dark Mode Toggle */}
              <ToggleButton
                isChecked={isDarkMode}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsDarkMode(checked);
                  if (checked) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('darkMode', 'true');
                  } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('darkMode', 'false');
                  }
                }}
                className="transform hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                {user?.role === 'admin' ? 'Create Course' : 'Create New Course'}
              </button>
              <span className="text-sm text-secondary">
                {courses.length} course{courses.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder={`Search ${user?.role === 'admin' ? 'courses' : 'your courses'}...`}
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

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
              <BookOpen className="w-12 h-12 text-muted mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">
                {searchQuery ? 'No courses found' : user?.role === 'admin' ? 'No courses created yet' : 'You haven\'t created any courses yet'}
              </h3>
              <p className="text-secondary text-center mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : user?.role === 'admin' 
                    ? 'Create your first course to get started'
                    : 'Create your first course to start teaching'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {user?.role === 'admin' ? 'Create First Course' : 'Create Your First Course'}
                </button>
              )}
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
                        {selectedCourse.code} • {(selectedCourse.students || []).length} students
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
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-lg border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  {user?.role === 'admin' ? 'Create New Course' : 'Create Your Course'}
                </h3>
                <form onSubmit={handleCreateCourse}>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Course Name"
                        className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary"
                        required
                      />
                      <label
                        htmlFor="courseName"
                        className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                      >
                        Course Name
                      </label>
                    </div>
                    <div className="relative">
                      <textarea
                        id="courseDescription"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        placeholder="Course Description"
                        rows="3"
                        className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary resize-none"
                      />
                      <label
                        htmlFor="courseDescription"
                        className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                      >
                        Course Description (Optional)
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && tempCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-md border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Add Student to {tempCourse.name}
                </h3>
                <form onSubmit={handleAddStudent}>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        id="studentEmail"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="Student Email"
                        className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary"
                        required
                      />
                      <label
                        htmlFor="studentEmail"
                        className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                      >
                        Student Email
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddStudentModal(false);
                        setStudentEmail('');
                      }}
                      className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Add Student
                    </button>
                  </div>
                </form>
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
                {(tempCourse.students || []).length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(tempCourse.students || []).map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div>
                          <div className="font-medium text-primary">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted">
                            {student.email}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const result = await showConfirmDialog(
                                'Remove Student',
                                `Are you sure you want to remove ${student.firstName} ${student.lastName} from this course?`,
                                'Yes, Remove',
                                'Cancel'
                              );

                              if (result.isConfirmed) {
                                setIsLoading(true);
                                await unenrollStudent(tempCourse._id, student.email);
                                
                                // First update tempCourse to trigger UI update
                                const updatedStudents = tempCourse.students.filter(s => s._id !== student._id);
                                setTempCourse(prev => ({
                                  ...prev,
                                  students: updatedStudents
                                }));

                                // Then update the main courses list
                                setCourses(prevCourses => 
                                  prevCourses.map(course => {
                                    if (course._id === tempCourse._id) {
                                      return {
                                        ...course,
                                        students: updatedStudents
                                      };
                                    }
                                    return course;
                                  })
                                );

                                showSuccessAlert(
                                  'Student Removed',
                                  `${student.firstName} ${student.lastName} has been removed from the course`
                                );

                                // If no more students, close the modal
                                if (updatedStudents.length === 0) {
                                  setShowEnrolledStudentsModal(false);
                                }
                              }
                            } catch (error) {
                              console.error('Failed to remove student:', error);
                              let errorMessage = 'Failed to remove student. ';
                              
                              if (error.response?.status === 403) {
                                errorMessage += 'You do not have permission to remove students from this course.';
                              } else if (error.response?.data?.message) {
                                errorMessage += error.response.data.message;
                              } else {
                                errorMessage += 'Please try again later.';
                              }

                              showErrorAlert('Remove Failed', errorMessage);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          title="Remove student from course"
                        >
                          <UserMinus className="w-5 h-5" />
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

        {/* Update Course Modal */}
        {showUpdateModal && tempCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="surface-primary rounded-xl shadow-xl w-full max-w-lg border border-primary">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Update Course
                </h3>
                <form onSubmit={handleSubmitUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="updateCourseName" className="block text-sm font-medium text-primary mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        id="updateCourseName"
                        value={updateCourseName}
                        onChange={(e) => setUpdateCourseName(e.target.value)}
                        className="w-full px-4 py-2 border border-primary rounded-lg surface-primary text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="updateCourseDescription" className="block text-sm font-medium text-primary mb-1">
                        Course Description
                      </label>
                      <textarea
                        id="updateCourseDescription"
                        value={updateCourseDescription}
                        onChange={(e) => setUpdateCourseDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-primary rounded-lg surface-primary text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2 border border-primary rounded-lg text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Update Course
                    </button>
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

export default AdminCourseManagement;