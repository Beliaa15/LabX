import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import CourseCard from '../ui/CourseComponents';
import SearchBar from '../ui/SearchBar';
import ViewModeToggle from '../ui/ViewModeToggle';

const CourseListView = ({
  courses,
  isLoading,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  user,
  showMobileMenu,
  setShowMobileMenu,
  onShowCreateModal,
  onCourseClick,
  onAddStudent,
  onViewStudents,
  onUpdateCourse,
  onDeleteCourse,
  isStudent = false,
  hideControls = false
}) => {
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Controls - Hide for students when hideControls is true */}
      {!hideControls && (
        <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Course list controls - Only show for teachers/admins */}
            {!isStudent && (
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={onShowCreateModal}
                  className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm font-medium"
                >
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">
                    {user?.role === "admin" ? "Create Course" : "Create New Course"}
                  </span>
                </button>
              </div>
            )}

            {/* Search and View Controls */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end max-w-xs md:max-w-none">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={`Search ${user?.role === "admin" ? "courses" : "your courses"}...`}
                className="flex-1 min-w-0 max-w-[180px] sm:max-w-[220px] md:max-w-none md:w-56 lg:w-64 xl:w-72"
              />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>
      )}

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
                    : isStudent
                    ? "No courses enrolled"
                    : user?.role === "admin"
                    ? "No courses created yet"
                    : "You haven't created any courses yet"}
                </h3>
                <p className="text-secondary text-center mb-8">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : isStudent
                    ? "Enroll in a course to get started"
                    : user?.role === "admin"
                    ? "Create your first course to get started"
                    : "Create your first course to start teaching"}
                </p>
                {!searchQuery && !isStudent && (
                  <button
                    onClick={onShowCreateModal}
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
                    onCourseClick={onCourseClick}
                    onAddStudent={onAddStudent}
                    onViewStudents={onViewStudents}
                    onUpdateCourse={onUpdateCourse}
                    onDeleteCourse={onDeleteCourse}
                    showMobileMenu={showMobileMenu}
                    setShowMobileMenu={setShowMobileMenu}
                    isStudent={isStudent} // Pass this to CourseCard
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CourseListView;