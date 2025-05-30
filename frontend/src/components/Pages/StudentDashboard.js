import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, FileText } from 'lucide-react';

const StudentDashboard = () => {
    // Sample data - replace with actual API calls
    const [upcomingDeadlines] = useState([
        { id: 1, title: 'Math Assignment', dueDate: '2024-04-10', course: 'Mathematics' },
        { id: 2, title: 'Physics Lab Report', dueDate: '2024-04-12', course: 'Physics' },
        { id: 3, title: 'Programming Project', dueDate: '2024-04-15', course: 'Computer Science' }
    ]);

    const [currentCourses] = useState([
        { id: 1, name: 'Mathematics', progress: 75, nextLecture: '2024-04-08' },
        { id: 2, name: 'Physics', progress: 60, nextLecture: '2024-04-09' },
        { id: 3, name: 'Computer Science', progress: 85, nextLecture: '2024-04-10' }
    ]);

    const [recentActivities] = useState([
        { id: 1, type: 'assignment', title: 'Submitted Math Assignment', time: '2 hours ago' },
        { id: 2, type: 'lecture', title: 'Attended Physics Lecture', time: '1 day ago' },
        { id: 3, type: 'quiz', title: 'Completed Programming Quiz', time: '2 days ago' }
    ]);

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 dark:bg-[#2A2A2A]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-white">
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Active Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-300">
                      3
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Assignments Due
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-300">
                      2
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Next Lecture
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-300">
                      Tomorrow
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Upcoming Events
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-300">
                      4
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Upcoming Deadlines
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {upcomingDeadlines.map((deadline) => (
                <li key={deadline.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {deadline.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {deadline.course}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      Due {deadline.dueDate}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Current Courses */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Current Courses
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {currentCourses.map((course) => (
                <li key={course.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Next lecture: {course.nextLecture}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full "
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {activity.type === 'assignment' && (
                          <FileText className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                        )}
                        {activity.type === 'lecture' && (
                          <BookOpen className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                        )}
                        {activity.type === 'quiz' && (
                          <Calendar className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
};

export default StudentDashboard; 