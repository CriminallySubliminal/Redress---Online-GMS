import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock } from 'lucide-react';
import api from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{type: 'error'|'success', text: string} | null>(null);
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{type: 'error'|'success', text: string} | null>(null);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await api.patch(`/accounts/users/${user.id}/`, {
        email,
        profile: {
          full_name: fullName
        }
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully. Please refresh the page to see changes globally.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await api.post('/accounts/users/change_password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.old_password?.[0] || 'Failed to change password. Please check your current password.';
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Account Settings</h1>
        <p>Manage your profile and security preferences</p>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">
          <User size={20} />
          Profile Information
        </h2>
        {profileMsg && (
          <div className={`profile-message ${profileMsg.type}`}>
            {profileMsg.text}
          </div>
        )}
        <form onSubmit={handleProfileSubmit}>
          <div className="profile-grid">
            <div className="profile-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="profile-input" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="profile-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="profile-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="profile-grid">
            <div className="profile-form-group">
              <label>Institutional ID</label>
              <input 
                type="text" 
                className="profile-input" 
                value={user.institutional_id || 'N/A'}
                disabled
              />
            </div>
            <div className="profile-form-group">
              <label>Department</label>
              <input 
                type="text" 
                className="profile-input" 
                value={user.profile?.department || 'N/A'}
                disabled
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label>Roles</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {user.roles.map(r => (
                <span key={r.id} className="badge badge-resolved">{r.role_name}</span>
              ))}
            </div>
          </div>

          <button type="submit" className="profile-btn" disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">
          <Lock size={20} />
          Security
        </h2>
        {passwordMsg && (
          <div className={`profile-message ${passwordMsg.type}`}>
            {passwordMsg.text}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit}>
          <div className="profile-form-group" style={{ maxWidth: '400px' }}>
            <label>Current Password</label>
            <input 
              type="password" 
              className="profile-input" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="profile-form-group" style={{ maxWidth: '400px' }}>
            <label>New Password</label>
            <input 
              type="password" 
              className="profile-input" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="profile-btn" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
