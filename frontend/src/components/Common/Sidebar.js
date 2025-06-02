import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

/**
 * Reusable Sidebar component that handles both desktop and mobile sidebars
 * @param {Object} props - Component props
 * @param {boolean} props.mobileOpen - Whether mobile sidebar is open
 * @param {Function} props.setMobileOpen - Function to set mobile sidebar open state
 * @returns {React.ReactNode} - The sidebar component
 */
const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const { user, logout, isAdmin, isProfessor, isStudent } = useAuth();
    const { sidebarCollapsed, toggleSidebar } = useUI();

    const navigationLinks = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
            active: window.location.pathname === '/dashboard',
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
            active: window.location.pathname === '/profile',
        },
        ...(isAdmin() ? [
            {
                name: 'Admin Panel',
                href: '/admin',
                icon: (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                ),
                active: window.location.pathname === '/admin',
            },
        ] : []),
        ...(isProfessor() ? [
            {
                name: 'My Courses',
                href: '/courses',
                icon: (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                ),
                active: window.location.pathname === '/courses',
            },
        ] : []),
        ...(isStudent() ? [
            {
                name: 'My Courses',
                href: '/my-courses',
                icon: (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                ),
                active: window.location.pathname === '/my-courses',
            },
        ] : []),
    ];

    const renderSidebarContent = (isMobile = false) => (
      <>
        <div
          className={`flex-shrink-0 flex items-center px-4 h-16 ${
            isMobile ? '' : 'justify-between'
          }`}
        >
          {(!sidebarCollapsed || isMobile) && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              LabX
            </h1>
          )}
          {!isMobile && (
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-950"
              onClick={toggleSidebar}
            >
              <span className="sr-only">
                {sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar
              </span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    sidebarCollapsed
                      ? 'M13 5l7 7-7 7M5 5l7 7-7 7'
                      : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'
                  }
                />
              </svg>
            </button>
          )}
        </div>
        <nav
          className={`mt-5 flex-1 px-2 space-y-1 ${isMobile ? 'bg-white' : ''}`}
        >
          {navigationLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                item.active
                  ? isMobile
                    ? 'bg-gray-100 text-gray-900 '
                    : 'bg-indigo-100 text-indigo-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400'
              } group flex items-center py-2 text-sm font-medium rounded-md ${
                isMobile
                  ? 'px-2 py-2 text-base'
                  : sidebarCollapsed
                  ? 'px-2 justify-center'
                  : 'px-2'
              }`}
            >
              <span
                className={`${
                  isMobile
                    ? item.active
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                    : item.active
                    ? 'text-indigo-500'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-slate-400'
                } flex-shrink-0 h-6 w-6 ${
                  isMobile ? 'mr-4' : sidebarCollapsed ? 'mr-0' : 'mr-3'
                }`}
              >
                {item.icon}
              </span>
              {(!sidebarCollapsed || isMobile) && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4 dark:border-[#121212]">
          <button
            onClick={logout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <svg
              className={`flex-shrink-0 h-6 w-6 text-red-600 group-hover:text-red-700 ${
                isMobile ? 'mr-3' : sidebarCollapsed ? 'mr-0' : 'mr-2'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {(!sidebarCollapsed || isMobile) && <span>Sign out</span>}
          </button>
        </div>
      </>
    );

    return (
      <>
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 flex z-40 md:hidden ${
            mobileOpen ? 'block' : 'hidden'
          }`}
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              {renderSidebarContent(true)}
            </div>
          </div>
        </div>

        {/* Desktop sidebar - collapsible */}
        <div
          className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'md:w-16' : 'md:w-64'
          }`}
        >
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white dark:bg-[#2A2A2A] dark:border-[#121212]">
            {renderSidebarContent()}
          </div>
        </div>

        {/* Mobile sidebar toggle button - to be used in the header */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setMobileOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </>
    );
};

export default Sidebar; 