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
        <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
          <h2 className="text-2xl font-bold text-primary">
            Welcome back!
          </h2>
          <p className="mt-2 text-secondary">
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
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
                      3
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Assignments Due
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      2
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Next Lecture
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      Tomorrow
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Upcoming Events
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      4
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Upcoming Deadlines
            </h3>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {upcomingDeadlines.map((deadline) => (
                <li key={deadline.id} className="px-4 py-4 sm:px-6 hover-surface transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-muted" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary">
                          {deadline.title}
                        </div>
                        <div className="text-sm text-secondary">
                          {deadline.course}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted">
                      Due {deadline.dueDate}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Current Courses */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Current Courses
            </h3>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {currentCourses.map((course) => (
                <li key={course.id} className="px-4 py-4 sm:px-6 hover-surface transition-colors">
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
                          Next lecture: {course.nextLecture}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-muted">
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
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Recent Activity
            </h3>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6 hover-surface transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {activity.type === 'assignment' && (
                          <FileText className="h-5 w-5 text-muted" />
                        )}
                        {activity.type === 'lecture' && (
                          <BookOpen className="h-5 w-5 text-muted" />
                        )}
                        {activity.type === 'quiz' && (
                          <Calendar className="h-5 w-5 text-muted" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary">
                          {activity.title}
                        </div>
                        <div className="text-sm text-secondary">
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