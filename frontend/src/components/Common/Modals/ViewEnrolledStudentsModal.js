import React from 'react';
import Modal from '../../ui/Modal';
import { UserMinus } from 'lucide-react';

const ViewStudentsModal = ({
  isOpen,
  onClose,
  courseName,
  students = [],
  onRemoveStudent,
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enrolled Students - ${courseName}`}
      maxWidth="max-w-md"
    >
      {students.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {students.map((student) => (
            <div
              key={student._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600"
            >
              <div>
                <div className="font-medium text-primary">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-sm text-muted">
                  {student.email}
                </div>
              </div>
              <button
                onClick={() => onRemoveStudent(student)}
                disabled={isLoading}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove student from course"
              >
                <UserMinus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted py-4">
          No students enrolled in this course
        </p>
      )}
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-secondary bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors border border-gray-300 dark:border-slate-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewStudentsModal;