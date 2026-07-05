import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Hash, Building2, Upload, GraduationCap, Briefcase,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { Button } from '@/components/ui/button';
import './AuthPages.css';

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [institutionalId, setInstitutionalId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const username = `${firstName} ${lastName}`.trim() || email.split('@')[0];

      const formData = new FormData();
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('institutional_id', institutionalId);
      
      if (department) {
        formData.append('department', department);
      }

      if (idPhoto) {
        formData.append('id_photo', idPhoto);
      }

      // We use the api instance, but we need to ensure the Content-Type is multipart/form-data
      // Axios will automatically set the correct boundary if we pass FormData
      await api.post('/auth/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Only auto-login students. Staff must verify email first.
      if (role === 'student') {
        const loginResponse = await api.post('/auth/login/', {
          email,
          password
        });

        if (loginResponse.data.access && loginResponse.data.refresh) {
          login({
            access: loginResponse.data.access,
            refresh: loginResponse.data.refresh
          });
        }
        
        // Redirect to home page after successful registration and login
        navigate('/');
      } else {
        // Staff registration
        alert('Registration successful! Please check your email to verify your account before you can log in.');
        navigate('/login');
      }
    } catch (err: any) {
      const serverError = err.response?.data;
      if (serverError) {
        // Format object errors into string
        const errorMessages = Object.values(serverError).flat().join(', ');
        setError(errorMessages || 'Registration failed.');
      } else {
        setError('An unexpected error occurred during registration.');
      }
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

      <div className="auth-container auth-container--wide">
        {/* Left panel */}
        <div className="auth-panel-left">
          <div className="auth-panel-left-content">
            <img src={logoImg} alt="Redress logo" className="auth-brand-logo" />
            <h1 className="auth-brand-title">Redress</h1>
            <p className="auth-brand-desc">
              Create your account and help make the campus a better place.
            </p>
            <div className="auth-brand-stats">
              <div className="auth-brand-stat">
                <span className="auth-brand-stat-val">1,200+</span>
                <span className="auth-brand-stat-lbl">Students Registered</span>
              </div>
              <div className="auth-brand-stat">
                <span className="auth-brand-stat-val">2.3d</span>
                <span className="auth-brand-stat-lbl">Avg. Resolution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-panel-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create your account</h2>
              <p className="auth-subtitle">
                Fill in your details to get started
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleRegister}>
              {/* Role selector */}
              <div className="auth-field">
                <label className="auth-label">I am registering as</label>
                <div className="auth-role-selector">
                  <button
                    type="button"
                    className={`auth-role-option ${role === 'student' ? 'auth-role-option--active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    <GraduationCap className="auth-role-icon" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    className={`auth-role-option ${role === 'staff' ? 'auth-role-option--active' : ''}`}
                    onClick={() => setRole('staff')}
                  >
                    <Briefcase className="auth-role-icon" />
                    <span>Staff</span>
                  </button>
                </div>
              </div>

              {/* Name row */}
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-first">First Name</label>
                  <div className="auth-input-wrapper">
                    <User className="auth-input-icon" />
                    <input 
                      id="reg-first" 
                      className="auth-input" 
                      type="text" 
                      placeholder="John" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-last">Last Name</label>
                  <div className="auth-input-wrapper">
                    <User className="auth-input-icon" />
                    <input 
                      id="reg-last" 
                      className="auth-input" 
                      type="text" 
                      placeholder="Doe" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-email">College Email</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    id="reg-email"
                    className="auth-input"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* ID & Department row */}
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-inst-id">Institutional ID</label>
                  <div className="auth-input-wrapper">
                    <Hash className="auth-input-icon" />
                    <input 
                      id="reg-inst-id" 
                      className="auth-input" 
                      type="text" 
                      placeholder={role === 'student' ? 'e.g. 2024012' : 'e.g. EMP883'} 
                      value={institutionalId}
                      onChange={(e) => setInstitutionalId(e.target.value)}
                      required
                    />
                  </div>
                  <span className="auth-hint">Must match your official ID. Kept private.</span>
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-dept">Department</label>
                  <div className="auth-input-wrapper auth-input-wrapper--select">
                    <Building2 className="auth-input-icon" />
                    <select 
                      id="reg-dept" 
                      className="auth-input auth-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    >
                      <option value="">Select Department</option>
                      <optgroup label="Academic Faculties">
                        <option value="cs">Computer Science</option>
                        <option value="ee">Electrical Engineering</option>
                        <option value="me">Mechanical Engineering</option>
                        <option value="bus">Business</option>
                        <option value="arts">Arts & Humanities</option>
                      </optgroup>
                      {role === 'staff' && (
                        <optgroup label="Staff Departments">
                          <option value="hr">Human Resources</option>
                          <option value="counseling">Counseling & Wellness</option>
                          <option value="it_support">IT Support</option>
                          <option value="facilities">Facilities Management</option>
                          <option value="finance">Finance</option>
                          <option value="registrar">Registrar's Office</option>
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* ID Photo */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-photo">ID Verification Photo</label>
                <label htmlFor="reg-photo" className="auth-file-upload">
                  <Upload className="auth-file-upload-icon" />
                  <span className="auth-file-upload-text">
                    {idPhoto ? idPhoto.name : `Upload your ${role === 'student' ? 'Student' : 'Staff'} ID photo`}
                  </span>
                  <input 
                    id="reg-photo" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setIdPhoto(e.target.files ? e.target.files[0] : null)}
                    className="auth-file-hidden"
                  />
                </label>
                <span className="auth-hint">Optional: a clear photo of your ID card.</span>
              </div>

              {/* Password row */}
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-pass">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-input-icon" />
                    <input
                      id="reg-pass"
                      className="auth-input auth-input--password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
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
                <div className="auth-field">
                  <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-input-icon" />
                    <input
                      id="reg-confirm"
                      className="auth-input auth-input--password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
              </div>

              {/* Terms */}
              <label className="auth-terms">
                <input type="checkbox" required className="auth-checkbox" />
                <span>
                  I agree to the <a href="#">Terms &amp; Conditions</a> and{' '}
                  <a href="#">Privacy Policy</a>
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight data-icon="inline-end" />}
              </Button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
