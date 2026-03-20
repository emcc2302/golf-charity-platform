/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import HomePage from './pages/public/HomePage';
import CharitiesPage from './pages/public/CharitiesPage';
import CharityDetailPage from './pages/public/CharityDetailPage';
import HowItWorksPage from './pages/public/HowItWorksPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ScoresPage from './pages/dashboard/ScoresPage';
import SubscribePage from './pages/dashboard/SubscribePage';
import DrawHistoryPage from './pages/dashboard/DrawHistoryPage';
import WinningsPage from './pages/dashboard/WinningsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SelectCharityPage from './pages/dashboard/SelectCharityPage';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminDrawsPage from './pages/admin/AdminDrawsPage';
import AdminCharitiesPage from './pages/admin/AdminCharitiesPage';
import AdminWinnersPage from './pages/admin/AdminWinnersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

import NotFoundPage from './pages/public/NotFoundPage';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/charities" element={<CharitiesPage />} />
      <Route path="/charities/:id" element={<CharityDetailPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />

      {/* Auth */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="scores" element={<ScoresPage />} />
        <Route path="subscribe" element={<SubscribePage />} />
        <Route path="draws" element={<DrawHistoryPage />} />
        <Route path="winnings" element={<WinningsPage />} />
        <Route path="charity" element={<SelectCharityPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
        <Route path="draws" element={<AdminDrawsPage />} />
        <Route path="charities" element={<AdminCharitiesPage />} />
        <Route path="winners" element={<AdminWinnersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111c30',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9rem'
            },
            success: { iconTheme: { primary: '#00e87a', secondary: '#070d1a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#070d1a' } }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
