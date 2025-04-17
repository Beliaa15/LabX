import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, FileText, BarChart2, Calendar, Settings, Shield, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
    // Sample data - replace with actual API calls
    const [systemStats] = useState({
        totalUsers: 1500,
        activeUsers: 1200,
        totalCourses: 45,
        totalProfessors: 30
    });

    const [recentUsers] = useState([
        { id: 1, name: 'John Doe', role: 'Student', joinDate: '2024-04-01' },
        { id: 2, name: 'Jane Smith', role: 'Professor', joinDate: '2024-04-02' },
        { id: 3, name: 'Mike Johnson', role: 'Student', joinDate: '2024-04-03' }
    ]);

    const [systemAlerts] = useState([
        { id: 1, type: 'warning', message: 'High server load detected', time: '2 hours ago' },
        { id: 2, type: 'info', message: 'New course added', time: '1 day ago' },
        { id: 3, type: 'success', message: 'System backup completed', time: '2 days ago' }
    ]);

    const [pendingApprovals] = useState([
        { id: 1, type: 'course', title: 'Advanced Machine Learning', submittedBy: 'Dr. Smith' },
        { id: 2, type: 'user', title: 'New Professor Registration', submittedBy: 'Dr. Johnson' },
        { id: 3, type: 'content', title: 'Course Material Update', submittedBy: 'Dr. Brown' }
    ]);

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 dark:bg-[#2A2A2A]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            System overview and management tools.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      {systemStats.totalUsers}
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
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Total Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      {systemStats.totalCourses}
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
                  <UserPlus className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Active Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      {systemStats.activeUsers}
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
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Professors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      {systemStats.totalProfessors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Pending Approvals
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {pendingApprovals.map((approval) => (
                <li key={approval.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {approval.type === 'course' && (
                          <BookOpen className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                        )}
                        {approval.type === 'user' && (
                          <UserPlus className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                        )}
                        {approval.type === 'content' && (
                          <FileText className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {approval.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Submitted by: {approval.submittedBy}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              System Alerts
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {systemAlerts.map((alert) => (
                <li key={alert.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-5 w-5 rounded-full ${
                            alert.type === 'warning'
                              ? 'bg-yellow-400'
                              : alert.type === 'info'
                              ? 'bg-blue-400'
                              : 'bg-green-400'
                          }`}
                        ></div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.message}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {alert.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Users
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <li key={user.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Role: {user.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      Joined: {user.joinDate}
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

export default AdminDashboard; 