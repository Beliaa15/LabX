import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import EditProfileModal from '../Common/Modals/EditProfileModal';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { User, Mail, Phone, Pencil, UserCircle, Building2, Calendar, Shield, MapPin } from 'lucide-react';

/**
 * Profile page component for user profile management
 * @returns {React.ReactNode} - The profile page component
 */
const Profile = () => {
  const { user, updateProfile, isAdmin, isTeacher, isStudent, refreshUserData } = useAuth();
  const { sidebarCollapsed } = useUI();
  const { isDarkMode, handleToggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        } else if (value.trim().length < 3) {
          return 'First name must be at least 3 characters';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        } else if (value.trim().length < 3) {
          return 'Last name must be at least 3 characters';
        }
        break;
      case 'email':
        if (!value) {
          return 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value || !value.trim()) {
          return 'Phone number is required';
        }
        const phoneRegex = /^20[0-9]{10}$/;
        if (!phoneRegex.test(value.trim())) {
          return 'Phone number must start with 20 and be exactly 12 digits';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    // Only validate required fields and phone number if it's not empty
    const fieldsToValidate = ['firstName', 'lastName', 'email'];
    fieldsToValidate.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Only validate phone if it's not empty
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field on blur
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true
    });
    
    // Validate form
    if (!validateForm()) {
      showErrorAlert('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);

    try {
      // Create a copy of formData and set empty phone to null or undefined
      const dataToSubmit = {
        ...formData,
        phone: formData.phone.trim() || null // Set empty phone to null
      };

      await updateProfile(dataToSubmit);
      await refreshUserData(); // Refresh user data after update
      showSuccessAlert('Success', 'Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-secondary">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div
        className={`${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
      >
        <Header 
          title="Profile"
          user={user}
          isAdmin={isAdmin}
          isTeacher={isTeacher}
          isDarkMode={isDarkMode}
          handleToggle={handleToggle}
        />

        <main className="animate-fadeIn flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 border-4 border-white dark:border-gray-900"></div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-primary">
                        {user?.firstName} {user?.lastName}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <span className="text-secondary font-medium">
                          {isAdmin() ? 'Administrator' : isTeacher() ? 'Teacher' : 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow transform hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>

                {/* Profile Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Info Card */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Personal Information */}
                    <div className="surface-primary rounded-2xl border border-primary/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="px-6 py-5 border-b border-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <dt className="text-sm text-secondary">Full Name</dt>
                            <dd className="mt-1 text-sm font-medium text-primary">
                              {user?.firstName} {user?.lastName}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-secondary">Role</dt>
                            <dd className="mt-1 text-sm font-medium text-primary">
                              {isAdmin() ? 'Administrator' : isTeacher() ? 'Teacher' : 'Student'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="surface-primary rounded-2xl border border-primary/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="px-6 py-5 border-b border-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <dt className="text-sm text-secondary">Email Address</dt>
                            <dd className="mt-1 text-sm font-medium text-primary flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-purple-500" />
                              {user?.email}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-secondary">Phone Number</dt>
                            <dd className="mt-1 text-sm font-medium text-primary flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-purple-500" />
                              {user?.phone || 'Not provided'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* Side Info Card */}
                  <div className="lg:col-span-1">
                    <div className="surface-primary rounded-2xl border border-primary/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="px-6 py-5 border-b border-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-primary">Account Status</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/5 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-green-700 dark:text-green-400">Active</div>
                                <div className="text-xs text-green-600 dark:text-green-500">Your account is in good standing</div>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        errors={errors}
        touched={touched}
        handleBlur={handleBlur}
        validateField={validateField}
        setErrors={setErrors}
        setTouched={setTouched}
      />
    </div>
  );
};

export default Profile;