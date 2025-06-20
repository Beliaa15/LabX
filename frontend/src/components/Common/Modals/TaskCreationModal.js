import React, { useState } from 'react';
import { Calendar, FileText, Loader2, Plus } from 'lucide-react';
import Modal from '../../ui/Modal';
import { createTask } from '../../../services/taskService';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';

const TaskCreationModal = ({ isOpen, onClose, courseId, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    taskFile: null
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showErrorAlert('Error', 'Task title is required');
      return;
    }

    setIsCreating(true);
    try {
      const taskData = new FormData();
      taskData.append('title', formData.title);
      taskData.append('description', formData.description);
      taskData.append('dueDate', formData.dueDate);
      taskData.append('courseId', courseId);
      
      if (formData.taskFile) {
        taskData.append('taskFile', formData.taskFile);
      }

      await createTask(taskData);
      showSuccessAlert('Success', 'Task created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        taskFile: null
      });
      
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create New Task
        </div>
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter task description"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 ${
              isCreating ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isCreating ? 'Creating...' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskCreationModal;