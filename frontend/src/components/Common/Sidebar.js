import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { useDarkMode } from "./useDarkMode";
import { cn } from "../../lib/utils";
import ToggleButton from "../ui/ToggleButton";
import {
  Home,
  User,
  Settings,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Reusable Sidebar component that handles both desktop and mobile sidebars
 * @param {Object} props - Component props
 * @param {boolean} props.mobileOpen - Whether mobile sidebar is open
 * @param {Function} props.setMobileOpen - Function to set mobile sidebar open state
 * @returns {React.ReactNode} - The sidebar component
 */
const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const { isDarkMode, handleToggle } = useDarkMode();
  const location = useLocation();

  const navigationLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      show: true,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      show: true,
    },
    {
      name: "Admin Panel",
      href: "/admin",
      icon: Settings,
      show: isAdmin(),
    },
    {
      name: "My Courses",
      href: "/courses",
      icon: BookOpen,
      show: isTeacher(),
    },
    {
      name: "My Courses",
      href: "/my-courses",
      icon: BookOpen,
      show: isStudent(),
    },
  ].filter((link) => link.show);

  const isActive = (href) => location.pathname === href;

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800",
          isMobile
            ? "justify-between"
            : sidebarCollapsed
            ? "justify-center"
            : "justify-between"
        )}
      >
        {(!sidebarCollapsed || isMobile) && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            LabX
          </h1>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationLinks.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                active
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
                  : "text-gray-700 dark:text-gray-300",
                sidebarCollapsed && !isMobile
                  ? "justify-center"
                  : "justify-start"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400",
                  (!sidebarCollapsed || isMobile) && "mr-3"
                )}
              />

              {(!sidebarCollapsed || isMobile) && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {isAdmin()
                  ? "Administrator"
                  : isTeacher()
                  ? "Teacher"
                  : "Student"}
              </p>
            </div>
          </div>
        )}

        {/* Dark mode toggle - only show in mobile */}
        {/* Dark mode toggle - only show in mobile */}
        {isMobile && (
          <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-3 mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </span>
            <ToggleButton
              isChecked={isDarkMode}
              onChange={handleToggle}
              className="ml-2"
            />
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors",
            sidebarCollapsed && !isMobile ? "justify-center" : "justify-start"
          )}
        >
          <LogOut
            className={cn(
              "w-5 h-5 flex-shrink-0",
              (!sidebarCollapsed || isMobile) && "mr-3"
            )}
          />
          {(!sidebarCollapsed || isMobile) && "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out z-40",
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-soft",
          sidebarCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-white dark:bg-gray-900 shadow-medium border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
};

export default Sidebar;
