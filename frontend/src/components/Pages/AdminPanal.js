import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
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
import { 
  createCourse, 
  getUserCourses, 
  getAllCourses, 
  deleteCourse, 
  enrollStudent, 
  unenrollStudent, 
  updateCourse 
} from '../../services/courseService';
import { 
  downloadFile, 
  uploadMaterial, 
  createMaterialFormData, 
  getMaterials, 
  downloadMaterial, 
  deleteMaterial 
} from '../../services/materialService';
import { 
  createFolder, 
  getFolders, 
  deleteFolder, 
  updateFolder 
} from '../../services/folderService';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import SearchBar from '../ui/SearchBar';
import ViewModeToggle from '../ui/ViewModeToggle';
import CourseCard from '../ui/CourseComponents';
import CreateCourseModal from '../Common/Modals/CreateCourseModal';
import AddStudentModal from '../Common/Modals/AddStudentModal';
import ViewStudentsModal from '../Common/Modals/ViewEnrolledStudentsModal';
import UploadFilesModal from '../Common/Modals/UploadFilesModal';
import CreateFolderModal from '../Common/Modals/CreateFolderModal';
import UpdateCourseModal from '../Common/Modals/UpdateCourseModal';
import UpdateFolderModal from '../Common/Modals/UpdateFolderModal';
import ToggleButton from '../ui/ToggleButton';
import { useDarkMode } from '../Common/useDarkMode';

const AdminCourseManagement = () => {
  const { user, token, isAdmin, isTeacher } = useAuth();
  const { sidebarCollapsed } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdateFolderModal, setShowUpdateFolderModal] = useState(false);
  const [updateFolderTitle, setUpdateFolderTitle] = useState('');
  const [selectedFolderToUpdate, setSelectedFolderToUpdate] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(null); // Add this line
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
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Add state to track dark mode
  const { isDarkMode, handleToggle } = useDarkMode();

  // Initialize folders as an empty array
  const [folders, setFolders] = useState([]);

  // Add new state for materials search
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [materialsViewMode, setMaterialsViewMode] = useState('grid');

  // Add new state for upload progress
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);

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

  // Add useEffect to load folders when course is selected
  useEffect(() => {
    const loadFolders = async () => {
      if (selectedCourse) {
        try {
          console.log('Loading folders for course:', selectedCourse._id);
          const response = await getFolders(selectedCourse._id);
          setFolders(response.folders || []);
        } catch (error) {
          console.error('Failed to load folders:', error);
          showErrorAlert(
            'Error Loading Folders',
            'Failed to load folders. Please try again later.'
          );
          setFolders([]);
        }
      } else {
        setFolders([]);
      }
    };

    loadFolders();
    // Clear materials when course changes
    setMaterials([]);
  }, [selectedCourse]);

  // Add useEffect to load materials only when a folder is selected
  useEffect(() => {
    const loadMaterials = async () => {
      if (selectedCourse && selectedFolder) {
        try {
          console.log('Loading materials for folder:', selectedFolder._id);
          const response = await getMaterials(selectedCourse._id, selectedFolder._id);
          
          const transformedMaterials = response.materials.map(material => ({
            _id: material._id,
            id: material._id,
            name: material.title,
            title: material.title,
            type: 'file',
            size: material.fileSize || 0,
            uploadedAt: material.createdAt,
            courseId: selectedCourse._id,
            folderId: selectedFolder._id,
            path: currentPath,
            filePath: material.filePath
          }));

          setMaterials(transformedMaterials);
        } catch (error) {
          console.error('Failed to load materials:', error);
          showErrorAlert(
            'Error Loading Materials',
            'Failed to load materials. Please try again later.'
          );
          setMaterials([]);
        }
      } else {
        // Clear materials when no folder is selected
        setMaterials([]);
      }
    };

    loadMaterials();
  }, [selectedFolder]);

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

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setTempCourse(course);
    setSelectedFolder(null);
    setCurrentPath([]);
    setMaterials([]);
  };

  const handleAddStudentClick = (course) => {
    setTempCourse(course);
    setShowAddStudentModal(true);
  };

  const handleViewStudentsClick = (course) => {
    setShowEnrolledStudentsModal(true);
    setTempCourse(course);
  };

  const handleUpdateCourseClick = (course) => {
    setTempCourse(course);
    setUpdateCourseName(course.name);
    setUpdateCourseDescription(course.description || '');
    setShowUpdateModal(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (courseName.trim()) {
      try {
        const courseData = {
          name: courseName,
          description: courseDescription,
        };
        
        const newCourse = await createCourse(courseData);
        
        // Add teacher information to the new course before updating state
        const courseWithTeacher = {
          ...newCourse,
          teacher: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          },
          students: []
        };

        setCourses(prevCourses => [...prevCourses, courseWithTeacher]);
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

  const handleFileUpload = async (files) => {
    if (!selectedCourse) return;

    const allowedTypes = ['application/pdf', 'image/*', 'text/*', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/*', 'audio/*'];

    const uploadFile = async (file) => {
      try {
        // Validate file type
        const isValidType = allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return file.type.startsWith(category + '/');
          }
          return file.type === type;
        });

        if (!isValidType) {
          showErrorAlert('Invalid File Type', `${file.name} is not an allowed file type.`);
          return null;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        
        // Upload with progress tracking
        const result = await uploadMaterial(
          selectedCourse._id,
          selectedFolder?._id || '',
          formData,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
        );

        return result.material;
      } catch (error) {
        console.error('Upload failed:', error);
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Failed to upload file. Please try again.';
        showErrorAlert('Upload Failed', `${file.name}: ${errorMessage}`);
        return null;
      }
    };

    // Handle multiple files
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean);

    if (successfulUploads.length > 0) {
      // Refresh materials from the server after successful uploads
      const response = await getMaterials(selectedCourse._id, selectedFolder?._id || '');
      const transformedMaterials = response.materials.map(material => ({
        _id: material._id,
        id: material._id,
        name: material.title,
        title: material.title,
        type: 'file',
        size: material.fileSize || 0,
        uploadedAt: material.createdAt,
        courseId: selectedCourse._id,
        folderId: selectedFolder?._id || '',
        path: currentPath,
        filePath: material.filePath
      }));

      setMaterials(transformedMaterials);

      // Show success message
      showSuccessAlert(
        'Files Uploaded',
        `Successfully uploaded ${successfulUploads.length} file(s)${
          selectedFolder ? ` to ${selectedFolder.title}` : ''
        }`
      );
    }

    // Reset states
    setSelectedFile(null);
    setShowAddMaterialModal(false);
    setUploadProgress({});
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

  const handleDownload = async (material) => {
    try {
      if (material.type === 'file') {
        await downloadMaterial(
          selectedCourse._id,
          material.folderId || '',
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
        'There was an error downloading the file. Please try again.'
      );
    }
  };

  const handleDelete = async (item) => {
    try {
      const result = await showConfirmDialog(
        `Delete ${item.type === 'folder' ? 'Folder' : 'File'}`,
        `Are you sure you want to delete "${item.title || item.name}"? This action cannot be undone.`,
        'Yes, Delete',
        'Cancel'
      );

      if (result.isConfirmed) {
        if (item.type === 'folder') {
          await deleteFolder(selectedCourse._id, item._id);
          setFolders(prevFolders => prevFolders.filter(folder => folder._id !== item._id));
        } else {
          await deleteMaterial(selectedCourse._id, item.folderId || '', item._id);
          // Refresh materials from server after deletion
          const response = await getMaterials(selectedCourse._id, selectedFolder?._id || '');
          const transformedMaterials = response.materials.map(material => ({
            _id: material._id,
            id: material._id,
            name: material.title,
            title: material.title,
            type: 'file',
            size: material.fileSize || 0,
            uploadedAt: material.createdAt,
            courseId: selectedCourse._id,
            folderId: selectedFolder?._id || '',
            path: currentPath,
            filePath: material.filePath
          }));
          setMaterials(transformedMaterials);
        }

        showSuccessAlert(
          'Item Deleted',
          `${item.name} has been successfully deleted`
        );
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showErrorAlert(
        'Delete Failed',
        error.response?.data?.message || 'There was an error deleting the item. Please try again.'
      );
    }
  };

  const getCurrentMaterials = () => {
    // For root level (no current path), show only folders
    const currentFolders = Array.isArray(folders) ? 
      folders.map(folder => ({
        ...folder,
        id: folder._id,
        name: folder.title,
        type: 'folder'
      })).filter(folder => !selectedFolder) : 
      [];

    // Show materials only if a folder is selected
    const currentFiles = selectedFolder ? materials : [];

    return [...currentFolders, ...currentFiles];
  };

  const navigateToFolder = (folder) => {
    setSelectedFolder(folder);
    setCurrentPath(prev => [...prev, folder.title]);
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      // If going back to root, clear selected folder
      if (currentPath.length === 1) {
        setSelectedFolder(null);
      }
    }
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
      <div className="surface-primary rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/20 overflow-hidden group backdrop-blur-sm">
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
              onClick={() => item.type === 'folder' ? navigateToFolder(item) : handleDownload(item)}
              className={`mx-auto w-20 h-20 flex items-center justify-center rounded-2xl cursor-pointer transform group-hover:scale-105 transition-all duration-300 shadow-lg ${
                item.type === 'folder' 
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800 dark:to-amber-900 group-hover:from-amber-100 group-hover:to-amber-200 dark:group-hover:from-amber-700 dark:group-hover:to-amber-800' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-700 dark:group-hover:to-blue-800'
              }`}>
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

            {/* Action Icons */}
            <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {item.type === 'folder' ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToFolder(item);
                    }}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Open Folder"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolderToUpdate(item);
                      setUpdateFolderTitle(item.title);
                      setShowUpdateFolderModal(true);
                    }}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Edit Folder Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

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

  // Add MaterialListItem component
  const MaterialListItem = ({ item }) => {
    return (
      <div 
        onClick={() => item.type === 'folder' ? navigateToFolder(item) : handleDownload(item)}
        className="group surface-primary rounded-lg border border-primary hover:shadow-md transition-all duration-200 hover-surface cursor-pointer"
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

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.type === 'folder' ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToFolder(item);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  title="Open Folder"
                >
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFolderToUpdate(item);
                    setUpdateFolderTitle(item.title);
                    setShowUpdateFolderModal(true);
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
                  handleDownload(item);
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
                handleDelete(item);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              title={`Delete ${item.type === 'folder' ? 'Folder' : 'File'}`}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
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

  // Add filtered materials function
  const getFilteredMaterials = () => {
    const currentMaterials = getCurrentMaterials();
    if (!materialsSearchQuery) return currentMaterials;
    
    return currentMaterials.filter(item => 
      item.name.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
      (item.type === 'folder' && item.title.toLowerCase().includes(materialsSearchQuery.toLowerCase()))
    );
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!updateFolderTitle.trim() || !selectedFolderToUpdate) return;

    try {
      // Call the updateFolder API
      await updateFolder(selectedCourse._id, selectedFolderToUpdate._id, updateFolderTitle.trim());
      
      // Refresh folders list
      const response = await getFolders(selectedCourse._id);
      setFolders(response.folders || []);
      
      // Reset state and close modal
      setUpdateFolderTitle('');
      setSelectedFolderToUpdate(null);
      setShowUpdateFolderModal(false);

      showSuccessAlert(
        'Folder Updated',
        'Folder name has been updated successfully'
      );
    } catch (error) {
      console.error('Failed to update folder:', error);
      showErrorAlert(
        'Error',
        error.response?.data?.message || 'Failed to update folder. Please try again.'
      );
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (newFolderName.trim() && selectedCourse?._id) {
      try {
        // Create folder using the API with the correct course ID (_id) and title as string
        const response = await createFolder(selectedCourse._id, newFolderName.trim());
        
        // Fetch updated folders list
        const updatedFolders = await getFolders(selectedCourse._id);
        setFolders(updatedFolders.folders || []);
        
        // Reset form and close modal
        setNewFolderName('');
        setShowCreateFolderModal(false);

        showSuccessAlert(
          'Folder Created',
          `Folder "${newFolderName}" has been created successfully`
        );
      } catch (error) {
        console.error('Failed to create folder:', error);
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to create folder. Please try again.';
        showErrorAlert('Error', errorMessage);
      }
    } else if (!newFolderName.trim()) {
      showErrorAlert(
        'Error',
        'Please enter a folder name'
      );
    } else {
      showErrorAlert(
        'Error',
        'No course selected or invalid course ID'
      );
    }
  };
  const handleRemoveStudent = async (student) => {
    try {
      // Show confirmation dialog
      const result = await showConfirmDialog(
        'Remove Student',
        `Are you sure you want to remove ${student.firstName} ${student.lastName} from this course?`,
        'Yes, Remove',
        'Cancel'
      );

      // Exit if user cancelled
      if (!result.isConfirmed) {
        return;
      }

      // Set loading state
      setIsLoading(true);

      // Call API to unenroll student
      await unenrollStudent(tempCourse._id, student.email);
      
      // Update local state - remove student from tempCourse
      const updatedStudents = tempCourse.students.filter(s => s._id !== student._id);
      setTempCourse(prev => ({
        ...prev,
        students: updatedStudents
      }));

      // Update courses list with the updated student list
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

      // Show success message
      showSuccessAlert(
        'Student Removed',
        `${student.firstName} ${student.lastName} has been removed from the course`
      );

      // Close modal if no students left
      if (updatedStudents.length === 0) {
        setShowEnrolledStudentsModal(false);
      }

    } catch (error) {
      console.error('Failed to remove student:', error);
      
      // Handle different error scenarios
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
      // Always reset loading state
      setIsLoading(false);
    }
  };
  
  // Add useEffect for escape key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showAddMaterialModal) {
          setShowAddMaterialModal(false);
          setUploadProgress({});
        }
        if (showCreateFolderModal) {
          setShowCreateFolderModal(false);
          setNewFolderName('');
        }
        if (showCreateModal) {
          setShowCreateModal(false);
          setCourseName('');
          setCourseDescription('');
        }
        if (showAddStudentModal) {
          setShowAddStudentModal(false);
          setStudentEmail('');
        }
        if (showEnrolledStudentsModal) {
          setShowEnrolledStudentsModal(false);
        }
        if (showUpdateModal) {
          setShowUpdateModal(false);
        }
        if (showUpdateFolderModal) {
          setShowUpdateFolderModal(false);
          setUpdateFolderTitle('');
          setSelectedFolderToUpdate(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAddMaterialModal, showCreateFolderModal, showCreateModal, showAddStudentModal, showEnrolledStudentsModal, showUpdateModal, showUpdateFolderModal]);

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div
        className={`${
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <Header
          title={user?.role === "admin" ? "Course Management" : "My Courses"}
          user={user}
          isAdmin={isAdmin}
          isTeacher={isTeacher}
          isDarkMode={isDarkMode}
          handleToggle={handleToggle}
        />

        {/* Controls */}
        <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
            {!selectedCourse ? (
              // Course list controls
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    {user?.role === "admin"
                      ? "Create Course"
                      : "Create New Course"}
                  </span>
                  <span className="sm:hidden">Create</span>
                </button>
                <span className="text-sm text-secondary whitespace-nowrap">
                  {courses.length} course{courses.length !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              // Materials controls
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center px-3 py-2 surface-primary border border-primary rounded-lg text-primary hover-surface transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden md:inline ml-2 text-sm">
                    New Folder
                  </span>
                </button>
                {selectedFolder && (
                  <button
                    onClick={() => setShowAddMaterialModal(true)}
                    className="flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden md:inline ml-2 text-sm">
                      Upload Files
                    </span>
                  </button>
                )}
                <span className="text-sm text-secondary whitespace-nowrap">
                  {getCurrentMaterials().length} item
                  {getCurrentMaterials().length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Search and View Controls - Right side */}
            <div className="flex items-center justify-end space-x-3 flex-shrink-0">
              {/* Search Bar */}
              <SearchBar
                value={selectedCourse ? materialsSearchQuery : searchQuery}
                onChange={
                  selectedCourse ? setMaterialsSearchQuery : setSearchQuery
                }
                placeholder={
                  selectedCourse
                    ? "Search folders and files..."
                    : `Search ${
                        user?.role === "admin" ? "courses" : "your courses"
                      }...`
                }
                className="w-64 sm:w-72"
              />

              {/* View Mode Toggle */}
              <ViewModeToggle
                viewMode={selectedCourse ? materialsViewMode : viewMode}
                onViewModeChange={
                  selectedCourse ? setMaterialsViewMode : setViewMode
                }
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="animate-fadeIn flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-12 h-12 text-muted mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    {searchQuery
                      ? "No courses found"
                      : user?.role === "admin"
                      ? "No courses created yet"
                      : "You haven't created any courses yet"}
                  </h3>
                  <p className="text-secondary text-center mb-8">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : user?.role === "admin"
                      ? "Create your first course to get started"
                      : "Create your first course to start teaching"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {user?.role === "admin"
                        ? "Create First Course"
                        : "Create Your First Course"}
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
                      <div>
                        <h2 className="text-xl font-semibold text-primary">
                          {selectedCourse.name}
                        </h2>
                        <p className="text-sm text-muted">
                          {selectedCourse.code} •{" "}
                          {(selectedCourse.students || []).length} students
                        </p>
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

                      {/* Materials Grid/List */}
                      <div
                        className={
                          materialsViewMode === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "flex flex-col space-y-4"
                        }
                      >
                        {getFilteredMaterials().map((item) =>
                          materialsViewMode === "grid" ? (
                            <MaterialItem
                              key={item._id || item.id}
                              item={item}
                            />
                          ) : (
                            <MaterialListItem
                              key={item._id || item.id}
                              item={item}
                            />
                          )
                        )}
                      </div>

                      {getFilteredMaterials().length === 0 && (
                        <div className="text-center py-12 surface-primary rounded-xl shadow-sm border border-primary">
                          <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-primary mb-2">
                            {materialsSearchQuery
                              ? "No matching items found"
                              : "No materials yet"}
                          </h3>
                          <p className="text-secondary">
                            {materialsSearchQuery
                              ? "Try adjusting your search terms"
                              : "Upload files or create folders to get started"}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          : "flex flex-col space-y-4"
                      }
                    >
                      {filteredCourses.map((course) => (
                        <CourseCard
                          key={course._id}
                          course={course}
                          user={user}
                          viewMode={viewMode === "grid" ? "card" : "list"}
                          onCourseClick={handleCourseClick}
                          onAddStudent={handleAddStudentClick}
                          onViewStudents={handleViewStudentsClick}
                          onUpdateCourse={handleUpdateCourseClick}
                          onDeleteCourse={handleDeleteCourse}
                          showMobileMenu={showMobileMenu}
                          setShowMobileMenu={setShowMobileMenu}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Create Course Modal */}
        {showCreateModal && (
          <CreateCourseModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCourse}
            courseName={courseName}
            setCourseName={setCourseName}
            courseDescription={courseDescription}
            setCourseDescription={setCourseDescription}
            userRole={user?.role}
          />
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && tempCourse && (
          <AddStudentModal
            isOpen={showAddStudentModal && tempCourse}
            onClose={() => setShowAddStudentModal(false)}
            onSubmit={handleAddStudent}
            studentEmail={studentEmail}
            setStudentEmail={setStudentEmail}
            courseName={tempCourse?.name}
          />
        )}

        {/* View Enrolled Students Modal */}
        {showEnrolledStudentsModal && tempCourse && (
          <ViewStudentsModal
            isOpen={showEnrolledStudentsModal && tempCourse}
            onClose={() => setShowEnrolledStudentsModal(false)}
            courseName={tempCourse?.name}
            students={tempCourse?.students || []}
            onRemoveStudent={handleRemoveStudent}
            isLoading={isLoading}
          />
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && selectedCourse && (
          <CreateFolderModal
            isOpen={showCreateFolderModal && selectedCourse}
            onClose={() => setShowCreateFolderModal(false)}
            onSubmit={handleCreateFolder}
            folderName={newFolderName}
            setFolderName={setNewFolderName}
          />
        )}

        {/* Add Material Modal */}
        {showAddMaterialModal && selectedCourse && (
          <UploadFilesModal
            isOpen={showAddMaterialModal && selectedCourse}
            onClose={() => {
              setShowAddMaterialModal(false);
              setUploadProgress({});
            }}
            onFileUpload={handleFileUpload}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            uploadProgress={uploadProgress}
          />
        )}

        {/* Update Course Modal */}
        {showUpdateModal && tempCourse && (
          <UpdateCourseModal
            isOpen={showUpdateModal && tempCourse}
            onClose={() => setShowUpdateModal(false)}
            onSubmit={handleSubmitUpdate}
            courseName={updateCourseName}
            setCourseName={setUpdateCourseName}
            courseDescription={updateCourseDescription}
            setCourseDescription={setUpdateCourseDescription}
          />
        )}

        {/* Update Folder Modal */}
        {showUpdateFolderModal && selectedFolderToUpdate && (
          <UpdateFolderModal
            isOpen={showUpdateFolderModal && selectedFolderToUpdate}
            onClose={() => {
              setShowUpdateFolderModal(false);
              setUpdateFolderTitle("");
              setSelectedFolderToUpdate(null);
            }}
            onSubmit={handleUpdateFolder}
            folderTitle={updateFolderTitle}
            setFolderTitle={setUpdateFolderTitle}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCourseManagement;