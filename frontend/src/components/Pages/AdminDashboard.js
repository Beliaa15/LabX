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
        <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
          <h2 className="text-2xl font-bold text-primary">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-secondary">
            System overview and management tools.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {systemStats.totalUsers}
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
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Total Courses
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {systemStats.totalCourses}
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
                  <UserPlus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Active Users
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {systemStats.activeUsers}
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
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Professors
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {systemStats.totalProfessors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Pending Approvals
            </h3>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {pendingApprovals.map((approval) => (
                <li key={approval.id} className="px-4 py-4 sm:px-6 hover-surface transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {approval.type === 'course' && (
                          <BookOpen className="h-5 w-5 text-muted" />
                        )}
                        {approval.type === 'user' && (
                          <UserPlus className="h-5 w-5 text-muted" />
                        )}
                        {approval.type === 'content' && (
                          <FileText className="h-5 w-5 text-muted" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary">
                          {approval.title}
                        </div>
                        <div className="text-sm text-secondary">
                          Submitted by: {approval.submittedBy}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors">
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
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              System Alerts
            </h3>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {systemAlerts.map((alert) => (
                <li key={alert.id} className="px-4 py-4 sm:px-6 hover-surface transition-colors">
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
                        <div className="text-sm font-medium text-primary">
                          {alert.message}
                        </div>
                        <div className="text-sm text-secondary">
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
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-primary">
              Recent Users
            </h3>
          </div>
          <div className="border-t border-primary">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {recentUsers.map((user) => (
                <li key={user.id} className="px-4 py-4 sm:px-6 hover-surface transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-muted" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary">
                          {user.name}
                        </div>
                        <div className="text-sm text-secondary">
                          Role: {user.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted">
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