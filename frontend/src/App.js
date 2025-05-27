// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import Toaster from './components/ui/toaster';
import './index.css';

// Page imports
import Home from './components/Pages/Home';
import Dashboard from './components/Pages/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Auth/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MyCourses from './components/Pages/MyCourses';
import Courses from './components/Pages/Courses';
import AdminPanal from './components/Pages/AdminPanal';

const App = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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

            {/* Fallback route */}
            <Route
              path="my-courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminPanal />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;