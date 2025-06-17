import React, { useState } from 'react';
import Modal from '../../ui/Modal';

const CreateCourseModal = ({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  setCourseName,
  courseDescription,
  setCourseDescription,
  userRole
}) => {
  const [errors, setErrors] = useState({ name: '', description: '' });

  const validateForm = () => {
    const newErrors = { name: '', description: '' };
    let isValid = true;

    // Validate name length (3-100 characters)
    if (courseName.length < 3 || courseName.length > 100) {
      newErrors.name = 'Name must be between 3 and 100 characters';
      isValid = false;
    }

    // Validate description length (10-500 characters)
    if (courseDescription.length < 10 || courseDescription.length > 500) {
      newErrors.description = 'Description must be between 10 and 500 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleClose = () => {
    setCourseName('');
    setCourseDescription('');
    setErrors({ name: '', description: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={userRole === 'admin' ? 'Create New Course' : 'Create Your Course'}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="Course Name"
              className={`peer w-full px-4 py-3.5 border ${
                errors.name ? 'border-red-500' : 'border-primary'
              } rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 ${
                errors.name ? 'focus:ring-red-500' : 'focus:ring-indigo-500 dark:focus:ring-indigo-400'
              } focus:border-transparent transition-all duration-200 surface-primary`}
              
            />
            <label
              htmlFor="courseName"
              className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm ${
                errors.name ? 'text-red-500' : 'text-secondary'
              } transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                errors.name ? 'peer-focus:text-red-500' : 'peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
              }`}
            >
              Course Name* (3-100 characters)
            </label>
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="relative">
            <textarea
              id="courseDescription"
              value={courseDescription}
              onChange={(e) => {
                setCourseDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="Course Description"
              rows="3"
              className={`peer w-full px-4 py-3.5 border ${
                errors.description ? 'border-red-500' : 'border-primary'
              } rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 ${
                errors.description ? 'focus:ring-red-500' : 'focus:ring-indigo-500 dark:focus:ring-indigo-400'
              } focus:border-transparent transition-all duration-200 surface-primary resize-none`}
              
            />
            <label
              htmlFor="courseDescription"
              className={`absolute left-4 -top-2.5 surface-primary px-1 text-sm ${
                errors.description ? 'text-red-500' : 'text-secondary'
              } transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm ${
                errors.description ? 'peer-focus:text-red-500' : 'peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400'
              }`}
            >
              Course Description* (10-500 characters)
            </label>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Create Course
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCourseModal;