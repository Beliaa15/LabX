import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { createTask } from '../../../services/taskService';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';

const TaskCreationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) {
          return 'Title is required';
        }
        if (value.trim().length < 3) {
          return 'Title must be at least 3 characters';
        }
        if (value.trim().length > 100) {
          return 'Title must be less than 100 characters';
        }
        return '';
      case 'description':
        if (!value.trim()) {
          return 'Description is required';
        }
        if (value.trim().length < 10) {
          return 'Description must be at least 10 characters';
        }
        if (value.trim().length > 500) {
          return 'Description must be less than 500 characters';
        }
        return '';
      default:
        return '';
    }
  };

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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const resetModal = () => {
    setFormData({ title: '', description: '' });
    setErrors({});
    setTouched({});
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getInputStatus = (fieldName) => {
    if (touched[fieldName]) {
      if (errors[fieldName]) {
        return 'error';
      }
      return 'success';
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
    const baseStyles = "peer w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-gray-700";
    switch (status) {
      case 'error':
        return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-500/20`;
      case 'success':
        return `${baseStyles} border-green-300 focus:border-green-500 focus:ring-green-500/20`;
      default:
        return `${baseStyles} border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const titleError = validateField('title', formData.title);
    const descriptionError = validateField('description', formData.description);
    
    setErrors({
      title: titleError,
      description: descriptionError
    });
    
    setTouched({
      title: true,
      description: true
    });

    if (titleError || descriptionError) {
      return;
    }

    setLoading(true);
    
    try {
      await createTask(formData);
      showSuccessAlert('Success', 'Task created successfully!');
      handleClose();
    } catch (error) {
      showErrorAlert(
        'Error Creating Task',
        error.response?.data?.message || 'Failed to create task. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Task
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Create a new task for students to complete
          </div>

          {/* Title Field */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Task title"
                className={getInputStyles(getInputStatus('title'))}
                disabled={loading}
              />
              <label
                htmlFor="title"
                className="absolute left-4 -top-2.5 bg-white dark:bg-gray-800 px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm text-gray-700 dark:text-gray-300 peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
              >
                Task title
              </label>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getInputIcon(getInputStatus('title'))}
              </div>
            </div>
            {touched.title && errors.title && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="relative">
            <div className="relative">
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Task description"
                rows={4}
                className={`${getInputStyles(getInputStatus('description'))} resize-none`}
                disabled={loading}
              />
              <label
                htmlFor="description"
                className="absolute left-4 -top-2.5 bg-white dark:bg-gray-800 px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm text-gray-700 dark:text-gray-300 peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
              >
                Task description
              </label>
              <div className="absolute top-3 right-0 flex items-center pr-3">
                {getInputIcon(getInputStatus('description'))}
              </div>
            </div>
            {touched.description && errors.description ? (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Provide a clear description of what students need to accomplish
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center min-w-[100px] shadow-sm hover:shadow transform hover:translate-y-[-1px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationModal;