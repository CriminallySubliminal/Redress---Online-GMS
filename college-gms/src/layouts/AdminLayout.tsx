import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import adminApi from '../services/adminApi'

export default function AdminLayout() {
  const [authorized, setAuthorized] = useState<boolean | null>(null) // null = loading

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const token = localStorage.getItem('adminAccessToken')
    if (!token) {
      setAuthorized(false)
      return
    }

    try {
      // Verify the token is still valid by hitting a protected admin endpoint
      await adminApi.get('/admin/analytics/')
      setAuthorized(true)
    } catch {
      // Token expired or invalid
      localStorage.removeItem('adminAccessToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminUser')
      setAuthorized(false)
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminUser')
    setAuthorized(false)
  }

  if (authorized === null) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-muted)',
        fontSize: '0.9rem'
      }}>
        Verifying admin session...
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar onLogout={handleAdminLogout} />
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        background: 'var(--color-bg)',
        padding: '32px',
        overflow: 'auto',
      }}>
        <Outlet />
      </main>
    </div>
  )
}

