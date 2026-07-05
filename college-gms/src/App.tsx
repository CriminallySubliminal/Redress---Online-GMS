import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import UserDashboardLayout from './layouts/UserDashboardLayout'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import SubmitGrievancePage from './pages/SubmitGrievancePage'
import MyGrievancesPage from './pages/MyGrievancesPage'
import GrievanceDetailPage from './pages/GrievanceDetailPage'
import StaffPage from './pages/StaffPage'
import StaffDashboardPage from './pages/StaffDashboardPage'
import FeedPage from './pages/FeedPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminGrievancesPage from './pages/admin/AdminGrievancesPage'
import AdminStaffPage from './pages/admin/AdminStaffPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Home Feed - Sidebar on right for auth users */}
      <Route element={user ? <UserDashboardLayout /> : <PublicLayout />}>
        <Route path="/" element={user ? <FeedPage /> : <LandingPage />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Authenticated User Dashboard */}
      <Route element={user ? <UserDashboardLayout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<MyGrievancesPage />} />
        <Route path="/submit" element={<SubmitGrievancePage />} />
        <Route path="/my-grievances" element={<Navigate to="/dashboard" />} />
        <Route path="/grievance/:id" element={<GrievanceDetailPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff-dashboard" element={<StaffDashboardPage />} />
        <Route path="/report-issue" element={<div style={{padding: '2rem'}}><h2>Report Problem</h2><p>System issue reporting coming soon...</p></div>} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin login: standalone, no layout guard */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin pages: guarded by AdminLayout (checks superuser token) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/grievances" element={<AdminGrievancesPage />} />
        <Route path="/admin/staff" element={<AdminStaffPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
