// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import About from '../pages/content/About';
import Skills from '../pages/content/Skills';
import Projects from '../pages/content/Projects';
import Blogs from '../pages/content/Blogs';
import Testimonials from '../pages/content/Testimonials';
import Experience from '../pages/content/Experience';
import Services from '../pages/content/Services';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import MediaList from '../pages/media/MediaList';
import UploadMedia from '../pages/media/Upload';
import Messages from '../pages/content/Messages';
import Analytics
 from '../pages/content/Analytics';
// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('PublicRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="about" element={<About />} />
        <Route path="skills" element={<Skills />} />
        <Route path="projects" element={<Projects />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="experience" element={<Experience />} />
        <Route path="services" element={<Services />} />
        <Route path="messages" element={<Messages />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="media" element={<MediaList />} />
        <Route path="media/upload" element={<UploadMedia />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;