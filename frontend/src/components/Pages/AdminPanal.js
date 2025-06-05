import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { getTeachers, assignCourse, unassignCourse } from '../../services/teacherService';
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
} from 'lucide-react';

const AdminCourseManagement = () => {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form states
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  
  // Data states
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('adminCourses');
    return savedCourses ? JSON.parse(savedCourses) : [];
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Add state to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (courseName.trim()) {
      const newCourse = {
        id: Date.now(),
        name: courseName,
        description: courseDescription,
        createdAt: new Date().toISOString(),
        assignedTeacher: user.id, // Automatically assign to current user
        enrolledStudents: [],
        status: 'active', // Set as active since teacher is automatically assigned
      };
      setCourses([...courses, newCourse]);
      setCourseName('');
      setCourseDescription('');
      setShowCreateModal(false);
      showSuccessAlert('Course Created', `Course "${courseName}" has been created successfully`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    
    // Show confirmation dialog before deleting
    const result = await showConfirmDialog(
      'Delete Course',
      `Are you sure you want to delete "${courseToDelete.name}"? This action cannot be undone.`,
      'Yes, Delete',
      'Cancel'
    );

    if (result.isConfirmed) {
      setCourses(courses.filter(course => course.id !== courseId));
      showSuccessAlert('Course Deleted', `Course "${courseToDelete.name}" has been deleted successfully`);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CourseCard = ({ course }) => (
    <div className="group relative surface-primary rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-primary">
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
        <div className="absolute top-3 right-3">
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => handleDeleteCourse(course.id)}
              className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded ${
              course.status === 'active' 
                ? 'bg-green-500/20 text-green-100' 
                : 'bg-yellow-500/20 text-yellow-100'
            }`}>
              {course.status === 'active' ? 'Active' : 'Draft'}
            </span>
          </div>
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
              {Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0}
            </span>
          </div>
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
              <span className={`text-xs px-2 py-1 rounded ${
                course.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {course.status === 'active' ? 'Active' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-secondary">
              <span>{Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0} students</span>
              <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
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

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-primary transition-all duration-300">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200 transition-colors duration-300">
                Course Management
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
                  <p className="text-xs text-muted">
                    Administrator
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
                Create Course
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

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {filteredCourses.length === 0 ? (
            <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
              <BookOpen className="w-12 h-12 text-muted mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">
                {searchQuery ? 'No courses found' : 'No courses created yet'}
              </h3>
              <p className="text-secondary text-center mb-8">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first course to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Course
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="animate-fadeIn space-y-3">
                  {filteredCourses.map((course) => (
                    <CourseListItem key={course.id} course={course} />
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
                  Create New Course
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
      </div>
    </div>
  );
};

export default AdminCourseManagement;