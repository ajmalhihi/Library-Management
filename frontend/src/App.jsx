import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminRentals from './pages/AdminRentals';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==========================================
              GUEST MODULE ROUTES
              ========================================== */}
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } 
          />

          {/* ==========================================
              USER MODULE ROUTES
              ========================================== */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/books" 
            element={
              <ProtectedRoute allowedRole="USER">
                <BookList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/books/:id" 
            element={
              <ProtectedRoute allowedRole="USER">
                <BookDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute allowedRole="USER">
                <History />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
              ADMIN MODULE ROUTES
              ========================================== */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/books" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminBooks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/rentals" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminRentals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminUsers />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
              WILD-CARD FALLBACK
              ========================================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
