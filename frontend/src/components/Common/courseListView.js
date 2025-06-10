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
  onDeleteCourse
}) => {
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Controls */}
      <div className="surface-primary border-b border-primary px-4 md:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          {/* Course list controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onShowCreateModal}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {user?.role === "admin" ? "Create Course" : "Create New Course"}
              </span>
              <span className="sm:hidden">Create</span>
            </button>
            <span className="text-sm text-secondary whitespace-nowrap">
              {courses.length ? ` ${courses.length} course${courses.length !== 1 ? "s" : ""}` : ""}
            </span>
          </div>

          {/* Search and View Controls */}
          <div className="flex items-center justify-end space-x-3 flex-shrink-0">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search ${user?.role === "admin" ? "courses" : "your courses"}...`}
              className="w-64 sm:w-72"
            />
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
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