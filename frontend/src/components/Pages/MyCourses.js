import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
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
import { Button } from '../ui/button';
import CourseListView from '../Common/courseListView';
import CourseDetailView from '../Common/courseDetailView';

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

  // Add new state for materials search
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [materialsViewMode, setMaterialsViewMode] = useState('grid');

  // Add state for selected folder
  const [selectedFolder, setSelectedFolder] = useState(null);

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

  // Update the useEffect to fetch materials when folder is selected
  useEffect(() => {
    const loadMaterials = async () => {
      if (selectedCourse && selectedFolder) {
        try {
          console.log('Fetching materials for folder:', selectedFolder._id);
          const response = await getMaterials(selectedCourse._id, selectedFolder._id);
          
          // Transform the materials to match your existing structure
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
          console.error('Failed to fetch materials:', error);
          showErrorAlert(
            'Error Loading Materials',
            'Failed to load course materials. Please try again later.'
          );
        }
      } else {
        setMaterials([]);
      }
    };

    loadMaterials();
  }, [selectedCourse, selectedFolder]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSelectedFolder(null);
    setCurrentPath([]);
    setMaterials([]);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentPath([]);
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
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
      if (currentPath.length === 1) {
        setSelectedFolder(null);
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
            onDelete={() => {}} // Students can't delete
            onUpdateFolder={() => {}} // Students can't update folders
            formatFileSize={formatFileSize}
            isStudent={true} // Add this prop to hide teacher-only features
          />
        ) : (
          <>
            {/* Course List Controls */}
            <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setShowEnrollDialog(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    variant="default"
                  >
                    <Plus className="w-4 h-4" />
                    Enroll
                  </Button>
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
                  hideControls={true} // Hide the create course button and controls
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
      </div>
    </div>
  );
};

export default MyCourses;