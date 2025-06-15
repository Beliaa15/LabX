import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  deleteMaterial,
  viewMaterial
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
import CourseListView from '../Common/courseListView';
import CourseDetailView from '../Common/courseDetailView';

const CourseDashboard = () => {
  const { user, token, isAdmin, isTeacher } = useAuth();
  const { sidebarCollapsed } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, folderId } = useParams();
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
  const [showMobileMenu, setShowMobileMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
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
  const [folders, setFolders] = useState([]);
  
  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [materialsViewMode, setMaterialsViewMode] = useState('grid');

  // Upload states
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Dark mode
  const { isDarkMode, handleToggle } = useDarkMode();

  // Load courses and handle URL parameters on mount
  useEffect(() => {
    const initializeFromUrl = async () => {
      if (user && token) {
        try {
          setIsLoading(true);
          // Fetch courses
          let fetchedCourses;
          if (user.role === 'admin') {
            fetchedCourses = await getAllCourses();
          } else {
            fetchedCourses = await getUserCourses();
          }
          setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);

          // If we have a courseId in the URL, load that course
          if (courseId) {
            const course = fetchedCourses.find(c => c._id === courseId);
            if (course) {
              setSelectedCourse(course);
              setTempCourse(course);

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
              // If course not found, redirect to courses list
              navigate('/courses');
            }
          }
        } catch (error) {
          console.error('Error fetching initial data:', error);
          if (!(error.response?.status === 500)) {
            showErrorAlert(
              'Error Loading Data',
              'Failed to load initial data. Please try again later.'
            );
          }
          setCourses([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCourses([]);
        setIsLoading(false);
      }
    };

    initializeFromUrl();
  }, [user, token, courseId, folderId]); // Include courseId and folderId in dependencies

  // Handle location changes
  useEffect(() => {
    // If we're at the root courses page, reset all view states
    if (location.pathname === '/courses') {
      setSelectedCourse(null);
      setSelectedFolder(null);
      setCurrentPath([]);
      setMaterials([]);
      setFolders([]);
    }
  }, [location.pathname]);

  // Escape key handling
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

  const handleCourseClick = (course) => {
    navigate(`/courses/${course._id}`);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedFolder(null);
    setCurrentPath([]);
    setMaterials([]);
    navigate('/courses');
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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (tempCourse && studentEmail.trim()) {
      try {
        await enrollStudent(tempCourse._id, studentEmail);
        setStudentEmail('');
        setShowAddStudentModal(false);

        showSuccessAlert(
          'Student Added',
          `Student with email ${studentEmail} has been successfully enrolled in ${tempCourse.name}`
        );

        const updatedCourses = await (user.role === 'admin' ? getAllCourses() : getUserCourses());
        setCourses(updatedCourses);

      } catch (error) {
        console.error('Failed to add student:', error);
        let errorMessage = 'Failed to add student to the course. ';
        
        // Get the specific error message from the response data
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        showErrorAlert('Error Adding Student', errorMessage);
      }
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

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        
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

    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean);

    if (successfulUploads.length > 0) {
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

      showSuccessAlert(
        'Files Uploaded',
        `Successfully uploaded ${successfulUploads.length} file(s)${
          selectedFolder ? ` to ${selectedFolder.title}` : ''
        }`
      );
    }

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

        showSuccessAlert('Item Deleted', `${item.name} has been successfully deleted`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showErrorAlert(
        'Delete Failed',
        error.response?.data?.message || 'There was an error deleting the item. Please try again.'
      );
    }
  };

  const navigateToFolder = (folder) => {
    setSelectedFolder(folder);
    setCurrentPath(prev => [...prev, folder.title]);
    navigate(`/courses/${selectedCourse._id}/folders/${folder._id}`);
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      if (currentPath.length === 1) {
        setSelectedFolder(null);
        navigate(`/courses/${selectedCourse._id}`);
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

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!tempCourse) return;

    try {
      const updateData = {
        name: updateCourseName.trim(),
        description: updateCourseDescription.trim()
      };

      await updateCourse(tempCourse._id, updateData);
      
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

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!updateFolderTitle.trim() || !selectedFolderToUpdate) return;

    try {
      await updateFolder(selectedCourse._id, selectedFolderToUpdate._id, updateFolderTitle.trim());
      
      const response = await getFolders(selectedCourse._id);
      setFolders(response.folders || []);
      
      setUpdateFolderTitle('');
      setSelectedFolderToUpdate(null);
      setShowUpdateFolderModal(false);

      showSuccessAlert('Folder Updated', 'Folder name has been updated successfully');
    } catch (error) {
      console.error('Failed to update folder:', error);
      showErrorAlert(
        'Error',
        error.response?.data?.message || 'Failed to update folder. Please try again.'
      );
    }
  };

  const handleUpdateFolderClick = (item) => {
    setSelectedFolderToUpdate(item);
    setUpdateFolderTitle(item.title);
    setShowUpdateFolderModal(true);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (newFolderName.trim() && selectedCourse?._id) {
      try {
        await createFolder(selectedCourse._id, newFolderName.trim());
        
        const updatedFolders = await getFolders(selectedCourse._id);
        setFolders(updatedFolders.folders || []);
        
        setNewFolderName('');
        setShowCreateFolderModal(false);

        showSuccessAlert('Folder Created', `Folder "${newFolderName}" has been created successfully`);
      } catch (error) {
        console.error('Failed to create folder:', error);
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to create folder. Please try again.';
        showErrorAlert('Error', errorMessage);
      }
    }
  };

  const handleRemoveStudent = async (student) => {
    try {
      const result = await showConfirmDialog(
        'Remove Student',
        `Are you sure you want to remove ${student.firstName} ${student.lastName} from this course?`,
        'Yes, Remove',
        'Cancel'
      );

      if (!result.isConfirmed) return;

      setIsLoading(true);
      await unenrollStudent(tempCourse._id, student.email);
      
      const updatedStudents = tempCourse.students.filter(s => s._id !== student._id);
      setTempCourse(prev => ({ ...prev, students: updatedStudents }));

      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course._id === tempCourse._id) {
            return { ...course, students: updatedStudents };
          }
          return course;
        })
      );

      showSuccessAlert(
        'Student Removed',
        `${student.firstName} ${student.lastName} has been removed from the course`
      );

      if (updatedStudents.length === 0) {
        setShowEnrolledStudentsModal(false);
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
  };

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
            onShowCreateFolderModal={() => setShowCreateFolderModal(true)}
            onShowAddMaterialModal={() => setShowAddMaterialModal(true)}
            onNavigateToFolder={navigateToFolder}
            onDownload={handleDownload}
            onView={handleView}
            onDelete={handleDelete}
            onUpdateFolder={handleUpdateFolderClick}
            formatFileSize={formatFileSize}
            isLoadingFolders={isLoadingFolders}
            isLoadingFiles={isLoadingFiles}
          />
        ) : (
          <CourseListView
            courses={courses}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            user={user}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            onShowCreateModal={() => setShowCreateModal(true)}
            onCourseClick={handleCourseClick}
            onAddStudent={handleAddStudentClick}
            onViewStudents={handleViewStudentsClick}
            onUpdateCourse={handleUpdateCourseClick}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

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

export default CourseDashboard;