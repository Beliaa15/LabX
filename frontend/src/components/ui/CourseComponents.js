import React from 'react';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  BookOpen
} from 'lucide-react';

const CourseCard = ({
  course,
  user,
  viewMode = 'card', // 'card' or 'list'
  onCourseClick,
  onAddStudent,
  onViewStudents,
  onUpdateCourse,
  onDeleteCourse,
  showMobileMenu,
  setShowMobileMenu,
  className = ""
}) => {
  if (!course) return null;

  const handleCardClick = () => {
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  const handleAddStudentsClick = (e) => {
    e.stopPropagation();
    if (onAddStudent) {
      onAddStudent(course);
    }
    if (setShowMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  const handleViewStudentsClick = (e) => {
    e.stopPropagation();
    if (onViewStudents) {
      onViewStudents(course);
    }
    if (setShowMobileMenu) {
      setShowMobileMenu(null);
    }
  };

  const handleUpdateCourseClick = (e) => {
    e.stopPropagation();
    if (onUpdateCourse) {
      onUpdateCourse(course);
    }
    if (setShowMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  const handleDeleteCourseClick = (e) => {
    e.stopPropagation();
    if (onDeleteCourse) {
      onDeleteCourse(course._id);
    }
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    if (setShowMobileMenu) {
      setShowMobileMenu(showMobileMenu === course._id ? null : course._id);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className={`group surface-primary rounded-lg border border-primary hover:shadow-md transition-all duration-200 hover-surface cursor-pointer ${className}`}
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
                <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  Code: {course.code}
                </span>
                {user?.role === 'admin' && course.teacher && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Teacher: {course.teacher.firstName} {course.teacher.lastName}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-secondary">
                <span>{Array.isArray(course.students) ? course.students.length : 0} students</span>
                <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                {course.description && (
                  <span className="text-muted line-clamp-1">{course.description}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAddStudent && (
              <button
                onClick={handleAddStudentsClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                title="Add Student"
              >
                <UserPlus className="w-4 h-4 text-indigo-400" />
              </button>
            )}
            {onViewStudents && (
              <button
                onClick={handleViewStudentsClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                title="View Enrolled Students"
              >
                <Eye className="w-4 h-4 text-blue-400" />
              </button>
            )}
            {onUpdateCourse && (
              <button
                onClick={handleUpdateCourseClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                title="Update Course"
              >
                <Edit2 className="w-4 h-4 text-amber-400" />
              </button>
            )}
            {onDeleteCourse && (
              <button
                onClick={handleDeleteCourseClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card view (default)
  return (
    <div  
      onClick={handleCardClick}
      className={`group relative surface-primary rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-primary cursor-pointer ${className}`}
    >
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
        {/* Desktop Actions */}
        <div className="absolute top-3 right-3">
          <div className="hidden md:flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAddStudent && (
              <button 
                onClick={handleAddStudentsClick}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Add Student"
              >
                <UserPlus className="w-3 h-3 text-white" />
              </button>
            )}
            {onViewStudents && (
              <button 
                onClick={handleViewStudentsClick}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="View Enrolled Students"
              >
                <Eye className="w-3 h-3 text-white" />
              </button>
            )}
            {onUpdateCourse && (
              <button 
                onClick={handleUpdateCourseClick}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Update Course"
              >
                <Edit2 className="w-3 h-3 text-white" />
              </button>
            )}
            {onDeleteCourse && (
              <button
                onClick={handleDeleteCourseClick}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Delete Course"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          {(onAddStudent || onViewStudents || onUpdateCourse || onDeleteCourse) && (
            <div className="md:hidden relative mobile-menu-container">
              <button
                onClick={toggleMobileMenu}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>

              {/* Mobile Dropdown Menu */}
              {showMobileMenu === course._id && (
                <div className="absolute right-0 top-full mt-2 w-48 surface-primary rounded-lg shadow-lg border border-primary z-20">
                  <div className="py-2">
                    {onAddStudent && (
                      <button
                        onClick={handleAddStudentsClick}
                        className="w-full px-4 py-2 text-left text-primary hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Student</span>
                      </button>
                    )}
                    {onViewStudents && (
                      <button
                        onClick={handleViewStudentsClick}
                        className="w-full px-4 py-2 text-left text-primary hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Students</span>
                      </button>
                    )}
                    {onUpdateCourse && (
                      <button
                        onClick={handleUpdateCourseClick}
                        className="w-full px-4 py-2 text-left text-primary hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Update Course</span>
                      </button>
                    )}
                    {onDeleteCourse && (
                      <button
                        onClick={handleDeleteCourseClick}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Course</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <span className="text-xs px-2 py-1 rounded bg-white/20 text-white backdrop-blur-sm">
            Code: {course.code}
          </span>
          {user?.role === 'admin' && course.teacher && (
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
          {user?.role === 'admin' && course.teacher && (
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

export default CourseCard;