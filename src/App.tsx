import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/common/AdminRoute';

// Pages
import Home from '@/pages/Home';
import Events from '@/pages/Events';
import EventDetails from '@/pages/Events/EventDetails';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CreateEvent from '@/pages/CreateEvent';
import ManageEvents from '@/pages/ManageEvents';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';

// Loading Component
import { CircularProgress } from '@mui/material';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/events/:id" element={<Layout><EventDetails /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <Layout><CreateEvent /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-events"
          element={
            <ProtectedRoute>
              <Layout><ManageEvents /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout><Admin /></Layout>
            </AdminRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
};

export default App;