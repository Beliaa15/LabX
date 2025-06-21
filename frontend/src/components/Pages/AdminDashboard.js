import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Users, BookOpen, FileText, BarChart2, Calendar, Settings, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmDialog 
} from '../../utils/sweetAlert';
import {
  getAllCourses,
  deleteCourse
} from '../../services/courseService';
import {
  getAllUsers,
  deleteUser,
  updateUserRole
} from '../../services/userService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for system statistics
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalProfessors: 0,
    totalStudents: 0
  });

  // State for data lists
  const [recentUsers, setRecentUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Pagination and filtering
  const [usersPage, setUsersPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadCourses(),
        loadSystemAlerts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showErrorAlert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      
      // Calculate statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive !== false).length;
      const professors = users.filter(u => u.role === 'teacher').length;
      const students = users.filter(u => u.role === 'student').length;
      
      // Get recent users (last 10)
      const recent = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(u => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role,
          joinDate: new Date(u.createdAt).toLocaleDateString(),
          isActive: u.isActive !== false
        }));
      
      setRecentUsers(recent);
      setSystemStats(prev => ({
        ...prev,
        totalUsers,
        activeUsers,
        totalProfessors: professors,
        totalStudents: students
      }));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const courses = await getAllCourses();
      setAllCourses(courses);
      
      setSystemStats(prev => ({
        ...prev,
        totalCourses: courses.length
      }));
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadSystemAlerts = () => {
    // Generate system alerts based on data
    const alerts = [];
    
    // Check for high server load (mock)
    if (systemStats.activeUsers > 1000) {
      alerts.push({
        id: 1,
        type: 'warning',
        message: 'High server load detected',
        time: '2 hours ago'
      });
    }
    
    // Check for new courses
    const recentCourses = allCourses.filter(course => {
      const courseDate = new Date(course.createdAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return courseDate > yesterday;
    });
    
    if (recentCourses.length > 0) {
      alerts.push({
        id: 2,
        type: 'info',
        message: `${recentCourses.length} new course(s) added`,
        time: '1 day ago'
      });
    }
    
    alerts.push({
      id: 3,
      type: 'success',
      message: 'System backup completed',
      time: '2 days ago'
    });
    
    setSystemAlerts(alerts);
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await showConfirmDialog(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'destructive'
    );

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        showSuccessAlert('User Deleted', `${userName} has been successfully deleted`);
        loadUsers(); // Reload users list
      } catch (error) {
        console.error('Delete user failed:', error);
        showErrorAlert(
          'Delete Failed',
          error.response?.data?.message || 'Failed to delete user. Please try again.'
        );
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole, userName) => {
    const result = await showConfirmDialog(
      'Update User Role',
      `Are you sure you want to change ${userName}'s role to ${newRole}?`,
      'Update',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        await updateUserRole(userId, newRole);
        showSuccessAlert('Role Updated', `${userName}'s role has been updated to ${newRole}`);
        loadUsers(); // Reload users list
      } catch (error) {
        console.error('Update role failed:', error);
        showErrorAlert(
          'Update Failed',
          error.response?.data?.message || 'Failed to update user role. Please try again.'
        );
      }
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    const result = await showConfirmDialog(
      'Delete Course',
      `Are you sure you want to delete "${courseName}"? This action cannot be undone and will remove all associated materials and enrollments.`,
      'Delete',
      'Cancel',
      'destructive'
    );

    if (result.isConfirmed) {
      try {
        await deleteCourse(courseId);
        showSuccessAlert('Course Deleted', `${courseName} has been successfully deleted`);
        loadCourses(); // Reload courses list
      } catch (error) {
        console.error('Delete course failed:', error);
        showErrorAlert(
          'Delete Failed',
          error.response?.data?.message || 'Failed to delete course. Please try again.'
        );
      }
    }
  };

  // Filter users based on search and role
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = searchQuery === '' || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - LabX</title>
        <meta name="description" content="Manage users, courses, system settings, and monitor platform analytics on LabX virtual laboratory platform." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-6 space-y-6">
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
          
          <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-muted truncate">
                      Students
                    </dt>
                    <dd className="text-lg font-medium text-primary">
                      {systemStats.totalStudents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary">
          <div className="px-4 py-5 sm:px-6 border-b border-primary">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg leading-6 font-medium text-primary">
                User Management
              </h3>
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm w-full sm:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm w-full sm:w-auto"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="block sm:hidden">
              {filteredUsers.slice(0, 10).map((user) => (
                <div key={user._id} className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-sm font-medium">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : user.role === 'teacher'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user._id, e.target.value, `${user.firstName} ${user.lastName}`)}
                      className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                      className="text-sm px-3 py-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredUsers.slice(0, 10).map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-sm font-medium">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : user.role === 'teacher'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user._id, e.target.value, `${user.firstName} ${user.lastName}`)}
                          className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
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
        )}

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
                          Role: {user.role} • {user.email}
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
    </>
  );
};

export default AdminDashboard;