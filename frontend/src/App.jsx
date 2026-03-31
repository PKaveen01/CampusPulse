import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth pages
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import OAuth2RedirectPage from './pages/Auth/OAuth2RedirectPage'

// Dashboards
import UserDashboard from './pages/Dashboards/UserDashboard'
import AdminDashboard from './pages/Dashboards/AdminDashboard'
import TechnicianDashboard from './pages/Dashboards/TechnicianDashboard'
import ManagerDashboard from './pages/Dashboards/ManagerDashboard'

// ========== MEMBER 1 - FACILITIES & ASSETS CATALOGUE MODULE ==========
import ResourceList from './pages/Resources/ResourceList'
import ResourceAnalytics from './components/resources/ResourceAnalytics'  // ← ADD THIS

// Stub pages (other members)
import {
  BookingsPage, 
  TicketsPage, 
  AdminUsersPage,
} from './pages/Stubs'

// Smart redirect based on role
import { useAuth } from './context/AuthContext'

function DashboardRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  switch (user.role) {
    case 'ADMIN':      return <Navigate to="/dashboard/admin" replace />
    case 'TECHNICIAN': return <Navigate to="/dashboard/technician" replace />
    case 'MANAGER':    return <Navigate to="/dashboard/manager" replace />
    default:           return <Navigate to="/dashboard/user" replace />
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

            {/* Root redirect */}
            <Route path="/" element={
              <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
            } />

            {/* Role-specific dashboards */}
            <Route path="/dashboard/user" element={
              <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER', 'TECHNICIAN']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/technician" element={
              <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/manager" element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            {/* ========== MODULE PAGES ========== */}
            {/* Member 1 - Facilities & Assets Catalogue Module */}
            <Route path="/resources" element={
              <ProtectedRoute>
                <ResourceList />
              </ProtectedRoute>
            } />
            
            {/* Member 1 - Resource Analytics - MUST COME BEFORE /resources */}
            <Route path="/resources/analytics" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <ResourceAnalytics />
              </ProtectedRoute>
            } />
            
            {/* Member 2 - Bookings Module (stub) */}
            <Route path="/bookings" element={
              <ProtectedRoute><BookingsPage /></ProtectedRoute>
            } />
            
            {/* Member 3 - Tickets Module (stub) */}
            <Route path="/tickets" element={
              <ProtectedRoute><TicketsPage /></ProtectedRoute>
            } />
            
            {/* Admin Users Management */}
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}