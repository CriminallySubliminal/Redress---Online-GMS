import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { grievanceService } from '../services/grievanceService';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';
import './SubmitGrievancePage.css';

const priorities = ['Low', 'Medium', 'High', 'Critical'];

export default function SubmitGrievancePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.roles.some(r => r.role_name === 'staff' || r.role_name === 'admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await grievanceService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isLocationRequired = () => {
    if (!selectedCategoryId) return false;
    const category = categories.find(c => c.id === selectedCategoryId);
    if (!category) return false;
    const name = category.name.toLowerCase();
    return name.includes('infrastructure') || name.includes('hostel');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }
    if (!title || !description) {
      setError('Please provide a title and description');
      return;
    }
    if (isLocationRequired() && !location.trim()) {
      setError('Location is required for this category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create the grievance
      const grievance = await grievanceService.createGrievance({
        title,
        description,
        category: selectedCategoryId,
        priority: selectedPriority.toLowerCase() as any,
        is_anonymous: isAnonymous,
        is_public: isPublic,
        location: location.trim() || undefined,
      });

      // 2. Upload attachments if any
      if (files.length > 0) {
        await Promise.all(
          files.map(file => grievanceService.uploadAttachment(grievance.id, file))
        );
      }

      // 3. Redirect to My Issues
      navigate('/my-grievances');
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.detail || 'Failed to submit grievance. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('academic')) return 'school';
    if (nameLower.includes('infrastructure') || nameLower.includes('business')) return 'business';
    if (nameLower.includes('hostel') || nameLower.includes('apartment')) return 'apartment';
    if (nameLower.includes('cafeteria') || nameLower.includes('restaurant')) return 'restaurant';
    if (nameLower.includes('admin')) return 'admin_panel_settings';
    return 'more_horiz';
  };

  return (
    <div className="submit-page">
      <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>Submit a Grievance</h1>
      <p style={{ marginBottom: '24px' }}>Tell us about your concern — we're here to help resolve it.</p>

      {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      {user && !user.is_verified && (
        <div style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid var(--warning-color)', color: 'var(--warning-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-icons-outlined">error_outline</span>
          <span>You must verify your email address before you can submit a grievance. Please check your inbox.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Category */}
        <div className="submit-section">
          <h3>
            <span className="material-icons-outlined">category</span>
            Select Category
          </h3>
          {fetchingCategories ? (
            <p>Loading categories...</p>
          ) : (
            <div className="category-grid">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`category-option${selectedCategoryId === cat.id ? ' selected' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <span className="material-icons-outlined">{getCategoryIcon(cat.name)}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
              {categories.length === 0 && <p>No categories found. Contact admin.</p>}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="submit-section">
          <h3>
            <span className="material-icons-outlined">flag</span>
            Set Priority
          </h3>
          <p className="submit-hint">Priority helps us respond faster to critical issues.</p>
          <div className="priority-options" style={{ marginTop: 16 }}>
            {priorities.map(p => (
              <div
                key={p}
                className={`priority-option priority-${p.toLowerCase()}${selectedPriority === p ? ' selected' : ''}`}
                onClick={() => setSelectedPriority(p)}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="submit-section">
          <h3>
            <span className="material-icons-outlined">description</span>
            Describe Your Issue
          </h3>
          <div className="form-group">
            <label className="form-label" htmlFor="grievance-title">Title</label>
            <input
              id="grievance-title"
              className="form-input"
              type="text"
              placeholder="Brief summary of your issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label" htmlFor="grievance-desc">Description</label>
            <textarea
              id="grievance-desc"
              className="form-textarea"
              placeholder="Provide detailed information about your grievance..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label" htmlFor="grievance-location">
              Location of the problem (As exact as you can be) {isLocationRequired() ? <span style={{ color: 'red' }}>*</span> : '[OPTIONAL]'}
            </label>
            <input
              id="grievance-location"
              className="form-input"
              type="text"
              placeholder={isLocationRequired() ? "Exact location (Required)" : "e.g. Block C, 3rd Floor, Room 302"}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required={isLocationRequired()}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="submit-section">
          <h3>
            <span className="material-icons-outlined">attach_file</span>
            Attachments
          </h3>
          <div className="file-upload" style={{ padding: '20px' }} onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              multiple 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span className="material-icons-outlined" style={{ fontSize: 24, marginBottom: 0 }}>cloud_upload</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Click to browse or drag files here</span>
            </div>
          </div>
          
          {files.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.875rem' }}>{file.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <span className="material-icons-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy & Visibility */}
        <div className="submit-section">
          <h3>
            <span className="material-icons-outlined">security</span>
            Privacy & Visibility
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p className="form-label" style={{ marginBottom: '8px', fontSize: '0.75rem' }}>Identity Preference</p>
              <div className="selection-cards">
                <div 
                  className={`selection-card ${!isAnonymous ? 'selected' : ''}`}
                  onClick={() => setIsAnonymous(false)}
                >
                  <span className="material-icons-outlined">{!isAnonymous ? 'person' : 'person_outline'}</span>
                  <span className="selection-card-title">Identify Myself</span>
                  <span className="selection-card-desc">Name visible to staff.</span>
                </div>
                <div 
                  className={`selection-card ${isAnonymous ? 'selected' : ''}`}
                  onClick={() => setIsAnonymous(true)}
                >
                  <span className="material-icons-outlined">visibility_off</span>
                  <span className="selection-card-title">Remain Anonymous</span>
                  <span className="selection-card-desc">Identity hidden from everyone.</span>
                </div>
              </div>
            </div>

            <div>
              <p className="form-label" style={{ marginBottom: '8px', fontSize: '0.75rem' }}>Feed Visibility</p>
              <div className="selection-cards">
                <div 
                  className={`selection-card ${!isPublic ? 'selected' : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <span className="material-icons-outlined">lock</span>
                  <span className="selection-card-title">Private Issue</span>
                  <span className="selection-card-desc">Visible only to you and staff.</span>
                </div>
                <div 
                  className={`selection-card ${isPublic ? 'selected' : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <span className="material-icons-outlined">public</span>
                  <span className="selection-card-title">Public Feed</span>
                  <span className="selection-card-desc">Share with the student community.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="submit-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading || (user && !user.is_verified) ? true : false}
            style={{ opacity: (user && !user.is_verified) ? 0.5 : 1, cursor: (user && !user.is_verified) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>send</span>
                Submit Grievance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
