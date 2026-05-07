import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import UserSidebar from '../components/UserSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function UserDashboardLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showSidebar = true

  const handleResend = async () => {
    setResending(true)
    setResendMessage('')
    setResendError('')
    try {
      await api.post('/auth/resend-verification/')
      setResendMessage('Verification email sent! Check your inbox.')
    } catch (err: any) {
      setResendError(err.response?.data?.detail || 'Failed to resend email.')
    } finally {
      setResending(false)
    }
  }

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="dashboard-layout">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {user && !user.is_verified && (
        <div className="verification-banner">
          <div className="banner-content">
            <span className="material-icons-outlined banner-icon">warning</span>
            <div className="banner-text">
              <span className="banner-title">Account Not Verified</span>
              <span className="banner-desc">Please verify your email to unlock all features.</span>
            </div>
          </div>
          
          <div className="banner-actions">
            <button 
              onClick={handleResend} 
              disabled={resending}
              className="btn-verify"
            >
              {resending ? 'Sending...' : 'Verify Now'}
            </button>
            {resendMessage && <span className="banner-msg success">{resendMessage}</span>}
            {resendError && <span className="banner-msg error">{resendError}</span>}
          </div>
        </div>
      )}

      <div className="dashboard-body">
        <main className={`dashboard-main ${showSidebar ? 'has-sidebar' : ''}`}>
          <Outlet />
        </main>
        
        {showSidebar && (
          <>
            <div 
              className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
              onClick={() => setSidebarOpen(false)}
            />
            <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
              <UserSidebar />
            </div>
          </>
        )}
      </div>

      <style>{`
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--color-bg);
        }

        .dashboard-body {
          display: flex;
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .dashboard-main {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          transition: margin-right 0.3s ease;
          padding-bottom: 40px;
        }

        .dashboard-main.has-sidebar {
          margin-right: var(--sidebar-width);
        }

        .sidebar-wrapper {
          position: fixed;
          right: 0;
          top: var(--navbar-height);
          bottom: 0;
          width: var(--sidebar-width);
          z-index: 100;
          transition: transform 0.3s ease;
          background: var(--color-surface);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 90;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .verification-banner {
          background: linear-gradient(90deg, #f59209, #ea580c);
          color: white;
          padding: 12px 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          z-index: 101;
          box-shadow: 0 4px 15px rgba(245, 146, 11, 0.3);
          font-weight: 600;
        }

        .btn-verify {
          background: white;
          border: none;
          color: var(--color-primary);
          padding: 6px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .dashboard-main.has-sidebar {
            margin-right: 0;
          }

          .sidebar-wrapper {
            transform: translateX(100%);
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          }

          .sidebar-wrapper.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar-overlay.active {
            opacity: 1;
            pointer-events: auto;
          }
        }

        @media (max-width: 768px) {
          .verification-banner {
            flex-direction: column;
            gap: 12px;
            text-align: center;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}
