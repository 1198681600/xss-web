import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProjectDashboard from './components/ProjectDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Loading } from './components/ui';
import './App.css';

function App() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-dark)'
      }}>
        <Loading />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <LoginPage />
        } 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {isAdmin() ? <AdminDashboard /> : <ProjectDashboard />}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/unauthorized" 
        element={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'var(--bg-dark)',
            color: 'var(--text-primary)',
            textAlign: 'center'
          }}>
            <h1>⚠️ 权限不足</h1>
            <p>您没有访问此页面的权限</p>
            <button 
              onClick={() => window.history.back()}
              style={{
                padding: '0.5rem 1rem',
                marginTop: '1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              返回
            </button>
          </div>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;