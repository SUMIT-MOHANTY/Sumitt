import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Dashboard placeholder
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || 'User'}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Home placeholder
const Home = () => {
  return (
    <div>
      <h1>Passport Booking System</h1>
      <p>Welcome to the passport booking system.</p>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
