import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
/**
 * Profile page component for user profile management
 * @returns {React.ReactNode} - The profile page component
 */
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { sidebarCollapsed } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const handleToggle = (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, this would send data to a server
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212]">
      {/* Sidebar component handles both mobile and desktop sidebars */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main content */}
      <div
        className={`${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white shadow-sm px-4 md:px-6 dark:bg-[#2A2A2A]">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Profile
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-sm font-medium leading-none text-white">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </span>
                <span className="ml-3 text-gray-700 text-sm font-medium lg:block dark:text-white">
                  <span className="sr-only">Welcome,</span>
                  {user?.firstName} {user?.lastName}
                </span>

                {/* Toggle Dark Mode Button */}
                <ToggleButton
                  isChecked={document.documentElement.classList.contains(
                    'dark'
                  )}
                  onChange={handleToggle}
                  className="ml-4"
                />
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-[#2A2A2A]">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-slate-400">
                    Update your personal details.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6 ">
                  {success && (
                    <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded dark:bg-green-300 dark:border-green-700 dark:text-green-900">
                      {success}
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-300 dark:border-red-700 dark:text-red-900">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-white"
                        >
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="px-2 py-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-[#121212] dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-white"
                        >
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="px-2 py-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-[#121212] dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-white"
                        >
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="px-2 py-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-[#121212] dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 dark:text-white"
                        >
                          Phone number
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="px-2 py-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-[#121212] dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;