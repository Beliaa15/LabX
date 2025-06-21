import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';
import { updateUserProfile } from '../../../services/userService';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'password':
        if (!value) {
          return 'Password is required';
        } else if (value.length < 8) {
          return 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          return 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          return 'Password must contain at least one number';
        } else if (!/[!@#$%^&*]/.test(value)) {
          return 'Password must contain at least one special character (!@#$%^&*)';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          return 'Confirm password is required';
        } else if (value !== formData.password) {
          return 'Passwords do not match';
        }
        break;
      default:
        return '';
    }
    return '';
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Mark field as touched when user starts typing
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate both fields in real-time since they are dependent
    const newErrors = {};
    newErrors.password = validateField('password', newFormData.password);
    newErrors.confirmPassword = validateField('confirmPassword', newFormData.confirmPassword);
    setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      password: true,
      confirmPassword: true
    });
    
    if (!validateForm()) {
      showErrorAlert('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({ password: formData.password });
      showSuccessAlert('Success', 'Password updated successfully!');
      onClose();
      setFormData({ password: '', confirmPassword: '' }); // Reset form
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Password Field */}          <div className="relative">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3.5 border rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-200 surface-primary ${
                  touched.password && errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : touched.password && !errors.password
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-primary focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder="New Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <label
                htmlFor="password"
                className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                  touched.password && errors.password
                    ? 'text-red-500'
                    : touched.password && !errors.password
                    ? 'text-green-500'
                    : 'text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
                }`}
              >
                New Password
              </label>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3.5 border rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-200 surface-primary ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : touched.confirmPassword && !errors.confirmPassword
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-primary focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <label
                htmlFor="confirmPassword"
                className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'text-red-500'
                    : touched.confirmPassword && !errors.confirmPassword
                    ? 'text-green-500'
                    : 'text-secondary peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
                }`}
              >
                Confirm Password
              </label>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-secondary bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transform hover:translate-y-[-1px]"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
