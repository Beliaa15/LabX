import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../services/authService';
import { showSuccessAlert, showErrorAlert } from '../../utils/sweetAlert';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

/**
 * Signup component with form validation and API integration
 * @returns {React.ReactNode} - The signup component
 */
const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showRequirements, setShowRequirements] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const checkNameRequirements = (name) => ({
    notEmpty: name.trim().length > 0,
    minLength: name.trim().length >= 2
  });

  const checkEmailRequirements = (email) => ({
    notEmpty: email.trim().length > 0,
    validFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  });

  const checkPasswordRequirements = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  });

  const checkConfirmPasswordRequirements = (confirmPassword) => ({
    notEmpty: confirmPassword.length > 0,
    matches: confirmPassword === formData.password
  });

  // Clear errors when user types
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateField(Object.keys(touched)[0]);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
    // Hide requirements when input loses focus
    setShowRequirements(prev => ({
      ...prev,
      [name]: false
    }));
  };

  const handleFocus = (fieldName) => {
    setShowRequirements(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const validateField = (fieldName) => {
    let newErrors = { ...errors };
    
    switch (fieldName) {
      case 'firstName':
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        const requirements = checkPasswordRequirements(formData.password);
        const passwordErrors = [];
        
        if (!formData.password) {
          passwordErrors.push('Password is required');
        } else {
          if (!requirements.length) {
            passwordErrors.push('Must be at least 8 characters');
          }
          if (!requirements.uppercase) {
            passwordErrors.push('Must contain at least one uppercase letter');
          }
          if (!requirements.lowercase) {
            passwordErrors.push('Must contain at least one lowercase letter');
          }
          if (!requirements.number) {
            passwordErrors.push('Must contain at least one number');
          }
        }
        
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors;
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    let isValid = true;
    ['firstName', 'lastName', 'email', 'password', 'confirmPassword'].forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
      setTouched(prev => ({ ...prev, [field]: true }));
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorAlert('Validation Error', 'Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await signup(userData);
      showSuccessAlert('Success', 'Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Check for specific error cases
      if (err.response?.status === 400 && err.response?.data?.error === 'User already exists') {
        showErrorAlert('Registration Failed', 'An account with this email already exists. Please try logging in instead.');
      } else if (err.response?.data?.message) {
        showErrorAlert('Registration Failed', err.response.data.message);
      } else {
        showErrorAlert('Registration Failed', 'Failed to create account. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1); // Go back one page
    } else {
      navigate('/'); // Fallback to home if no history
    }
  };

  const getInputClassName = (fieldName) => `
    peer w-full px-4 py-3.5 border rounded-lg text-gray-900 placeholder-transparent 
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
    transition-all duration-200
    ${touched[fieldName] && errors[fieldName] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300'
    }
  `;

  const currentRequirements = {
    firstName: checkNameRequirements(formData.firstName),
    lastName: checkNameRequirements(formData.lastName),
    email: checkEmailRequirements(formData.email),
    password: checkPasswordRequirements(formData.password),
    confirmPassword: checkConfirmPasswordRequirements(formData.confirmPassword)
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600" aria-hidden="true" />
      
      {/* Back Button */}
      <div className="relative w-full max-w-md mb-6 z-10">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-indigo-100 transition-all duration-200 group bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20"
        >
          <FaArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        </button>
      </div>
      
      <div className="relative max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-10 border border-gray-100 z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={getInputClassName('firstName')}
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('firstName')}
                  aria-invalid={touched.firstName && errors.firstName ? 'true' : 'false'}
                  aria-describedby="firstName-requirements"
                />
                <label htmlFor="firstName" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600">
                  First name
                </label>
                {showRequirements.firstName && (
                  <div className="mt-1 space-y-1" id="firstName-requirements">
                    <p className={`text-xs ${currentRequirements.firstName.notEmpty ? 'text-green-600' : 'text-red-600'}`}>
                      {currentRequirements.firstName.notEmpty ? '✓' : '•'} Field cannot be empty
                    </p>
                    <p className={`text-xs ${currentRequirements.firstName.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      {currentRequirements.firstName.minLength ? '✓' : '•'} Must be at least 2 characters
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={getInputClassName('lastName')}
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('lastName')}
                  aria-invalid={touched.lastName && errors.lastName ? 'true' : 'false'}
                  aria-describedby="lastName-requirements"
                />
                <label htmlFor="lastName" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600">
                  Last name
                </label>
                {showRequirements.lastName && (
                  <div className="mt-1 space-y-1" id="lastName-requirements">
                    <p className={`text-xs ${currentRequirements.lastName.notEmpty ? 'text-green-600' : 'text-red-600'}`}>
                      {currentRequirements.lastName.notEmpty ? '✓' : '•'} Field cannot be empty
                    </p>
                    <p className={`text-xs ${currentRequirements.lastName.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      {currentRequirements.lastName.minLength ? '✓' : '•'} Must be at least 2 characters
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={getInputClassName('email')}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={() => handleFocus('email')}
                aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                aria-describedby="email-requirements"
              />
              <label htmlFor="email" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600">
                Email address
              </label>
              {showRequirements.email && (
                <div className="mt-1 space-y-1" id="email-requirements">
                  <p className={`text-xs ${currentRequirements.email.notEmpty ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.email.notEmpty ? '✓' : '•'} Field cannot be empty
                  </p>
                  <p className={`text-xs ${currentRequirements.email.validFormat ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.email.validFormat ? '✓' : '•'} Must be a valid email address
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={getInputClassName('password')}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('password')}
                  aria-invalid={touched.password && errors.password ? 'true' : 'false'}
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
                <label htmlFor="password" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600">
                  Password
                </label>
              </div>
              {showRequirements.password && (
                <div className="mt-1 space-y-1" id="password-requirements">
                  <p className={`text-xs ${currentRequirements.password.length ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.password.length ? '✓' : '•'} Must be at least 8 characters
                  </p>
                  <p className={`text-xs ${currentRequirements.password.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.password.uppercase ? '✓' : '•'} Must contain at least one uppercase letter
                  </p>
                  <p className={`text-xs ${currentRequirements.password.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.password.lowercase ? '✓' : '•'} Must contain at least one lowercase letter
                  </p>
                  <p className={`text-xs ${currentRequirements.password.number ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.password.number ? '✓' : '•'} Must contain at least one number
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={getInputClassName('confirmPassword')}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('confirmPassword')}
                  aria-invalid={touched.confirmPassword && errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby="confirmPassword-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
                <label htmlFor="confirmPassword" className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600">
                  Confirm password
                </label>
              </div>
              {showRequirements.confirmPassword && (
                <div className="mt-1 space-y-1" id="confirmPassword-requirements">
                  <p className={`text-xs ${currentRequirements.confirmPassword.notEmpty ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.confirmPassword.notEmpty ? '✓' : '•'} Field cannot be empty
                  </p>
                  <p className={`text-xs ${currentRequirements.confirmPassword.matches ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRequirements.confirmPassword.matches ? '✓' : '•'} Passwords must match
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;