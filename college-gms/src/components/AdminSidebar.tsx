import { NavLink } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './AdminSidebar.css'

interface AdminSidebarProps {
  onLogout?: () => void
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {

  // Read admin user from localStorage (set during admin login)
  const adminUserRaw = localStorage.getItem('adminUser')
  const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null
  const name = adminUser?.email || 'Admin'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <img src={logoImg} alt="Redress logo" className="sidebar-logo" />
        <div>
          <h2>Redress</h2>
          <p>Admin Panel</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin" end>
          <span className="material-icons-outlined">dashboard</span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/grievances">
          <span className="material-icons-outlined">description</span>
          Grievances
        </NavLink>
        <NavLink to="/admin/staff">
          <span className="material-icons-outlined">badge</span>
          Staff
        </NavLink>
        <NavLink to="/admin/profile">
          <span className="material-icons-outlined">settings</span>
          Settings
        </NavLink>

      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <h4>{name}</h4>
          <p>Super Admin</p>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="sidebar-logout-btn"
            title="Logout"
          >
            <span className="material-icons-outlined" style={{ fontSize: 20 }}>logout</span>
          </button>
        )}
      </div>
    </aside>
  )
}
