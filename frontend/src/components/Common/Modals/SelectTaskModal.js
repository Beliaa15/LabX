import React, { useEffect, useState } from 'react';
import Modal from '../../ui/Modal';
import { getAllTasks, assignTaskToCourse } from '../../../services/taskService';
import { CheckCircle, Calendar, Clock, AlertCircle, Search } from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';

const SelectTaskModal = ({ isOpen, onClose, onSelectTask, courseId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Format the current date as YYYY-MM-DD for min date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSelectedTaskId(null);
      setDueDate('');
      setSearchQuery('');
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
      // Create a date object in Egypt timezone
      const dueDateObj = new Date(dueDate);
      
      // Convert to Egypt timezone (UTC+2) and add one more hour
      const egyptOffset = 3 * 60; // Egypt is UTC+2 plus 1 additional hour (3 hours total)
      const userOffset = dueDateObj.getTimezoneOffset(); // Get user's timezone offset in minutes
      const totalOffsetMinutes = userOffset + egyptOffset; // Calculate total offset
      
      // Adjust the date by adding the offset
      dueDateObj.setMinutes(dueDateObj.getMinutes() + totalOffsetMinutes);
      
      // Convert to ISO string for the API
      const adjustedDueDate = dueDateObj.toISOString();

      console.log('Assigning task with due date:', {
        originalDate: dueDate,
        adjustedDate: adjustedDueDate,
        deviceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offsetApplied: totalOffsetMinutes
      });

      await assignTaskToCourse(task._id, courseId, adjustedDueDate);
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

  const formatDueDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Cairo' // Egypt timezone
    });
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task to Course" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Due Date Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Set Due Date</h3>
            </div>
            {dueDate && (
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {formatDueDate(dueDate)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="date"
                min={today}
                value={dueDate ? dueDate.split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const currentTime = dueDate ? dueDate.split('T')[1] : '23:59';
                  setDueDate(`${newDate}T${currentTime}`);
                }}
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-colors"
                disabled={assigning}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <input
                type="time"
                value={dueDate ? dueDate.split('T')[1] : '23:59'}
                onChange={(e) => {
                  const currentDate = dueDate ? dueDate.split('T')[0] : today;
                  setDueDate(`${currentDate}T${e.target.value}`);
                }}
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-colors"
                disabled={assigning || !dueDate}
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Search and Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Select Task</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-colors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-12">
              <LoadingSpinner size="lg" className="text-indigo-500 mb-3" />
              <span className="text-indigo-500 font-medium">Loading tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-400" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredTasks.map(task => (
                <div
                  key={task._id}
                  onClick={() => setSelectedTaskId(task._id)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedTaskId === task._id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate pr-8">
                        {task.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    </div>
                    <div className={`absolute right-4 top-4 transition-opacity ${
                      selectedTaskId === task._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <CheckCircle className={`h-5 w-5 ${
                        selectedTaskId === task._id ? 'text-indigo-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  
                  {selectedTaskId === task._id && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignTask(task);
                        }}
                        disabled={!dueDate || assigning}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm"
                      >
                        {assigning ? (
                          <>
                            <LoadingSpinner size="sm" className="text-white" />
                            <span>Assigning...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Assign Task</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SelectTaskModal; 