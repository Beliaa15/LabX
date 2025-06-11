import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useDarkMode } from '../Common/useDarkMode';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import TaskCreationModal from '../Common/Modals/TaskCreationModal';

const TaskManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useUI();
  const { isDarkMode, handleToggle } = useDarkMode();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen surface-secondary">
      {/* Sidebar component handles both mobile and desktop sidebars */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main content */}
      <div
        className={`${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        } flex flex-col flex-1 transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <Header title="Task Management" />

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="animate-fadeIn space-y-6">
              {/* Welcome Section */}
              <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      Task Management
                    </h2>
                    <p className="mt-2 text-secondary">
                      Create and manage tasks for students.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">Create Task</span>
                  </button>
                </div>
              </div>

              {/* Task List Section */}
              <div className="surface-primary shadow-sm rounded-xl border border-primary">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-primary">
                    Available Tasks
                  </h3>
                </div>
                <div className="border-t border-primary">
                  {/* Task list will be implemented here */}
                  <div className="p-4 text-center text-secondary">
                    No tasks available. Create your first task!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TaskManagement; 