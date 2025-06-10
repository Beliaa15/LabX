import React from 'react';
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
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleClose = () => {
    setCourseName('');
    setCourseDescription('');
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
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course Name"
              className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary"
              required
            />
            <label
              htmlFor="courseName"
              className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
            >
              Course Name
            </label>
          </div>
          <div className="relative">
            <textarea
              id="courseDescription"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Course Description"
              rows="3"
              className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary resize-none"
            />
            <label
              htmlFor="courseDescription"
              className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
            >
              Course Description (Optional)
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
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