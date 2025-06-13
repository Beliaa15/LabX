import React, { useEffect, useState } from 'react';
import Modal from '../../ui/Modal';
import { getAllTasks, assignTaskToCourse } from '../../../services/taskService';
import { CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';

const SelectTaskModal = ({ isOpen, onClose, onSelectTask, courseId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSelectedTaskId(null);
      setDueDate('');
      getAllTasks()
        .then(res => {
          setTasks(res.tasks || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load tasks:', err);
          showErrorAlert('Error', 'Failed to load tasks');
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleAssignTask = async (task) => {
    if (!courseId) {
      showErrorAlert('Error', 'No course selected');
      return;
    }

    if (!dueDate) {
      showErrorAlert('Error', 'Please select a due date');
      return;
    }

    setAssigning(true);

    try {
      await assignTaskToCourse(task._id, courseId, dueDate);
      showSuccessAlert('Success', 'Task assigned successfully!');
      if (onSelectTask) {
        onSelectTask(task);
      }
      onClose();
    } catch (err) {
      console.error('Failed to assign task:', err);
      showErrorAlert(
        'Error',
        err.response?.data?.error || err.response?.data?.message || 'Failed to assign task to course'
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task to Course">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={assigning}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-8">
          <LoadingSpinner size="lg" className="text-indigo-500 mb-2" />
          <span className="text-indigo-500 font-medium">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <CheckCircle className="w-10 h-10 text-gray-300 mb-2" />
          <span className="text-gray-500">No tasks available.</span>
        </div>
      ) : (
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {tasks.map(task => (
            <div
              key={task._id}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-primary text-lg truncate">{task.title}</div>
                <div className="text-sm text-secondary mt-1 line-clamp-2">{task.description}</div>
              </div>
              <button
                className={`mt-4 md:mt-0 md:ml-6 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg shadow transition-all duration-150 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  assigning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleAssignTask(task)}
                disabled={assigning}
              >
                {assigning ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default SelectTaskModal; 