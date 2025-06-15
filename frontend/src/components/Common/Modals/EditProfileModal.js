import React from 'react';
import Modal from '../../ui/Modal';
import { User, Mail, Phone, X, AlertCircle, CheckCircle } from 'lucide-react';

const EditProfileModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  loading,
  errors,
  touched,
  handleBlur,
  validateField,
  setErrors,
  setTouched
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched when user starts typing
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const getInputStatus = (fieldName) => {
    if (touched[fieldName]) {
      return errors[fieldName] ? 'error' : 'success';
    }
    return 'default';
  };

  const getInputIcon = (status) => {
    switch (status) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getInputStyles = (status) => {
    const baseStyles = "peer w-full px-4 py-3 border rounded-xl text-primary placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-200 surface-primary";
    switch (status) {
      case 'error':
        return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-500/20`;
      case 'success':
        return `${baseStyles} border-green-300 focus:border-green-500 focus:ring-green-500/20`;
      default:
        return `${baseStyles} border-primary focus:border-indigo-500 focus:ring-indigo-500/20`;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-primary/10">
            <User className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-medium text-primary">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="First name"
                  className={getInputStyles(getInputStatus('firstName'))}
                  disabled={loading}
                />
                <label
                  htmlFor="firstName"
                  className="absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                >
                  First name
                </label>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getInputIcon(getInputStatus('firstName'))}
                </div>
              </div>
              {touched.firstName && errors.firstName && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Last name"
                  className={getInputStyles(getInputStatus('lastName'))}
                  disabled={loading}
                />
                <label
                  htmlFor="lastName"
                  className="absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                >
                  Last name
                </label>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getInputIcon(getInputStatus('lastName'))}
                </div>
              </div>
              {touched.lastName && errors.lastName && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-primary/10">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-medium text-primary">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Email */}
            <div className="relative">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email address"
                  className={getInputStyles(getInputStatus('email'))}
                  disabled={loading}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                >
                  Email address
                </label>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getInputIcon(getInputStatus('email'))}
                </div>
              </div>
              {touched.email && errors.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
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
                  className={getInputStyles(getInputStatus('phone'))}
                  disabled={loading}
                />
                <label
                  htmlFor="phone"
                  className="absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
                >
                  Phone number (optional)
                </label>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {getInputIcon(getInputStatus('phone'))}
                </div>
              </div>
              {touched.phone && errors.phone ? (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-secondary">
                  Must start with 20 and be exactly 12 digits
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-secondary bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transform hover:translate-y-[-1px]"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal; 