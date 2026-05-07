import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.png'
import './Navbar.css'

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          {user && (
            <button 
              className="mobile-toggle" 
              onClick={onToggleSidebar}
              aria-label="Toggle Menu"
            >
              <span className="material-icons-outlined">menu</span>
            </button>
          )}
          <Link to="/" className="navbar-brand">
            <img src={logoImg} alt="Redress logo" className="brand-logo" />
            <span className="brand-name">Redress</span>
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <NavLink to="/" end>
              <span className="material-icons-outlined" style={{ fontSize: 18 }}>home</span>
              Home
            </NavLink>
          </li>
          {user && (() => {
            const isStaff = user.roles?.some(r => r.role_name === 'staff' || r.role_name === 'admin');
            
            if (isStaff) {
              return (
                <li>
                  <NavLink to="/staff-dashboard">
                    <span className="material-icons-outlined" style={{ fontSize: 18 }}>dashboard</span>
                    Dashboard
                  </NavLink>
                </li>
              );
            }
            
            return (
              <>
                <li>
                  <NavLink to="/submit">
                    <span className="material-icons-outlined" style={{ fontSize: 18 }}>edit_note</span>
                    Submit Grievance
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard">
                    <span className="material-icons-outlined" style={{ fontSize: 18 }}>list_alt</span>
                    My Issues
                  </NavLink>
                </li>
              </>
            );
          })()}
        </ul>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            <span className="material-icons-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          {user ? (
            <div className="user-actions">
              <span className="user-name">
                {user.profile?.full_name || user.email}
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm logout-btn">
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>logout</span>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
