import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Login from './components/Login';
import AdminInterface from './components/AdminInterface';
import GulayanStaffInterface from './components/GulayanStaffInterface';
import PrutasanStaffInterface from './components/PrutasanStaffInterface';
import BabuyanStaffInterface from './components/BabuyanStaffInterface';

const getDefaultRoute = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/gulayan/inventory';
    case 'Gulayan Staff':
      return '/gulayan-staff';
    case 'Prutasan Staff':
      return '/prutasan-staff';
    case 'Babuyan Staff':
      return '/babuyan-staff';
    default:
      return '/login';
  }
};

// 4.3 Admin Route Guard (Routes directly to Full Menu, No Dashboard)
const AdminRoute = ({ user, onLogout }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <AdminInterface user={user} onLogout={onLogout} />;
};

// 1.11 Gulayan Staff Route Guard
const GulayanStaffRoute = ({ user, onLogout }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Gulayan Staff') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <GulayanStaffInterface user={user} onLogout={onLogout} />;
};

// 2.11 Prutasan Staff Route Guard
const PrutasanStaffRoute = ({ user, onLogout }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Prutasan Staff') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <PrutasanStaffInterface user={user} onLogout={onLogout} />;
};

// 3.9 Babuyan Staff Route Guard
const BabuyanStaffRoute = ({ user, onLogout }) => {
  if (!user || user.status !== 'active') return <Navigate to="/login" replace />;
  if (user.role !== 'Babuyan Staff') return <Navigate to={getDefaultRoute(user.role)} replace />;
  return <BabuyanStaffInterface user={user} onLogout={onLogout} />;
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/auth/session');
        if (res.data?.user) {
          setCurrentUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    };

    verifySession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to={getDefaultRoute(currentUser.role)} replace />
            ) : (
              <Login onLoginSuccess={(user) => setCurrentUser(user)} />
            )
          }
        />
        <Route
          path="/admin/*"
          element={<AdminRoute user={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/gulayan-staff/*"
          element={<GulayanStaffRoute user={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/prutasan-staff/*"
          element={<PrutasanStaffRoute user={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="/babuyan-staff/*"
          element={<BabuyanStaffRoute user={currentUser} onLogout={handleLogout} />}
        />
        <Route
          path="*"
          element={
            <Navigate
              to={currentUser ? getDefaultRoute(currentUser.role) : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;