import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';

import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingsPage from './pages/BookingsPage';
import SearchPage from './pages/SearchPage';
import SlotCreation from './pages/admin/SlotCreation';
import { useAuth } from './hooks/useAuth';

// Auth guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin guard for admin-only routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'bookings',
        element: <ProtectedRoute><BookingsPage /></ProtectedRoute>
      },
      {
        path: 'search',
        element: <SearchPage />
      },
      // Admin routes
      {
        path: 'admin',
        children: [
          {
            path: 'slots',
            element: <AdminRoute><SlotCreation /></AdminRoute>
          }
        ]
      },
      { path: '*', element: <Navigate to="/" replace /> }
    ],
  },
];

export const router = createBrowserRouter(routes);

export default routes;
