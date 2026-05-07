import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { Button } from '@/components/ui/button';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', { email, password });
      login({
        access: response.data.access,
        refresh: response.data.refresh,
      });
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Failed to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Ambient background */}
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />
      <div className="auth-bg-grid" />

      <div className="auth-container">
        {/* Left panel — branding */}
        <div className="auth-panel-left">
          <div className="auth-panel-left-content">
            <img src={logoImg} alt="Redress logo" className="auth-brand-logo" />
            <h1 className="auth-brand-title">Redress</h1>
            <p className="auth-brand-desc">
              Accountability Through Action — empowering student voices through
              transparency and real results.
            </p>
            <div className="auth-brand-stats">
              <div className="auth-brand-stat">
                <span className="auth-brand-stat-val">1,247</span>
                <span className="auth-brand-stat-lbl">Issues Filed</span>
              </div>
              <div className="auth-brand-stat">
                <span className="auth-brand-stat-val">94%</span>
                <span className="auth-brand-stat-lbl">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-panel-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Welcome back</h2>
              <p className="auth-subtitle">
                Sign in to continue to your dashboard
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    id="login-email"
                    className="auth-input"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="login-password">Password</label>
                  <a href="#" className="auth-forgot">Forgot password?</a>
                </div>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    id="login-password"
                    className="auth-input auth-input--password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="auth-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                {!loading && <ArrowRight data-icon="inline-end" />}
              </Button>
            </form>

            <div className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
