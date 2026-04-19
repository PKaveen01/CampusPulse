import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ProfileProvider } from './context/ProfileContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth pages
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import OAuth2RedirectPage from './pages/Auth/OAuth2RedirectPage'

// Home Page
import HomePage from './pages/HomePage'

// Dashboards
import UserDashboard from './pages/Dashboards/UserDashboard'
import AdminDashboard from './pages/Dashboards/AdminDashboard'
import TechnicianDashboard from './pages/Dashboards/TechnicianDashboard'
import ManagerDashboard from './pages/Dashboards/ManagerDashboard'

// Tickets Module
import TicketsPage from './pages/Tickets/TicketsPage'
import TicketSolvePage from './pages/Tickets/TicketSolvePage'

// Bookings Module
import BookingPage from './pages/Bookings/BookingPage'

// ========== MEMBER 1 - FACILITIES & ASSETS CATALOGUE MODULE ==========
import ResourceList from './pages/Resources/ResourceList'
import ResourceAnalytics from './components/resources/ResourceAnalytics'
import ResourceDetails from './pages/Resources/ResourceDetails'

// ========== MEMBER 4 - USER PROFILE MODULE ==========
import UserProfilePage from './pages/Profile/UserProfilePage'
import UserManagementPage from './pages/Admin/UserManagementPage'

// Stub pages (other members)
import {
  ResourcesPage, BookingsPage, AdminUsersPage,
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
        {/* ProfileProvider sits inside AuthProvider so it can call
            refetchUser() from AuthContext when the profile is updated. */}
        <ProfileProvider>
          <NotificationProvider>
            <Routes>
              {/* Public - Home Page (Root Route) */}
              <Route path="/" element={<HomePage />} />

              {/* Auth pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

              {/* Dashboard redirect */}
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

              {/* ========== MEMBER 4 - User Profile ========== */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />

              {/* ========== MODULE PAGES - ORDER MATTERS! ========== */}

              {/* Member 1 - Resource Analytics (most specific - MUST BE FIRST) */}
              <Route path="/resources/analytics" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <ResourceAnalytics onClose={() => {}} />
                </ProtectedRoute>
              } />

              {/* Member 1 - Resource Details by ID (specific - must come before /resources) */}
              <Route path="/resources/:id" element={
                <ProtectedRoute>
                  <ResourceDetails />
                </ProtectedRoute>
              } />

              {/* Member 1 - Resources List (general - must be LAST) */}
              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourceList />
                </ProtectedRoute>
              } />

              {/* Member 2 - Bookings Module */}
              <Route path="/bookings" element={
                <ProtectedRoute><BookingPage /></ProtectedRoute>
              } />

              {/* Member 3 - Tickets Module */}
              <Route path="/tickets" element={
                <ProtectedRoute><TicketsPage /></ProtectedRoute>
              } />
              <Route path="/tickets/new" element={
                <ProtectedRoute><TicketsPage /></ProtectedRoute>
              } />
              <Route path="/tickets/solve" element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><TicketSolvePage /></ProtectedRoute>
              } />

              {/* Admin Users Management */}
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}