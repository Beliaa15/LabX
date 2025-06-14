import React from 'react';
import Modal from '../../ui/Modal';
import { Trophy, Star } from 'lucide-react';

const TaskCompletedModal = ({
  isOpen,
  onClose,
  grade,
  result
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Task Completed!"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Success Animation */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Grade and Result */}
        <div className="space-y-4">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Grade:</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{grade}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Result:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {typeof result === 'object' ? JSON.stringify(result) : String(result)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskCompletedModal; 