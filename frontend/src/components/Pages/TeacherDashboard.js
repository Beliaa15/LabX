import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Folder, ArrowUpDown } from 'lucide-react';
import { getUserCourses } from '../../services/courseService';


const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTasks: 0
    });

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
      <div className="space-y-6">        {/* Welcome Section */}
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
              ) : (
                courses.map((course) => (
                  <li
                    key={course._id}
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
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
                      </div>{' '}
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
          </div>          <div className="overflow-x-auto">
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
              <table className="min-w-full divide-y divide-primary">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Course Name
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Task Details
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Users className="w-4 h-4" />
                        Statistics
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-primary">
                  {courses
                    .map((course) => {
                      if (!course.tasks || course.tasks.length === 0)
                        return null;

                      return course.tasks.map((task, taskIndex) => (                          <tr
                          key={task._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                              <span className="font-medium text-primary">
                                {taskIndex === 0 ? course.name : ''}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="space-y-1">
                              <div className="font-medium text-primary">
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="text-secondary line-clamp-2">
                                  {task.description}
                                </div>
                              )}
                            </div>
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
                      ));
                    })
                    .filter(Boolean)}
                </tbody>
              </table>            )}            {!loading && courses.every((course) => !course.tasks?.length) && (
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
    );
};

export default TeacherDashboard;