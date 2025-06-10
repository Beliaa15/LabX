import React from 'react';
import Modal from '../../ui/Modal';

const UpdateCourseModal = ({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  setCourseName,
  courseDescription,
  setCourseDescription
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Course"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="updateCourseName" className="block text-sm font-medium text-primary mb-1">
              Course Name
            </label>
            <input
              type="text"
              id="updateCourseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-4 py-2 border border-primary rounded-lg surface-primary text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="updateCourseDescription" className="block text-sm font-medium text-primary mb-1">
              Course Description
            </label>
            <textarea
              id="updateCourseDescription"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-primary rounded-lg surface-primary text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-primary rounded-lg text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Update Course
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateCourseModal;