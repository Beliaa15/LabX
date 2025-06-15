import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import Sidebar from '../Common/Sidebar';
import ToggleButton from '../ui/ToggleButton';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import Header from '../Common/Header';

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
        // Phone is optional, but if provided should match Egyptian format (20 + 10 digits)
        if (value && value.trim()) {
          const phoneRegex = /^20[0-9]{10}$/;
          if (!phoneRegex.test(value.trim())) {
            return 'Phone number must start with 20 and be exactly 12 digits';
          }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If field has been touched, validate on change
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
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
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => `
    peer w-full px-4 py-3.5 border rounded-lg text-primary placeholder-transparent 
    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent 
    transition-all duration-200 surface-primary
    ${touched[fieldName] && errors[fieldName] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-primary'
    }
  `;

  return (
    <div className="min-h-screen surface-secondary">
      {/* Sidebar component handles both mobile and desktop sidebars */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main content */}
      <div
        className={`${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <Header 
          title="Profile"
          user={user}
          isAdmin={isAdmin}
          isTeacher={isTeacher}
          isDarkMode={isDarkMode}
          handleToggle={handleToggle}
        />

        <main className="animate-fadeIn flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="surface-primary shadow-sm overflow-hidden sm:rounded-xl border border-primary">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-primary">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-secondary">
                    Update your personal details.
                  </p>
                </div>
                <div className="border-t border-primary px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="First name"
                          className={getInputClassName('firstName')}
                          aria-invalid={touched.firstName && errors.firstName ? 'true' : 'false'}
                          aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                        />
                        <label
                          htmlFor="firstName"
                          className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                            touched.firstName && errors.firstName ? 'text-red-500' : 'text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
                          }`}
                        >
                          First name
                        </label>
                        {touched.firstName && errors.firstName && (
                          <p className="mt-1 text-sm text-red-500" id="firstName-error">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Last name"
                          className={getInputClassName('lastName')}
                          aria-invalid={touched.lastName && errors.lastName ? 'true' : 'false'}
                          aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                        />
                        <label
                          htmlFor="lastName"
                          className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                            touched.lastName && errors.lastName ? 'text-red-500' : 'text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
                          }`}
                        >
                          Last name
                        </label>
                        {touched.lastName && errors.lastName && (
                          <p className="mt-1 text-sm text-red-500" id="lastName-error">
                            {errors.lastName}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Email address"
                          className={getInputClassName('email')}
                          aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        <label
                          htmlFor="email"
                          className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                            touched.email && errors.email ? 'text-red-500' : 'text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
                          }`}
                        >
                          Email address
                        </label>
                        {touched.email && errors.email && (
                          <p className="mt-1 text-sm text-red-500" id="email-error">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Phone number (optional)"
                          maxLength={12}
                          pattern="20[0-9]{10}"
                          className={getInputClassName('phone')}
                          aria-invalid={touched.phone && errors.phone ? 'true' : 'false'}
                          aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                        <label
                          htmlFor="phone"
                          className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                            touched.phone && errors.phone ? 'text-red-500' : 'text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
                          }`}
                        >
                          Phone number (optional)
                        </label>
                        {touched.phone && errors.phone && (
                          <p className="mt-1 text-sm text-red-500" id="phone-error">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
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