import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Clock } from 'lucide-react';
import Modal from '../../ui/Modal';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Update Due Date
        </div>
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          </button>
          <button
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
    </Modal>
  );
};

export default UpdateDueDateModal;
