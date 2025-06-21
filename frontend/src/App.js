// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import Toaster from './components/ui/toaster';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
// import XorTask from './components/Tasks/XorTask';
import RoleBasedRoute from './components/Auth/RoleBasedRoute';

// Page imports
import Home from './components/Pages/Home';
import Dashboard from './components/Pages/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Auth/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import MyCourses from './components/Pages/MyCourses';
import CourseDashboard from './components/Pages/CourseDashboard';
import About from './components/Pages/About';
import Features from './components/Pages/Features';
import TaskManagement from './components/Pages/TaskManagement';
import TaskViewer from './components/Tasks/TaskViewer';
import Tasks from './components/Pages/Tasks';
import NotFound from './components/Common/NotFound';

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <UIProvider>
          <Router>
            <Routes>
              {/* Public routes - redirect to dashboard if  authenticated */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicRoute>
                    <About />
                  </PublicRoute>
                }
              />
              <Route
                path="/features"
                element={
                  <PublicRoute>
                    <Features />
                  </PublicRoute>
                }
              />
  
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
  
              {/* Student Course Routes */}
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['student']}  redirectTo="/courses">
                      <MyCourses />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-courses/:courseId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['student']}  redirectTo="/courses">
                      <MyCourses />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-courses/:courseId/folders/:folderId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['student']}  redirectTo="/courses">
                      <MyCourses />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
  
              {/* Student Course Task Route */}
              <Route
                path="/my-courses/:courseId/task/:taskId"
                element={
                  <ProtectedRoute>
                    <TaskViewer />
                  </ProtectedRoute>
                }
              />
  
              {/* Course routes */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['teacher', 'admin']}   redirectTo="/my-courses">
                      <CourseDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['teacher', 'admin']}   redirectTo="/my-courses">
                      <CourseDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/folders/:folderId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['teacher', 'admin']}   redirectTo="/my-courses">
                      <CourseDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
  
              {/* Course Task Route */}
              <Route
                path="/courses/:courseId/task/:taskId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['teacher', 'admin']}   redirectTo="/my-courses">
                      <TaskViewer />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
  
              {/* Tasks route */}            <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['student']}  redirectTo="/dashboard">
                      <Tasks />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/:taskId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['student']}  redirectTo="/dashboard">
                      <TaskViewer />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
  
              {/* Task Management Routes */}
              <Route
                path="/taskmanagement"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['admin']}  redirectTo="/dashboard">
                      <TaskManagement />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/taskmanagement/task/:taskId"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['admin']}  redirectTo="/dashboard">
                      <TaskViewer />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
  
              {/* Unified Task Viewer Route */}
              {/* <Route
                path="/tasks/:taskId"
                element={
                  <ProtectedRoute>
                    <TaskViewer />
                  </ProtectedRoute>
                }
              /> */}
  
              {/* Fallback for unknown routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </UIProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;