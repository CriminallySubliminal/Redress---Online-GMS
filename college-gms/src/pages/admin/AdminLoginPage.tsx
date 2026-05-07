import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import logoImg from '../../assets/logo.png'
import api from '../../services/api'
import './AdminLoginPage.css'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/admin/login/', { email, password })

      // Store admin tokens separately so they don't interfere with the user session
      localStorage.setItem('adminAccessToken', res.data.access)
      localStorage.setItem('adminRefreshToken', res.data.refresh)
      localStorage.setItem('adminUser', JSON.stringify(res.data.user))

      navigate('/admin')
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      {/* Background effects */}
      <div className="admin-login-bg" />

      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={logoImg} alt="Redress logo" className="admin-login-logo" />
          <h1>Redress</h1>
          <p className="admin-login-badge">
            <ShieldCheck size={14} />
            Admin Portal
          </p>
        </div>

        <div className="admin-login-divider" />

        <h2 className="admin-login-title">Sign in as Administrator</h2>
        <p className="admin-login-subtitle">
          Only superuser accounts can access this portal.
        </p>

        {error && (
          <div className="admin-login-error">
            <span className="material-icons-outlined" style={{ fontSize: 18 }}>error_outline</span>
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email</label>
            <div className="admin-login-input-wrap">
              <Mail size={18} className="admin-login-input-icon" />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-login-input-wrap">
              <Lock size={18} className="admin-login-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-submit"
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        <p className="admin-login-footer">
          This portal is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  )
}
