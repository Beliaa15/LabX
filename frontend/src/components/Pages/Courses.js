import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { MOCK_USERS } from '../../services/authService';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  BookOpen,
  Users,
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
import { downloadFile } from '../../services/fileService';

const Courses = () => {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUI();
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

  const handleToggle = (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
      }
    }
  };

  // Update handleRemoveStudent
  const handleRemoveStudent = (studentId) => {
    if (tempCourse) {
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

  const CourseCard = ({ course }) => {
    const handleCardClick = () => {
      setSelectedCourse(course);
    };

    return (
      <div 
        onClick={handleCardClick}
        className="group relative bg-white dark:bg-[#2A2A2A] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
      >
        <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
          <div className="absolute top-3 right-3">
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddStudentModal(true);
                  setTempCourse(course); // Use a temporary state for modals
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
              >
                <UserPlus className="w-3 h-3 text-white" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnrolledStudentsModal(true);
                  setTempCourse(course); // Use a temporary state for modals
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
              >
                <Eye className="w-3 h-3 text-white" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMaterialModal(true);
                  setTempCourse(course); // Use a temporary state for modals
                }}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
              >
                <Upload className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded">
              {course.code}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
            {course.name}
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Students:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(course.enrolledStudents || []).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Materials:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {course.materials?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(course.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MaterialItem = ({ item }) => {
    const handleDownload = async (file) => {
      try {
        await downloadFile(file);
      } catch (error) {
        console.error('Download failed:', error);
      }
    };

    return (
      <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group">
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
              <h3 className="font-medium text-gray-900 dark:text-white text-lg truncate max-w-[200px]" title={item.name}>
                {item.name}
              </h3>
              {item.type === 'file' && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span>{new Date(item.uploadedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {item.type === 'folder' ? (
              <button
                onClick={() => navigateToFolder(item)}
                className="w-full px-4 py-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <Folder className="w-4 h-4" />
                <span>Open Folder</span>
              </button>
            ) : (
              <button 
                onClick={() => handleDownload(item)}
                className="w-full px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions - Appears on Hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            {item.type === 'folder' ? (
              <button 
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Delete Folder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
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
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212]">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#2A2A2A] border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCourse ? selectedCourse.name : 'My Courses'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-sm font-medium leading-none text-white">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </span>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>
                <ToggleButton
                  isChecked={document.documentElement.classList.contains('dark')}
                  onChange={handleToggle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No courses assigned yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
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
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedCourse.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedCourse.code} • {(selectedCourse.enrolledStudents || []).length} students
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="flex items-center px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Folder
                      </button>
                      <button
                        onClick={() => setShowAddMaterialModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </button>
                    </div>
                  </div>

                  {/* Breadcrumb */}
                  {currentPath.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm bg-white dark:bg-[#2A2A2A] p-3 rounded-lg shadow-sm">
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
                    <div className="text-center py-12 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-sm">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No materials yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add Students to {tempCourse.name}
                </h3>
                {availableStudents.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleAddStudent(student.id)}
                        className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No available students to add
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowAddStudentModal(false);
                      setTempCourse(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Enrolled Students - {tempCourse.name}
                </h3>
                {(tempCourse.enrolledStudents || []).length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(tempCourse.enrolledStudents || []).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
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
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No students enrolled in this course
                  </p>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowEnrolledStudentsModal(false);
                      setTempCourse(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Folder
                </h3>
                <form onSubmit={handleCreateFolder}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateFolderModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Files
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
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
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Click to upload files
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        or drag and drop them here
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddMaterialModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
