import React from 'react';
import Modal from '../../ui/Modal';
import { Loader2 } from 'lucide-react';

const AddStudentModal = ({
  isOpen,
  onClose,
  onSubmit,
  studentEmail,
  setStudentEmail,
  courseName,
  isLoading
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleClose = () => {
    setStudentEmail('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Student to ${courseName}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              id="studentEmail"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="Student Email"
              className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary"
              required
              disabled={isLoading}
            />
            <label
              htmlFor="studentEmail"
              className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
            >
              Student Email
            </label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Student</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddStudentModal;