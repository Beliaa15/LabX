// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import Toaster from './components/ui/toaster';
import './index.css';
import XorTask from './components/Tasks/XorTask';

// Page imports
import Home from './components/Pages/Home';
import Dashboard from './components/Pages/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Auth/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import MyCourses from './components/Pages/MyCourses';
import Courses from './components/Pages/Courses';
import AdminPanal from './components/Pages/AdminPanal';
import About from './components/Pages/About';
import Features from './components/Pages/Features';

const App = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <Routes>
            {/* Public routes - redirect to dashboard if authenticated */}
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

            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/task/xor"
              element={
                <ProtectedRoute>
                  <XorTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                // edit to test admin panal for teacher
                <ProtectedRoute>
                  <AdminPanal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanal />
                </ProtectedRoute>
              }
            />

            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;