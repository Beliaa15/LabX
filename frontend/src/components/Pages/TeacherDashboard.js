import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Folder, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { getUserCourses } from '../../services/courseService';
import { getTaskSubmissionsForCourse } from '../../services/taskService';
import { Helmet } from 'react-helmet-async';


const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourses, setExpandedCourses] = useState({});
    const [taskSubmissions, setTaskSubmissions] = useState({});
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTasks: 0
    });

    const toggleCourse = async (courseId) => {
        const isExpanding = !expandedCourses[courseId];
        setExpandedCourses(prev => ({
            ...prev,
            [courseId]: isExpanding
        }));

        // If expanding, fetch submissions for all tasks in this course
        if (isExpanding) {
            const course = courses.find(c => c._id === courseId);
            if (course && course.tasks) {
                for (const task of course.tasks) {
                    try {
                        const submissionsData = await getTaskSubmissionsForCourse(courseId, task._id);
                        setTaskSubmissions(prev => ({
                            ...prev,
                            [`${courseId}-${task._id}`]: submissionsData
                        }));
                    } catch (error) {
                        console.error('Error fetching task submissions:', error);
                    }
                }
            }
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch courses
                const coursesData = await getUserCourses() || [];
                console.log('Fetched courses data:', coursesData);
                setCourses(coursesData);                // Calculate statistics
                let totalStudents = 0;
                let totalTasks = 0;

                // Calculate totals from course data
                coursesData.forEach(course => {
                    totalStudents += course.students?.length || 0;
                    totalTasks += course.tasks?.length || 0;
                });

                console.log('Total students calculated:', totalStudents);
                console.log('Total tasks calculated:', totalTasks);

                setStats({
                    totalStudents,
                    totalTasks,
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
      <>
      <Helmet>
        <title>Teacher Dashboard - LabX</title>
        <meta name="description" content="Manage your courses, students, assignments, and track progress on LabX virtual laboratory platform." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
          <h2 className="text-2xl font-bold text-primary">
            Welcome to Your Dashboard
          </h2>
          <p className="mt-2 text-secondary">
            {loading
              ? 'Loading your overview...'
              : `Managing ${courses.length} courses with ${stats.totalStudents} students`}
          </p>
        </div>
        {/* Quick Stats */}{' '}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Active Courses
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {loading ? '...' : courses.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Total Students Across All Courses
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {loading ? '...' : stats.totalStudents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Total Tasks Across All Courses
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {loading ? '...' : stats.totalTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Course Overview */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Course Overview
            </h3>
            <span className="text-sm text-secondary">
              {loading ? 'Loading...' : `${courses.length} active courses`}
            </span>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <li className="px-4 py-4 text-center text-secondary">
                  Loading courses...
                </li>
              ) : courses.length === 0 ? (
                <li className="px-4 py-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted" />
                  <h3 className="mt-2 text-sm font-medium text-primary">No courses</h3>
                  <p className="mt-1 text-sm text-secondary">Get started by creating a new course.</p>
                </li>
              ) : (
                courses.map((course) => (
                  <li
                    key={course._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {/* Desktop View */}
                    <div className="hidden sm:flex items-center justify-between px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-muted" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary">
                            {course.name}
                          </div>
                          <div className="text-sm text-secondary">
                            {course.description || 'No description available'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-muted" />
                          <span className="ml-2 text-sm text-muted">
                            {course.students?.length || 0} students
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-muted" />
                          <span className="ml-2 text-sm text-muted">
                            {course.tasks?.length || 0} tasks
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Folder className="h-5 w-5 text-muted" />
                          <span className="ml-2 text-sm text-muted">
                            {course.folders?.length || 0} folders
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="sm:hidden p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="text-base font-medium text-primary">{course.name}</h4>
                        </div>
                      </div>
                      
                      <p className="text-sm text-secondary mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Users className="h-5 w-5 text-muted mb-1" />
                          <span className="text-xs font-medium text-primary">{course.students?.length || 0}</span>
                          <span className="text-xs text-secondary">Students</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <FileText className="h-5 w-5 text-muted mb-1" />
                          <span className="text-xs font-medium text-primary">{course.tasks?.length || 0}</span>
                          <span className="text-xs text-secondary">Tasks</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Folder className="h-5 w-5 text-muted mb-1" />
                          <span className="text-xs font-medium text-primary">{course.folders?.length || 0}</span>
                          <span className="text-xs text-secondary">Folders</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        {/* Course Tasks */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-semibold text-primary">
              Course Tasks
            </h3>
            <span className="text-sm text-secondary">
              {loading ? 'Loading...' : `${stats.totalTasks} total tasks`}
            </span>
          </div>          <div className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="animate-fadeIn flex flex-col items-center justify-center py-8">
                <FileText className="w-12 h-12 text-muted mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">
                  No courses available
                </h3>
                <p className="text-secondary text-center">
                  No courses have been added yet
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View - Nested Table Layout */}
                <div className="hidden lg:block">
                  <table className="min-w-full divide-y divide-primary">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="w-12 px-6 py-3"></th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Course & Tasks
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                          <div className="flex items-center justify-end gap-2">
                            <Users className="w-4 h-4" />
                            Statistics
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-primary">
                      {courses.map((course) => {
                        if (!course.tasks || course.tasks.length === 0) return null;
                        const isExpanded = expandedCourses[course._id];

                        return (
                          <React.Fragment key={course._id}>
                            {/* Course Row */}
                            <tr 
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                onClick={() => toggleCourse(course._id)}
                            >
                                <td className="px-6 py-4">
                                    {isExpanded ? 
                                        <ChevronDown className="w-4 h-4 text-primary" /> : 
                                        <ChevronRight className="w-4 h-4 text-primary" />
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                                        <span className="font-medium text-primary">{course.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-secondary">
                                        {course.description || 'No description available'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex items-center justify-end space-x-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="text-secondary">
                                                {course.students?.length || 0} students
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FileText className="w-4 h-4 text-primary" />
                                            <span className="text-secondary">
                                                {course.tasks?.length || 0} tasks
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            
                            {/* Task Rows */}
                            {isExpanded && course.tasks.map((task) => (
                                <tr 
                                    key={task._id} 
                                    className="bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <td className="px-6 py-4"></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 pl-7">
                                            <FileText className="w-4 h-4 text-primary" />
                                            <span className="text-primary">{task.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-secondary line-clamp-2">
                                            {task.description || 'No description available'}
                                        </span>
                                    </td>                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <span className="text-secondary">
                                                    {taskSubmissions[`${course._id}-${task._id}`]?.submissionsCount || 0}
                                                    /
                                                    {taskSubmissions[`${course._id}-${task._id}`]?.totalStudents || 0} submissions
                                                </span>
                                            </div>
                                            {taskSubmissions[`${course._id}-${task._id}`]?.submissionsCount > 0 && (
                                                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                                                    Average: {
                                                        Math.round(
                                                            taskSubmissions[`${course._id}-${task._id}`]?.submissions.reduce((acc, sub) => acc + sub.grade, 0) / 
                                                            taskSubmissions[`${course._id}-${task._id}`]?.submissionsCount
                                                        ) || 0
                                                    }%
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View - Card Layout */}
                <div className="lg:hidden divide-y divide-primary">
                  {courses.map((course) => {
                    if (!course.tasks || course.tasks.length === 0) return null;
                    const isExpanded = expandedCourses[course._id];

                    return (
                      <div key={course._id} className="p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleCourse(course._id)}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                            <span className="font-medium text-primary">{course.name}</span>
                          </div>
                          {isExpanded ? 
                            <ChevronDown className="w-4 h-4 text-primary" /> : 
                            <ChevronRight className="w-4 h-4 text-primary" />
                          }
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            {course.tasks.map((task) => (
                              <div 
                                key={task._id}
                                className="ml-6 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span className="text-primary">{task.title}</span>
                                </div>
                                <p className="text-sm text-secondary mt-1 line-clamp-2">
                                  {task.description || 'No description available'}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-sm text-secondary">
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      {taskSubmissions[`${course._id}-${task._id}`]?.submissionsCount || 0}
                                      /
                                      {taskSubmissions[`${course._id}-${task._id}`]?.totalStudents || 0} submissions
                                    </span>
                                  </div>
                                  {taskSubmissions[`${course._id}-${task._id}`]?.submissionsCount > 0 && (
                                    <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                                      Average: {
                                        Math.round(
                                          taskSubmissions[`${course._id}-${task._id}`]?.submissions.reduce((acc, sub) => acc + sub.grade, 0) / 
                                          taskSubmissions[`${course._id}-${task._id}`]?.submissionsCount
                                        ) || 0
                                      }%
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {!loading && courses.every((course) => !course.tasks?.length) && (
              <div className="animate-fadeIn flex flex-col items-center justify-center py-8">
                <FileText className="w-12 h-12 text-muted mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">
                  No tasks yet
                </h3>
                <p className="text-secondary text-center">
                  Tasks you create in your courses will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
    );
};

export default TeacherDashboard;