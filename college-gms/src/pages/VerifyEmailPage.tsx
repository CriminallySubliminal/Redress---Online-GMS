import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const { fetchUser, login } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email/', { token });
        setStatus('success');
        setMessage(response.data.detail || 'Email verified successfully!');
        
        // If tokens are provided (auto-login for staff), use them
        if (response.data.tokens) {
          login(response.data.tokens);
        } else {
          // Update user state if already logged in (for students)
          await fetchUser();
        }
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Failed to verify email. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, [searchParams, fetchUser, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        {status === 'verifying' && (
          <>
            <span className="material-icons-outlined" style={{ fontSize: 48, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'block' }}>
              hourglass_empty
            </span>
            <h2 style={{ marginBottom: '1rem' }}>Verifying Email</h2>
            <p className="auth-subtitle">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <span className="material-icons-outlined" style={{ fontSize: 48, color: 'var(--success-color)', marginBottom: '1rem', display: 'block' }}>
              check_circle
            </span>
            <h2 style={{ marginBottom: '1rem' }}>Success!</h2>
            <p className="auth-subtitle">{message}</p>
            <p style={{ marginTop: '2rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Redirecting you to dashboard...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <span className="material-icons-outlined" style={{ fontSize: 48, color: 'var(--error-color)', marginBottom: '1rem', display: 'block' }}>
              error_outline
            </span>
            <h2 style={{ marginBottom: '1rem' }}>Verification Failed</h2>
            <p className="auth-error" style={{ marginBottom: '2rem' }}>{message}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/')}
              style={{ width: '100%' }}
            >
              Go to Home Page
            </button>
          </>
        )}
      </div>
    </div>
  );
}
