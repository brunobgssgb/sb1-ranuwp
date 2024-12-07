import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Customers } from './pages/Customers';
import { Applications } from './pages/Applications';
import { Codes } from './pages/Codes';
import { Sales } from './pages/Sales';
import { MyAccount } from './pages/MyAccount';
import { AdminUsers } from './pages/AdminUsers';
import { useAuthStore } from './store/authStore';
import { useStore } from './store/useStore';

export function App() {
  const { currentUser, initialize: initAuth } = useAuthStore();
  const { initialize: initStore } = useStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        await initAuth();
        if (currentUser) {
          await initStore();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, [initAuth, initStore, currentUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {currentUser && <Navigation />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          } />
          
          <Route path="/customers" element={
            <AuthGuard>
              <Customers />
            </AuthGuard>
          } />
          
          <Route path="/apps" element={
            <AuthGuard>
              <Applications />
            </AuthGuard>
          } />
          
          <Route path="/codes" element={
            <AuthGuard>
              <Codes />
            </AuthGuard>
          } />
          
          <Route path="/sales" element={
            <AuthGuard>
              <Sales />
            </AuthGuard>
          } />

          <Route path="/account" element={
            <AuthGuard>
              <MyAccount />
            </AuthGuard>
          } />

          <Route path="/admin/users" element={
            <AuthGuard>
              <AdminUsers />
            </AuthGuard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}