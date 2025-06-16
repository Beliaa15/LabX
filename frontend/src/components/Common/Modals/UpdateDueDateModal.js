import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Clock } from 'lucide-react';
import { updateTaskDueDate } from '../../../services/taskService';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';

const UpdateDueDateModal = ({ isOpen, onClose, task, courseId, onUpdate }) => {
  const [dueDate, setDueDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current date in Egypt timezone for min date
  const today = new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
  const minDate = new Date(today).toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen && task) {
      // Find task's current due date for the course
      const courseTaskData = task.courseTasks?.find(ct => ct.course === courseId);
      if (courseTaskData?.dueDate) {
        // Convert to local datetime-local format
        const date = new Date(courseTaskData.dueDate);
        const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
        const formattedDate = localDate.toISOString().slice(0, 16);
        setDueDate(formattedDate);
      }
    }
  }, [isOpen, task, courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dueDate) {
      showErrorAlert('Error', 'Please select a due date');
      return;
    }

    setIsUpdating(true);
    try {
      // Create a date object and handle timezone conversion
      const dueDateObj = new Date(dueDate);
      const adjustedDueDate = dueDateObj.toISOString();

      console.log('Updating task due date:', {
        originalDate: dueDate,
        adjustedDate: adjustedDueDate,
        deviceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      await updateTaskDueDate(task._id, courseId, adjustedDueDate);
      showSuccessAlert('Success', 'Task due date updated successfully');
      onUpdate(); // Refresh the tasks list
      onClose();
    } catch (error) {
      console.error('Failed to update task due date:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to update task due date');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Update Due Date
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Due Date (Egypt Time)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="dueDate"
                required
                min={minDate}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>            <button
              type="submit"
              disabled={isUpdating}
              className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2 ${
                isUpdating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isUpdating ? 'Updating...' : 'Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDueDateModal;
