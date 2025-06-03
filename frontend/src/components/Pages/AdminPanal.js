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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Form states
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  
  // Data states
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('adminCourses');
    return savedCourses ? JSON.parse(savedCourses) : [];
  });
  
  const [teachers, setTeachers] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Load teachers from service
  useEffect(() => {
    const loadTeachers = () => {
      const teachersList = getTeachers();
      setTeachers(teachersList);
    };
    loadTeachers();
  }, []);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminCourses', JSON.stringify(courses));
  }, [courses]);

  const handleToggle = (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
        assignedTeacher: null,
        enrolledStudents: [],
        status: 'draft',
      };
      setCourses([...courses, newCourse]);
      setCourseName('');
      setCourseCode('');
      setCourseDescription('');
      setShowCreateModal(false);
      showSuccessAlert('Course Created', `Course "${courseName}" has been created successfully`);
    }
  };

  const handleAssignTeacher = async (teacherId) => {
    if (selectedCourse) {
      try {
        // Call the service to assign the course
        await assignCourse(teacherId, selectedCourse.id);

        // Update courses - ensure teacherId is stored as string
        setCourses(courses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, assignedTeacher: String(teacherId), status: 'active' }
            : course
        ));

        // Update teachers' assignedCourses count
        setTeachers(teachers.map(teacher => {
          if (teacher.id === teacherId) {
            return { ...teacher, assignedCourses: teacher.assignedCourses + 1 };
          }
          if (selectedCourse.assignedTeacher && teacher.id === selectedCourse.assignedTeacher) {
            return { ...teacher, assignedCourses: Math.max(0, teacher.assignedCourses - 1) };
          }
          return teacher;
        }));

        const teacher = teachers.find(t => t.id === teacherId);
        showSuccessAlert('Teacher Assigned', `${teacher.name} has been assigned to ${selectedCourse.name}`);
        setShowAssignModal(false);
        setSelectedCourse(null);
      } catch (error) {
        console.error('Failed to assign teacher:', error);
        showErrorAlert('Assignment Failed', 'Failed to assign teacher to the course');
      }
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
      if (courseToDelete && courseToDelete.assignedTeacher) {
        try {
          // Call the service to unassign the course
          await unassignCourse(courseToDelete.assignedTeacher, courseId);

          // Update teacher's assigned courses count
          setTeachers(teachers.map(teacher => 
            teacher.id === courseToDelete.assignedTeacher
              ? { ...teacher, assignedCourses: Math.max(0, teacher.assignedCourses - 1) }
              : teacher
          ));
        } catch (error) {
          console.error('Failed to unassign teacher:', error);
          showErrorAlert('Error', 'Failed to unassign teacher from the course');
          return;
        }
      }
      setCourses(courses.filter(course => course.id !== courseId));
      showSuccessAlert('Course Deleted', `Course "${courseToDelete.name}" has been deleted successfully`);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unassigned';
  };

  const CourseCard = ({ course }) => (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        <div className="absolute top-3 right-3">
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setSelectedCourse(course);
                setShowAssignModal(true);
              }}
              className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
            >
              <UserPlus className="w-3 h-3 text-white" />
            </button>
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
            <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded">
              {course.code}
            </span>
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
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
          {course.name}
        </h3>
        {course.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {course.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Teacher:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {getTeacherName(course.assignedTeacher)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Students:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(course.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {course.name}
              </h3>
              <span className="text-sm text-gray-500">({course.code})</span>
              <span className={`text-xs px-2 py-1 rounded ${
                course.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {course.status === 'active' ? 'Active' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Teacher: {getTeacherName(course.assignedTeacher)}</span>
              <span>{Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0} students</span>
              <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setSelectedCourse(course);
              setShowAssignModal(true);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <UserPlus className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212]">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#1e1f22] backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
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
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center ring-2 ring-white dark:ring-gray-700 transform hover:scale-105 transition-all duration-200">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-700"></div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

              {/* Dark Mode Toggle */}
              <ToggleButton
                isChecked={document.documentElement.classList.contains('dark')}
                onChange={handleToggle}
                className="transform hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white dark:bg-[#1e1f22] border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {courses.length} course{courses.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
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
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No courses found' : 'No courses created yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first course to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Course
                </h3>
                <form onSubmit={handleCreateCourse}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course Code
                      </label>
                      <input
                        type="text"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="e.g., CS101"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course Name
                      </label>
                      <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Enter course name..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        placeholder="Enter course description..."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Teacher Modal */}
        {showAssignModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Assign Teacher
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Course: <span className="font-medium">{selectedCourse.name}</span>
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      onClick={() => handleAssignTeacher(teacher.id)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {teacher.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {teacher.email} • {teacher.assignedCourses} courses assigned
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAssignModal(false)}
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

export default AdminCourseManagement;