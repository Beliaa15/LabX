import React, { useState } from 'react';
import { X } from 'lucide-react';

const UpdateTaskTitleModal = ({ isOpen, onClose, onUpdate, initialTitle, loading }) => {
  const [title, setTitle] = useState(initialTitle || '');

  React.useEffect(() => {
    setTitle(initialTitle || '');
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-primary mb-4">Update Task Title</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (title.trim()) onUpdate(title);
          }}
        >
          <div className="relative mb-4">
            <input
              type="text"
              id="updateTaskTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task Title"
              className="peer w-full px-4 py-3.5 border border-primary rounded-lg text-primary placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 surface-primary"
              required
              disabled={loading}
              autoFocus
            />
            <label
              htmlFor="updateTaskTitle"
              className="absolute left-4 -top-2.5 surface-primary px-1 text-sm text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400"
            >
              Task Title
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={loading || !title.trim()}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskTitleModal;
